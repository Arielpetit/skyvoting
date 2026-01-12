import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

export const AddListForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [members, setMembers] = useState([{ name: "", role: "Delegate" }, { name: "", role: "Assistant" }]);
    const { toast } = useToast();

    const handleAddMember = () => {
        setMembers([...members, { name: "", role: "" }]);
    };

    const handleRemoveMember = (index: number) => {
        const newMembers = [...members];
        newMembers.splice(index, 1);
        setMembers(newMembers);
    };

    const handleMemberChange = (index: number, field: "name" | "role", value: string) => {
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({ title: "List name is required", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // 1. Create List
            const { data: listData, error: listError } = await supabase
                .from("lists")
                .insert({ name, description })
                .select()
                .single();

            if (listError) throw listError;

            // 2. Add Participants
            if (members.length > 0) {
                const participantsToAdd = members
                    .filter(m => m.name.trim())
                    .map(m => ({
                        name: m.name,
                        role: m.role,
                        list_id: listData.id,
                        votes: 0 // Legacy field, keeping it 0
                    }));

                if (participantsToAdd.length > 0) {
                    const { error: participantsError } = await supabase
                        .from("participants")
                        .insert(participantsToAdd);

                    if (participantsError) throw participantsError;
                }
            }

            toast({ title: "Success", description: "List created successfully" });
            setName("");
            setDescription("");
            setMembers([{ name: "", role: "Delegate" }, { name: "", role: "Assistant" }]);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Error creating list:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create list",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Team (List)</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Team Alpha"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description or slogan"
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                            <Label>Members</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddMember}>
                                <Plus className="h-3 w-3 mr-1" /> Add Member
                            </Button>
                        </div>

                        {members.map((member, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="grid grid-cols-2 gap-2 flex-1">
                                    <Input
                                        placeholder="Name"
                                        value={member.name}
                                        onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                                        required
                                    />
                                    <Input
                                        placeholder="Role (e.g. Delegate)"
                                        value={member.role}
                                        onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                                        required
                                    />
                                </div>
                                {members.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveMember(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Team...
                            </>
                        ) : (
                            "Create Team"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
