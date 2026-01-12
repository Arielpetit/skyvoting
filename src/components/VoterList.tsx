import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";
import { formatUserName } from "@/lib/utils";

interface PublicVoter {
    user_email: string;
    user_full_name: string | null;
    vote_created_at: string;
}

export const VoterList = () => {
    const [voters, setVoters] = useState<PublicVoter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVoters = async () => {
        try {
            const { data, error } = await supabase.rpc("get_public_voters");

            if (error) throw error;

            setVoters(data || []);
        } catch (err) {
            console.error("Error fetching voters:", err);
            setError("Failed to load voter list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVoters();

        // Subscribe to new votes to update the list in real-time
        const channel = supabase
            .channel("public-voters")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "votes",
                },
                () => {
                    fetchVoters();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading voters...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-6 text-center text-destructive">
                    {error}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/10 shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    Who Voted
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Voter Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {voters.length > 0 ? (
                            voters.map((voter, index) => (
                                <TableRow key={index} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        {formatUserName(voter.user_email, voter.user_full_name)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {voter.user_email}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-sm">
                                        {new Date(voter.vote_created_at).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                    No votes have been cast yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
