import { List } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Vote, Trash2, Trophy, ArrowRight } from "lucide-react";

interface ListCardProps {
    list: List;
    hasVoted: boolean;
    votedForThis: boolean;
    isWinner: boolean;
    onVote: (id: string) => void;
    isVoting: boolean;
    isAdmin: boolean;
    onDelete: (id: string) => void;
    onViewDetails: (list: List) => void;
}

export const ListCard = ({ list, ...props }: ListCardProps) => {
    return (
        <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-border/50 ${props.votedForThis ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Winner Badge */}
            {props.isWinner && (
                <div className="absolute top-0 right-0 p-2 sm:p-3 z-10">
                    <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20 gap-1 text-[10px] sm:text-xs">
                        <Trophy className="h-3 w-3" /> Leading
                    </Badge>
                </div>
            )}

            <CardHeader className="pb-2 sm:pb-4 relative z-10">
                <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {list.name}
                    </h3>
                    {list.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {list.description}
                        </p>
                    )}
                </div>
            </CardHeader>

            <CardContent className="relative z-10 pb-2">
                {/* Team Preview */}
                <div
                    className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group/preview"
                    onClick={() => props.onViewDetails(list)}
                >
                    <div className="flex -space-x-2 sm:-space-x-3 overflow-hidden">
                        {list.participants?.slice(0, 4).map((participant) => (
                            <Avatar key={participant.id} className="inline-block border-2 border-background w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-background transition-transform group-hover/preview:translate-x-1">
                                <AvatarImage src={participant.avatar_url || undefined} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] sm:text-xs font-medium">
                                    {participant.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {(list.participants?.length || 0) > 4 && (
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-background bg-muted text-[8px] sm:text-[10px] font-medium text-muted-foreground ring-2 ring-background z-10">
                                +{list.participants!.length - 4}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">View Team Members</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                            {(list.teams?.length || 0)} Sub-teams • {(list.participants?.length || 0)} Members
                        </p>
                    </div>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground opacity-0 group-hover/preview:opacity-100 transition-all -translate-x-2 group-hover/preview:translate-x-0" />
                </div>
            </CardContent>

            <CardFooter className="relative z-10 flex items-center justify-between pt-2 border-t border-border/50 bg-muted/5">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                            {list.votes}
                        </span>
                        <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            Votes
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {props.isAdmin && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onDelete(list.id);
                            }}
                        >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                    )}

                    <Button
                        onClick={() => props.onVote(list.id)}
                        disabled={props.hasVoted || props.isVoting}
                        size="sm"
                        className={`
              gap-2 font-medium transition-all duration-300 shadow-sm text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4
              ${props.votedForThis
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                                : "hover:translate-y-[-1px] hover:shadow-md"
                            }
            `}
                    >
                        {props.votedForThis ? (
                            <>
                                <Vote className="h-3 w-3 sm:h-4 sm:w-4 fill-current" /> Voted
                            </>
                        ) : (
                            <>
                                <Vote className="h-3 w-3 sm:h-4 sm:w-4" /> Vote Team
                            </>
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};
