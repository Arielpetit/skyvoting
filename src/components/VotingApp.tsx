import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ParticipantCard } from "./ParticipantCard";
import { generateFingerprint } from "@/lib/fingerprint";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Vote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Participant {
  id: string;
  name: string;
  avatar_url: string | null;
  votes: number;
}

const STORAGE_KEY_HAS_VOTED = "voting_app_has_voted";
const STORAGE_KEY_VOTED_FOR = "voting_app_voted_for";
const STORAGE_KEY_VOTED_NAME = "voting_app_voted_name";

export const VotingApp = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedForId, setVotedForId] = useState<string | null>(null);
  const [votedForName, setVotedForName] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const { toast } = useToast();

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_HAS_VOTED);
    const storedId = localStorage.getItem(STORAGE_KEY_VOTED_FOR);
    const storedName = localStorage.getItem(STORAGE_KEY_VOTED_NAME);

    if (stored === "true" && storedId) {
      setHasVoted(true);
      setVotedForId(storedId);
      setVotedForName(storedName);
    }
  }, []);

  // Generate fingerprint
  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  // Fetch participants
  useEffect(() => {
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .order("votes", { ascending: false });

      if (error) {
        console.error("Error fetching participants:", error);
        toast({
          title: "Error",
          description: "Failed to load participants",
          variant: "destructive",
        });
      } else {
        setParticipants(data || []);
      }
      setLoading(false);
    };

    fetchParticipants();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("participants-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
        },
        () => {
          // Refetch on any change
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleVote = async (participantId: string) => {
    if (hasVoted || !fingerprint || isVoting) return;

    setIsVoting(true);

    try {
      const response = await supabase.functions.invoke("vote", {
        body: {
          participant_id: participantId,
          device_fingerprint: fingerprint,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (data.error === "already_voted") {
        // Server says we already voted - update local state
        localStorage.setItem(STORAGE_KEY_HAS_VOTED, "true");
        localStorage.setItem(STORAGE_KEY_VOTED_FOR, data.participant_id);
        setHasVoted(true);
        setVotedForId(data.participant_id);
        toast({
          title: "Already Voted",
          description: "This device has already cast a vote.",
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        // Store vote in localStorage
        localStorage.setItem(STORAGE_KEY_HAS_VOTED, "true");
        localStorage.setItem(STORAGE_KEY_VOTED_FOR, participantId);
        localStorage.setItem(STORAGE_KEY_VOTED_NAME, data.participant_name);

        setHasVoted(true);
        setVotedForId(participantId);
        setVotedForName(data.participant_name);

        toast({
          title: "Vote Recorded!",
          description: `Thank you for voting for ${data.participant_name}`,
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Vote className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Voting System</h1>
          </div>
          <p className="text-muted-foreground">
            {hasVoted
              ? "Thank you for participating!"
              : "Select a participant to cast your vote"}
          </p>
        </div>

        {/* Thank You Message */}
        {hasVoted && votedForName && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 p-6">
              <CheckCircle2 className="h-10 w-10 text-primary shrink-0" />
              <div>
                <h2 className="font-semibold text-foreground text-lg">
                  Thank you for voting!
                </h2>
                <p className="text-muted-foreground">
                  You voted for <span className="font-medium text-foreground">{votedForName}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants List */}
        <div className="space-y-3">
          {participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              id={participant.id}
              name={participant.name}
              avatarUrl={participant.avatar_url}
              votes={participant.votes}
              hasVoted={hasVoted}
              votedForThis={votedForId === participant.id}
              onVote={handleVote}
              isVoting={isVoting}
            />
          ))}
        </div>

        {participants.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No participants available yet.
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Each device is allowed only one vote
        </p>
      </div>
    </div>
  );
};
