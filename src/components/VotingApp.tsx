import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ParticipantCard } from "./ParticipantCard";
import { ResultsChart } from "./ResultsChart";
import { CountdownTimer } from "./CountdownTimer";
import { generateFingerprint } from "@/lib/fingerprint";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Vote, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Participant {
  id: string;
  name: string;
  avatar_url: string | null;
  votes: number;
}

const STORAGE_KEY_HAS_VOTED = "voting_app_has_voted";
const STORAGE_KEY_VOTED_FOR = "voting_app_voted_for";
const STORAGE_KEY_VOTED_NAME = "voting_app_voted_name";

// Set deadline to 7 days from now (you can customize this)
const VOTING_DEADLINE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export const VotingApp = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedForId, setVotedForId] = useState<string | null>(null);
  const [votedForName, setVotedForName] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
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

    // Check if already expired
    if (new Date() > VOTING_DEADLINE) {
      setIsExpired(true);
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
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleDeadlineExpired = useCallback(() => {
    setIsExpired(true);
    toast({
      title: "Voting Closed",
      description: "The voting period has ended.",
    });
  }, [toast]);

  const handleVote = async (participantId: string) => {
    if (hasVoted || !fingerprint || isVoting || isExpired) return;

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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  const votingDisabled = hasVoted || isExpired;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Vote className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Voting System
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isExpired
              ? "Voting has closed. See the final results below."
              : hasVoted
              ? "Thank you for participating!"
              : "Select a participant to cast your vote"}
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="mb-6">
          <CountdownTimer deadline={VOTING_DEADLINE} onExpired={handleDeadlineExpired} />
        </div>

        {/* Thank You Message */}
        {hasVoted && votedForName && (
          <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 overflow-hidden relative">
            <div className="absolute top-2 right-2">
              <Sparkles className="h-5 w-5 text-primary/30" />
            </div>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-lg">
                  Thank you for voting!
                </h2>
                <p className="text-muted-foreground">
                  You voted for{" "}
                  <span className="font-medium text-foreground">{votedForName}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Participants and Results */}
        <Tabs defaultValue="vote" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="vote">Participants</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="vote" className="space-y-3">
            {participants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                id={participant.id}
                name={participant.name}
                avatarUrl={participant.avatar_url}
                votes={participant.votes}
                hasVoted={votingDisabled}
                votedForThis={votedForId === participant.id}
                onVote={handleVote}
                isVoting={isVoting}
              />
            ))}

            {participants.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No participants available yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results">
            <ResultsChart participants={participants} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Each device is allowed only one vote • Results update in real-time
        </p>
      </div>
    </div>
  );
};
