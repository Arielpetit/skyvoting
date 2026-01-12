import { List } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, ShieldCheck, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListDetailsProps {
    list: List | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isAdmin?: boolean;
    onDeleteParticipant?: (id: string) => void;
}

export const ListDetails = ({ list, open, onOpenChange, isAdmin, onDeleteParticipant }: ListDetailsProps) => {
    if (!list) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl flex flex-col">
                <div className="bg-primary/5 p-4 sm:p-8 border-b border-border/50 shrink-0">
                    <DialogHeader>
                        <div className="flex items-center gap-3 sm:gap-4 mb-2">
                            <div className="p-2 sm:p-3 bg-background rounded-xl shadow-sm">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </div>
                            <DialogTitle className="text-xl sm:text-3xl font-bold tracking-tight text-left">{list.name}</DialogTitle>
                        </div>
                        {list.description && (
                            <DialogDescription className="text-sm sm:text-lg ml-1 text-left">{list.description}</DialogDescription>
                        )}
                    </DialogHeader>
                </div>

                <div className="p-4 sm:p-8 bg-background flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4 -mr-4">
                        <div className="space-y-6 sm:space-y-10 pr-4 pb-4">
                            {list.teams?.map((team) => {
                                const teamMembers = list.participants?.filter(p => p.team_id === team.id) || [];
                                if (teamMembers.length === 0) return null;

                                return (
                                    <div key={team.id} className="space-y-3 sm:space-y-5">
                                        <div className="flex items-center gap-3 pb-2 sm:pb-3 border-b border-border/50">
                                            <h4 className="text-base sm:text-lg font-bold text-foreground uppercase tracking-wider">
                                                {team.name}
                                            </h4>
                                            <Badge variant="secondary" className="text-[10px] sm:text-xs h-5 sm:h-6 px-2 font-medium">
                                                {teamMembers.length} Members
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                            {teamMembers.map((participant) => (
                                                <div
                                                    key={participant.id}
                                                    className="flex items-center gap-3 sm:gap-5 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-border/40 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-200 group shadow-sm hover:shadow-md"
                                                >
                                                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 sm:border-4 border-background shadow-sm group-hover:scale-105 transition-transform shrink-0">
                                                        <AvatarImage src={participant.avatar_url || undefined} className="object-cover" />
                                                        <AvatarFallback className="bg-primary/5 text-primary text-lg sm:text-xl font-bold">
                                                            {participant.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-base sm:text-lg text-foreground truncate group-hover:text-primary transition-colors">
                                                            {participant.name}
                                                        </p>
                                                        {participant.role && (
                                                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                                                {participant.role === 'Delegate' ? (
                                                                    <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                                                                ) : (
                                                                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                                                )}
                                                                <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                                                                    {participant.role}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isAdmin && onDeleteParticipant && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteParticipant(participant.id);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Handle Unassigned or No Teams */}
                            {(!list.teams || list.teams.length === 0) && list.participants && list.participants.length > 0 && (
                                <div className="space-y-3 sm:space-y-5">
                                    <div className="flex items-center gap-3 pb-2 sm:pb-3 border-b border-border/50">
                                        <h4 className="text-base sm:text-lg font-bold text-foreground uppercase tracking-wider">
                                            Members
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                        {list.participants.map((participant) => (
                                            <div key={participant.id} className="flex items-center gap-3 sm:gap-5 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-border/40 bg-card hover:bg-accent/50 transition-colors shadow-sm">
                                                <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 sm:border-4 border-background shadow-sm shrink-0">
                                                    <AvatarImage src={participant.avatar_url || undefined} />
                                                    <AvatarFallback className="text-lg sm:text-xl font-bold">{participant.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-base sm:text-lg text-foreground">{participant.name}</p>
                                                    {participant.role && (
                                                        <Badge variant="outline" className="mt-1 text-[10px] sm:text-xs font-medium h-5 sm:h-6 border-primary/20 text-primary/80 px-2">
                                                            {participant.role}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {isAdmin && onDeleteParticipant && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="ml-auto h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteParticipant(participant.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!list.participants || list.participants.length === 0) && (
                                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                                    <div className="p-4 sm:p-6 rounded-full bg-muted/50 mb-3 sm:mb-4">
                                        <Users className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-base sm:text-lg text-muted-foreground font-medium">No members in this list yet.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};
