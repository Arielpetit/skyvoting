import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { List } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ResultsChartProps {
  lists: List[];
}

const COLORS = [
  { start: "#8b5cf6", end: "#6d28d9" }, // Violet
  { start: "#3b82f6", end: "#1d4ed8" }, // Blue
  { start: "#10b981", end: "#059669" }, // Emerald
  { start: "#f59e0b", end: "#d97706" }, // Amber
  { start: "#ec4899", end: "#db2777" }, // Pink
];

export const ResultsChart = ({ lists }: ResultsChartProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const totalVotes = lists.reduce((sum, p) => sum + p.votes, 0);

  const data = lists
    .map((p, index) => ({
      name: p.name,
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
        <div className="bg-popover/95 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 shadow-xl ring-1 ring-black/5">
          <p className="font-bold text-foreground text-base mb-1">{item.fullName}</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium text-primary">{item.votes} votes</span>
            <span className="text-muted-foreground">({item.percentage}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomYAxisTick = (props: any) => {
    const { x, y, payload, index } = props;
    const isLeader = index === 0 && totalVotes > 0;
    const isSecond = index === 1 && totalVotes > 0;
    const isThird = index === 2 && totalVotes > 0;

    let icon = "";
    if (isLeader) icon = "🏆 ";
    else if (isSecond) icon = "🥈 ";
    else if (isThird) icon = "🥉 ";

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor="end"
          fill="hsl(var(--foreground))"
          fontSize={isMobile ? 11 : 13}
          fontWeight={isLeader ? 700 : 500}
        >
          {icon}{payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Chart Card */}
      <Card className="overflow-hidden border-primary/10 shadow-xl bg-gradient-to-br from-card to-muted/30 backdrop-blur-sm">
        <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <BarChart3 className="h-5 w-5 text-primary" />
                Live Results
              </CardTitle>
              <CardDescription>
                Real-time voting distribution across all teams
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
              Total Votes: {totalVotes}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {totalVotes === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-full">
                <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">
                No votes cast yet. Be the first to participate!
              </p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                  <defs>
                    {data.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={entry.color.start} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={entry.color.end} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={isMobile ? 80 : 120}
                    tick={<CustomYAxisTick />}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} />
                  <Bar dataKey="votes" radius={[0, 6, 6, 0]} maxBarSize={32} animationDuration={1000}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
