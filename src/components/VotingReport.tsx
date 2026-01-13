import { useReport } from "@/hooks/useReport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Users, UserX, Trophy, Loader2 } from "lucide-react";
import { generateVotingReportPDF } from "@/lib/utils";

export const VotingReport = () => {
    const { totalEligible, totalVotes, voters, absences, votesPerList, winner, loading, error } = useReport();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Generating report data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-8 text-center text-destructive">
                    <p className="font-semibold">Error loading report</p>
                    <p className="text-sm opacity-80">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Voting Report</h2>
                <Button onClick={() => generateVotingReportPDF({ totalEligible, totalVotes, voters, absences, votesPerList, winner })} className="gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Download className="h-4 w-4" />
                    Export PDF
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Eligible Voters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEligible}</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5 border-green-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Total Votes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVotes}</div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-500/5 border-amber-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <UserX className="h-4 w-4" />
                            Absences
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{absences.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-500/5 border-purple-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Participation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalEligible > 0 ? ((totalVotes / totalEligible) * 100).toFixed(1) : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Winner Section */}
            {winner && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 overflow-hidden">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Trophy className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-primary uppercase tracking-wider">Current Winner</p>
                                <h3 className="text-2xl font-bold">{winner.name}</h3>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary">{winner.count}</div>
                            <p className="text-sm text-muted-foreground">Votes ({winner.percentage.toFixed(1)}%)</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Results Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Team Name</TableHead>
                                <TableHead className="text-right">Votes</TableHead>
                                <TableHead className="text-right">Percentage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {votesPerList.map((l) => (
                                <TableRow key={l.name}>
                                    <TableCell className="font-medium">{l.name}</TableCell>
                                    <TableCell className="text-right">{l.count}</TableCell>
                                    <TableCell className="text-right">{l.percentage.toFixed(1)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Voter List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Detailed Voter List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[400px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Voted For</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {voters.map((v, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{v.full_name || "N/A"}</TableCell>
                                        <TableCell className="text-muted-foreground">{v.email}</TableCell>
                                        <TableCell>{v.list_name}</TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {new Date(v.voted_at).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Absences */}
            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="text-lg text-destructive flex items-center gap-2">
                        <UserX className="h-5 w-5" />
                        Absences ({absences.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[300px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {absences.map((a, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{a.full_name || "N/A"}</TableCell>
                                        <TableCell className="text-muted-foreground">{a.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
