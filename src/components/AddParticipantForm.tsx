import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, Upload, Image as ImageIcon, X } from "lucide-react";

export const AddParticipantForm = () => {
    const [name, setName] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    title: "File too large",
                    description: "Please select an image smaller than 2MB",
                    variant: "destructive",
                });
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearFile = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Participant name is required",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            let finalAvatarUrl = null;

            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                finalAvatarUrl = publicUrl;
            }

            const { error } = await supabase.from("participants").insert({
                name: name.trim(),
                avatar_url: finalAvatarUrl,
                votes: 0,
            });

            if (error) throw error;

            toast({
                title: "Success",
                description: `Participant "${name}" added successfully!`,
            });
            setName("");
            clearFile();
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
        <Card className="border-border bg-card shadow-xl overflow-hidden mb-8">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Add New Participant
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Enter the details of the new participant to include them in the vote.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground/80">Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-primary/50 h-11"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-foreground/80">Profile Picture (Optional)</Label>
                        <div className="flex items-center gap-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative group cursor-pointer"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-muted border-2 border-dashed border-input flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-muted/80">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-muted-foreground/40 group-hover:text-primary/50" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                    <Upload className="w-3 h-3 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div className="text-sm text-muted-foreground mb-2">
                                    {avatarFile ? avatarFile.name : "No file selected (Max 2MB)"}
                                </div>
                                {avatarFile && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFile}
                                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-8 px-2"
                                    >
                                        <X className="w-3 h-3 mr-1" />
                                        Remove image
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 transition-all duration-300 shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
