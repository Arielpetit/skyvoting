import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListCard } from "./ListCard";
import { ResultsChart } from "./ResultsChart";
import { CountdownTimer } from "./CountdownTimer";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Vote, Sparkles, LogOut, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddParticipantForm } from "./AddParticipantForm";
import { ListDetails } from "./ListDetails";
import { Plus, X } from "lucide-react";
import { VoterList } from "./VoterList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";
import { List } from "@/types";
import { formatUserName } from "@/lib/utils";

export const VotingApp = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedForName, setVotedForName] = useState<string | null>(null);
  const [votedForId, setVotedForId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [newDeadline, setNewDeadline] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const adminEmails = (import.meta.env.VITE_ADMIN_EMAIL || "").split(",").map((e: string) => e.trim());
  const isAdmin = !!user?.email && adminEmails.includes(user.email);

  // Check if user has voted
  useEffect(() => {
    if (!user) return;

    const checkVote = async () => {
      const { data, error } = await supabase
        .from("votes")
        .select("list_id, lists(name)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setHasVoted(true);
        setVotedForId(data.list_id);
        setVotedForName(data.lists?.name || "a team");
      }
    };

    checkVote();
  }, [user]);

  // Check LocalStorage for device vote
  useEffect(() => {
    const deviceVoted = localStorage.getItem("skyvoting_device_voted");
    if (deviceVoted === "true") {
      setHasVoted(true);
    }
  }, []);

  // Fetch deadline
  useEffect(() => {
    const fetchDeadline = async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "voting_deadline")
        .single();

      if (data?.value) {
        const parsedDate = new Date(data.value);
        setDeadline(parsedDate);
        // Format for datetime-local input: YYYY-MM-DDTHH:mm
        const localIsoString = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setNewDeadline(localIsoString);
      }
    };

    fetchDeadline();
  }, []);

  // Check deadline
  useEffect(() => {
    if (deadline && new Date() > deadline) {
      setIsExpired(true);
    } else if (deadline) {
      setIsExpired(false);
    }
  }, [deadline]);

  // Fetch lists
  useEffect(() => {
    const fetchLists = async () => {
      const { data, error } = await supabase
        .from("lists")
        .select("*, participants(*), teams(*)")
        .order("votes", { ascending: false });

      if (error) {
        console.error("Error fetching lists:", error);
        toast({
          title: "Error",
          description: "Failed to load lists",
          variant: "destructive",
        });
      } else {
        setLists(data || []);
      }
      setLoading(false);
    };

    fetchLists();

    // Subscribe to realtime updates for lists, participants, and teams
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lists",
        },
        () => {
          fetchLists();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
        },
        () => {
          fetchLists();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
        },
        () => {
          fetchLists();
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

  const handleSetDeadline = async () => {
    if (!isAdmin || !newDeadline) return;

    const date = new Date(newDeadline);
    if (isNaN(date.getTime())) {
      toast({ title: "Invalid date format", variant: "destructive" });
      return;
    }

    try {
      // Use upsert to either insert or update the deadline
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "voting_deadline", value: date.toISOString() }, { onConflict: "key" });

      if (error) throw error;

      setDeadline(date);
      toast({ title: "Success", description: "Voting deadline updated." });
    } catch (error) {
      console.error("Error setting deadline:", error);
      toast({
        title: "Error",
        description: "Failed to set deadline. Make sure the 'settings' table is created.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (listId: string) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this team and all their votes? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      // Using direct delete since we have cascade set up in migration
      const { error } = await supabase.from("lists").delete().eq("id", listId);

      if (error) throw error;

      // Optimistically update the UI
      setLists((currentLists) => currentLists.filter((list) => list.id !== listId));

      toast({
        title: "Success",
        description: "Team deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this participant? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("participants").delete().eq("id", participantId);

      if (error) throw error;

      // Optimistically update the UI
      setLists((currentLists) =>
        currentLists.map((list) => ({
          ...list,
          participants: list.participants?.filter((p) => p.id !== participantId),
        }))
      );

      // Also update selectedList if it's open
      if (selectedList) {
        setSelectedList((prev) =>
          prev
            ? {
              ...prev,
              participants: prev.participants?.filter((p) => p.id !== participantId),
            }
            : null
        );
      }

      toast({
        title: "Success",
        description: "Participant deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting participant:", error);
      toast({
        title: "Error",
        description: "Failed to delete participant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (listId: string) => {
    // Double check local storage before allowing vote attempt
    if (localStorage.getItem("skyvoting_device_voted") === "true") {
      setHasVoted(true);
      toast({
        title: "Already Voted",
        description: "This device has already been used to vote.",
        variant: "destructive",
      });
      return;
    }

    if (hasVoted || isVoting || isExpired || !user) return;

    setIsVoting(true);

    try {
      const { error } = await supabase.from("votes").insert({
        list_id: listId,
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
        // Set LocalStorage flag on success
        localStorage.setItem("skyvoting_device_voted", "true");

        setHasVoted(true);
        const list = lists.find((l) => l.id === listId);
        setVotedForId(listId);
        setVotedForName(list?.name || "a team");

        toast({
          title: "Vote Recorded!",
          description: `Thank you for voting for ${list?.name}`,
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

  const handleViewDetails = (list: List) => {
    setSelectedList(list);
    setDetailsOpen(true);
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

  const maxVotes = Math.max(...lists.map(l => l.votes), 0);
  const winners = lists.filter(l => l.votes === maxVotes && maxVotes > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl mx-auto px-4 py-8">
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
                  <p className="text-sm font-medium leading-none">{formatUserName(user?.email, user?.user_metadata?.full_name)}</p>
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
              Team Voting
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isExpired
              ? "Voting has closed. See the final results below."
              : hasVoted
                ? "Thank you for participating!"
                : "Select a team to cast your vote"}
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
            <AddParticipantForm onSuccess={() => {
              setShowAddForm(false);
              // Manually trigger fetch since realtime might not catch deep relation changes immediately
              const fetchLists = async () => {
                const { data } = await supabase
                  .from("lists")
                  .select("*, participants(*), teams(*)")
                  .order("votes", { ascending: false });
                if (data) setLists(data);
              };
              fetchLists();
            }} />
          </div>
        )}

        {/* Admin Deadline Setter */}
        {isAdmin && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Set Voting Deadline</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="datetime-local"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleSetDeadline}>Set</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Current deadline: {deadline ? deadline.toLocaleString() : "Not set"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Countdown Timer */}
        <div className="mb-6">
          {deadline ? (
            <CountdownTimer deadline={deadline} onExpired={handleDeadlineExpired} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                The voting period has not been set.
              </CardContent>
            </Card>
          )}
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

        {/* Tabs for Lists and Results */}
        <Tabs defaultValue="vote" className="w-full">
          <TabsList className="grid w-full mb-4 grid-cols-3">
            <TabsTrigger value="vote">Teams</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="voters">Voters</TabsTrigger>
          </TabsList>

          <TabsContent value="vote" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  hasVoted={votingDisabled}
                  votedForThis={votedForId === list.id}
                  isWinner={winners.some(w => w.id === list.id)}
                  onVote={handleVote}
                  isVoting={isVoting}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {lists.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No teams available yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results">
            <ResultsChart lists={lists} />
          </TabsContent>

          <TabsContent value="voters">
            <VoterList />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          One vote per user account • Results update in real-time
        </p>

        {/* List Details Modal */}
        <ListDetails
          list={selectedList}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          isAdmin={isAdmin}
          onDeleteParticipant={handleDeleteParticipant}
        />
      </div>
    </div>
  );
};
