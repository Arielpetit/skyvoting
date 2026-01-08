import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ParticipantCard } from "./ParticipantCard";
import { ResultsChart } from "./ResultsChart";
import { CountdownTimer } from "./CountdownTimer";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Vote, Sparkles, LogOut, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddParticipantForm } from "./AddParticipantForm";
import { Plus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

interface Participant {
  id: string;
  name: string;
  avatar_url: string | null;
  votes: number;
}

// Set deadline to 7 days from now (you can customize this)
const VOTING_DEADLINE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export const VotingApp = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedForName, setVotedForName] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const isAdmin = !!user?.email && !!import.meta.env.VITE_ADMIN_EMAIL && user.email === import.meta.env.VITE_ADMIN_EMAIL;

  // Check if user has voted
  useEffect(() => {
    if (!user) return;

    const checkVote = async () => {
      const { data, error } = await supabase
        .from("votes")
        .select("participant_id, participants(name)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setHasVoted(true);
        // @ts-ignore - Supabase types might verify this, but for now assuming join works
        setVotedForName(data.participants?.name || "a participant");
      }
    };

    checkVote();
  }, [user]);

  // Check deadline
  useEffect(() => {
    if (new Date() > VOTING_DEADLINE) {
      setIsExpired(true);
    }
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
    if (hasVoted || isVoting || isExpired || !user) return;

    setIsVoting(true);

    try {
      const { error } = await supabase.from("votes").insert({
        participant_id: participantId,
        user_id: user.id,
      });

      if (error) {
        if (error.code === "23505") { // Unique violation
          setHasVoted(true);
          toast({
            title: "Already Voted",
            description: "You have already cast a vote.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        setHasVoted(true);
        const participant = participants.find((p) => p.id === participantId);
        setVotedForName(participant?.name || "a participant");

        toast({
          title: "Vote Recorded!",
          description: `Thank you for voting for ${participant?.name}`,
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
        {/* Header with User Profile */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SkyEngPro Logo" className="h-12 object-contain" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border shadow-sm hover:bg-muted transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title Section */}
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

        {/* Add Participant Toggle - Only for Admin */}
        {isAdmin && (
          <div className="mb-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
            >
              {showAddForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel Adding
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Participant
                </>
              )}
            </Button>
          </div>
        )}

        {/* Add Participant Form - Only for Admin */}
        {isAdmin && showAddForm && (
          <div className="mb-8">
            <AddParticipantForm />
          </div>
        )}

        {/* Countdown Timer */}
        <div className="mb-6">
          <CountdownTimer deadline={VOTING_DEADLINE} onExpired={handleDeadlineExpired} />
        </div>

        {/* Thank You Message */}
        {hasVoted && (
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
                votedForThis={false} // We don't easily know the ID unless we store it, but hasVoted disables all
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
          One vote per user account • Results update in real-time
        </p>
      </div>
    </div>
  );
};
