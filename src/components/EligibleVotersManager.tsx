import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Upload, Loader2 } from "lucide-react";

interface EligibleVoter {
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
}

export const EligibleVotersManager = () => {
    const [voters, setVoters] = useState<EligibleVoter[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const { toast } = useToast();

    const fetchVoters = async () => {
        try {
            const { data, error } = await supabase
                .from("eligible_voters")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setVoters(data || []);
        } catch (err) {
            console.error("Error fetching eligible voters:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVoters();
    }, []);

    const handleAddVoter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsAdding(true);
        try {
            const { error } = await supabase
                .from("eligible_voters")
                .insert({ email: email.toLowerCase(), full_name: fullName });

            if (error) throw error;

            toast({ title: "Success", description: "Voter added successfully." });
            setEmail("");
            setFullName("");
            fetchVoters();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.code === "23505" ? "Email already exists." : "Failed to add voter.",
                variant: "destructive",
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteVoter = async (id: string) => {
        if (!window.confirm("Are you sure you want to remove this eligible voter?")) return;

        try {
            const { error } = await supabase.from("eligible_voters").delete().eq("id", id);
            if (error) throw error;

            toast({ title: "Success", description: "Voter removed." });
            setVoters(voters.filter((v) => v.id !== id));
        } catch (err) {
            toast({ title: "Error", description: "Failed to remove voter.", variant: "destructive" });
        }
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split("\n").filter(line => line.trim());

            // Assume CSV format: email,full_name
            const newVoters = lines.map(line => {
                const [email, name] = line.split(",").map(s => s.trim());
                return { email: email.toLowerCase(), full_name: name || null };
            }).filter(v => v.email && v.email.includes("@"));

            if (newVoters.length === 0) {
                toast({ title: "Error", description: "No valid emails found in file.", variant: "destructive" });
                return;
            }

            try {
                const { error } = await supabase.from("eligible_voters").upsert(newVoters, { onConflict: "email" });
                if (error) throw error;

                toast({ title: "Success", description: `Uploaded ${newVoters.length} voters.` });
                fetchVoters();
            } catch (err) {
                toast({ title: "Error", description: "Failed to upload voters.", variant: "destructive" });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Add Eligible Voter
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddVoter} className="flex flex-col md:flex-row gap-4">
                        <Input
                            placeholder="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-grow"
                        />
                        <Input
                            placeholder="Full Name (Optional)"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="flex-grow"
                        />
                        <Button type="submit" disabled={isAdding}>
                            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Voter"}
                        </Button>
                    </form>

                    <div className="mt-4 pt-4 border-t">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Bulk Upload (CSV: email,full_name)
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleBulkUpload}
                                className="max-w-xs"
                            />
                            <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Eligible Voters List ({voters.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="max-h-[400px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {voters.length > 0 ? (
                                        voters.map((voter) => (
                                            <TableRow key={voter.id}>
                                                <TableCell>{voter.email}</TableCell>
                                                <TableCell>{voter.full_name || "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteVoter(voter.id)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                No eligible voters added yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
