import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Vote, Trophy, Trash2 } from "lucide-react";

interface ParticipantCardProps {
  id: string;
  name: string;
  avatarUrl?: string | null;
  votes: number;
  hasVoted: boolean;
  votedForThis: boolean;
  onVote: (id: string) => void;
  isVoting: boolean;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
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
  isAdmin = false,
  onDelete,
}: ParticipantCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate a color based on the name for the avatar background
  const colors = [
    "bg-chart-1 text-foreground",
    "bg-chart-2 text-foreground",
    "bg-chart-3 text-primary-foreground",
    "bg-chart-4 text-foreground",
    "bg-chart-5 text-foreground",
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <Card
      className={`transition-all duration-300 ${
        votedForThis
          ? "ring-2 ring-primary shadow-lg bg-primary/5"
          : "hover:shadow-md hover:bg-muted/30"
      }`}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="h-14 w-14 shrink-0 ring-2 ring-border">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback className={`${avatarColor} font-semibold text-lg`}>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            {votedForThis && (
              <Trophy className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="font-mono text-xs">
              {votes} {votes === 1 ? "vote" : "votes"}
            </Badge>
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {hasVoted ? (
            votedForThis ? (
              <Badge className="bg-primary text-primary-foreground">
                Your vote
              </Badge>
            ) : null
          ) : (
            <Button
              onClick={() => onVote(id)}
              disabled={isVoting}
              size="sm"
              className="gap-2 transition-all hover:scale-105"
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
