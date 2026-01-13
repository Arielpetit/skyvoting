import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { List } from "@/types";

export interface VoterInfo {
    email: string;
    full_name: string | null;
    voted_at: string;
    list_name: string;
}

export interface AbsenceInfo {
    email: string;
    full_name: string | null;
}

export interface ReportData {
    totalEligible: number;
    totalVotes: number;
    voters: VoterInfo[];
    absences: AbsenceInfo[];
    votesPerList: { name: string; count: number; percentage: number }[];
    winner: { name: string; count: number; percentage: number } | null;
    loading: boolean;
    error: string | null;
}

export const useReport = () => {
    const [data, setData] = useState<ReportData>({
        totalEligible: 0,
        totalVotes: 0,
        voters: [],
        absences: [],
        votesPerList: [],
        winner: null,
        loading: true,
        error: null,
    });

    const fetchReportData = async () => {
        try {
            setData((prev) => ({ ...prev, loading: true }));

            // 1. Fetch total eligible voters
            const { count: eligibleCount, error: eligibleError } = await supabase
                .from("eligible_voters")
                .select("*", { count: "exact", head: true });

            if (eligibleError) throw eligibleError;

            // 2. Fetch all votes with voter and list info
            const { data: votesData, error: votesError } = await supabase
                .from("votes")
                .select(`
          created_at,
          list_id,
          lists (name),
          user_id
        `);

            if (votesError) throw votesError;

            // Since we need user emails/names, and votes only has user_id, 
            // we'll use the get_public_voters RPC or join with auth.users if possible.
            // However, direct join with auth.users is restricted. 
            // Let's use get_public_voters but we also need the list_id/name.

            const { data: publicVoters, error: publicVotersError } = await supabase.rpc("get_public_voters");
            if (publicVotersError) throw publicVotersError;

            // Map public voters to include list name by matching timestamps (a bit hacky but works if timestamps are unique enough)
            // Better: Create a new RPC or view that includes list info.
            // For now, let's assume get_public_voters is enough for the "Who Voted" list, 
            // and we'll use lists table for the breakdown.

            // 3. Fetch absences
            const { data: absencesData, error: absencesError } = await supabase.rpc("get_absences");
            if (absencesError) throw absencesError;

            // 4. Fetch lists for breakdown
            const { data: listsData, error: listsError } = await supabase
                .from("lists")
                .select("name, votes")
                .order("votes", { ascending: false });

            if (listsError) throw listsError;

            const totalVotes = listsData?.reduce((sum, l) => sum + l.votes, 0) || 0;
            const votesPerList = listsData?.map((l) => ({
                name: l.name,
                count: l.votes,
                percentage: totalVotes > 0 ? (l.votes / totalVotes) * 100 : 0,
            })) || [];

            const winner = votesPerList.length > 0 && votesPerList[0].count > 0 ? votesPerList[0] : null;

            setData({
                totalEligible: eligibleCount || 0,
                totalVotes,
                voters: publicVoters?.map((v: any) => ({
                    email: v.user_email,
                    full_name: v.user_full_name,
                    voted_at: v.vote_created_at,
                    list_name: votesData?.find((vd: any) => vd.created_at === v.vote_created_at)?.lists?.name || "Unknown",
                })) || [],
                absences: absencesData || [],
                votesPerList,
                winner,
                loading: false,
                error: null,
            });
        } catch (err: any) {
            console.error("Error fetching report data:", err);
            setData((prev) => ({ ...prev, loading: false, error: err.message }));
        }
    };

    useEffect(() => {
        fetchReportData();

        // Realtime updates
        const channel = supabase
            .channel("report-updates")
            .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, () => fetchReportData())
            .on("postgres_changes", { event: "*", schema: "public", table: "eligible_voters" }, () => fetchReportData())
            .on("postgres_changes", { event: "*", schema: "public", table: "lists" }, () => fetchReportData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { ...data, refetch: fetchReportData };
};
