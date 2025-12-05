import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Vote } from "lucide-react";

interface ParticipantCardProps {
  id: string;
  name: string;
  avatarUrl?: string | null;
  votes: number;
  hasVoted: boolean;
  votedForThis: boolean;
  onVote: (id: string) => void;
  isVoting: boolean;
}

export const ParticipantCard = ({
  id,
  name,
  avatarUrl,
  votes,
  hasVoted,
  votedForThis,
  onVote,
  isVoting,
}: ParticipantCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate a color based on the name for the avatar background
  const colors = [
    "bg-chart-1",
    "bg-chart-2",
    "bg-chart-3",
    "bg-chart-4",
    "bg-chart-5",
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <Card className={`transition-all duration-200 ${votedForThis ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"}`}>
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="h-14 w-14 shrink-0">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name} />
          ) : null}
          <AvatarFallback className={`${avatarColor} text-foreground font-semibold text-lg`}>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="font-mono">
              {votes} {votes === 1 ? "vote" : "votes"}
            </Badge>
          </div>
        </div>

        <div className="shrink-0">
          {hasVoted ? (
            votedForThis ? (
              <Badge variant="default" className="bg-primary text-primary-foreground">
                Your vote
              </Badge>
            ) : null
          ) : (
            <Button
              onClick={() => onVote(id)}
              disabled={isVoting}
              size="sm"
              className="gap-2"
            >
              <Vote className="h-4 w-4" />
              Vote
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
