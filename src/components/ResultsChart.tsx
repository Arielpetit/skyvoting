import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  votes: number;
}

interface ResultsChartProps {
  participants: Participant[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const ResultsChart = ({ participants }: ResultsChartProps) => {
  const totalVotes = participants.reduce((sum, p) => sum + p.votes, 0);

  const data = participants
    .map((p, index) => ({
      name: p.name.split(" ")[0], // First name only for chart
      fullName: p.name,
      votes: p.votes,
      percentage: totalVotes > 0 ? ((p.votes / totalVotes) * 100).toFixed(1) : "0",
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.votes - a.votes);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof data[0] }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-lg">
          <p className="font-semibold text-foreground">{item.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {item.votes} votes ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalVotes === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No votes yet. Be the first to vote!
          </p>
        ) : (
          <>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="votes" radius={[0, 4, 4, 0]} maxBarSize={28}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Total: {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
