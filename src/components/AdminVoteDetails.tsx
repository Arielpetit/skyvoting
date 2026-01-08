import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

interface DetailedVote {
  vote_id: string;
  participant_name: string;
  user_email: string;
  user_full_name: string | null;
  vote_created_at: string;
}

export const AdminVoteDetails = () => {
  const [votes, setVotes] = useState<DetailedVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoteDetails = async () => {
      try {
        const { data, error } = await supabase.rpc("get_detailed_votes");

        if (error) throw error;

        setVotes(data || []);
      } catch (err) {
        console.error("Error fetching vote details:", err);
        setError("Failed to load vote details. Make sure the database view is created and permissions are set.");
      } finally {
        setLoading(false);
      }
    };

    fetchVoteDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading vote details...</span>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Admin Panel: Detailed Votes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voter</TableHead>
              <TableHead>Voted For</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {votes.length > 0 ? (
              votes.map((vote) => (
                <TableRow key={vote.vote_id}>
                  <TableCell>
                    <div className="font-medium">{vote.user_full_name || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{vote.user_email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{vote.participant_name}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(vote.vote_created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
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