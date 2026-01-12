import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, UserPlus, Users, Briefcase, Image as ImageIcon } from "lucide-react";
import { List, Team } from "@/types";

export const AddParticipantForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState("Delegate");
    const [selectedListId, setSelectedListId] = useState<string>("");
    const [selectedTeamId, setSelectedTeamId] = useState<string>("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [lists, setLists] = useState<List[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);

    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            const { data: listsData } = await supabase.from("lists").select("*");
            const { data: teamsData } = await supabase.from("teams").select("*");

            if (listsData) setLists(listsData);
            if (teamsData) setTeams(teamsData);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedListId) {
            setFilteredTeams(teams.filter(t => t.list_id === selectedListId));
        } else {
            setFilteredTeams([]);
        }
    }, [selectedListId, teams]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !selectedListId || !selectedTeamId) {
            toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            let avatarUrl = null;

            if (avatarFile) {
                const fileExt = avatarFile.name.split(".").pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("avatars")
                    .getPublicUrl(filePath);

                avatarUrl = publicUrl;
            }

            const { error } = await supabase.from("participants").insert({
                name,
                role,
                list_id: selectedListId,
                team_id: selectedTeamId,
                avatar_url: avatarUrl,
                votes: 0 // Legacy
            });

            if (error) throw error;

            toast({ title: "Success", description: "Participant added successfully" });
            setName("");
            setAvatarFile(null);
            setPreviewUrl(null);
            // Keep list/team selection for faster entry
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Error adding participant:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to add participant",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border/50 shadow-md bg-card/50 backdrop-blur-sm max-w-2xl mx-auto w-full">
            <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base sm:text-lg font-semibold">Add New Participant</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Register a new member to a team list</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="list" className="text-[10px] sm:text-xs font-medium uppercase text-muted-foreground">List Selection</Label>
                            <Select value={selectedListId} onValueChange={setSelectedListId}>
                                <SelectTrigger className="bg-background h-9 sm:h-10 text-sm">
                                    <SelectValue placeholder="Select List" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lists.map((list) => (
                                        <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="team" className="text-[10px] sm:text-xs font-medium uppercase text-muted-foreground">Team Assignment</Label>
                            <Select value={selectedTeamId} onValueChange={setSelectedTeamId} disabled={!selectedListId}>
                                <SelectTrigger className="bg-background h-9 sm:h-10 text-sm">
                                    <SelectValue placeholder={selectedListId ? "Select Team" : "Choose List First"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredTeams.map((team) => (
                                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] sm:text-xs font-medium uppercase text-muted-foreground">Personal Details</Label>
                        <div className="relative">
                            <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                className="pl-9 bg-background h-9 sm:h-10 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-[10px] sm:text-xs font-medium uppercase text-muted-foreground">Role</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="pl-9 bg-background h-9 sm:h-10 text-sm">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Delegate">Delegate</SelectItem>
                                    <SelectItem value="Assistant">Assistant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="avatar" className="text-[10px] sm:text-xs font-medium uppercase text-muted-foreground">Profile Photo</Label>
                        <div className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg border-dashed bg-muted/10 hover:bg-muted/20 transition-colors">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-background shadow-sm shrink-0 mx-auto sm:mx-0">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                                <Input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 h-auto py-2"
                                />
                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                    Upload a professional headshot. Recommended size: 400x400px.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium shadow-lg shadow-primary/20" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding Participant...
                            </>
                        ) : (
                            "Add Participant"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
