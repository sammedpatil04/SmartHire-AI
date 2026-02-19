import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SkillChartsProps {
  categories: {
    dsaProblemSolving: number;
    developmentSkills: number;
    sqlDatabases: number;
    projectsQuality: number;
    resumeStructure: number;
  };
}

const COLORS = {
  high: "hsl(142, 71%, 45%)",
  mid: "hsl(217, 91%, 50%)",
  low: "hsl(38, 92%, 50%)",
  poor: "hsl(0, 72%, 51%)",
};

function getColor(score: number) {
  if (score >= 75) return COLORS.high;
  if (score >= 50) return COLORS.mid;
  if (score >= 30) return COLORS.low;
  return COLORS.poor;
}

function ScoreRing({ score, size = 80, strokeWidth = 6 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none">{score}</span>
      </div>
    </div>
  );
}

export function SkillCharts({ categories }: SkillChartsProps) {
  const data = [
    { subject: "DSA", fullName: "DSA & Problem Solving", score: categories.dsaProblemSolving },
    { subject: "Dev", fullName: "Development Skills", score: categories.developmentSkills },
    { subject: "SQL/DB", fullName: "SQL & Databases", score: categories.sqlDatabases },
    { subject: "Projects", fullName: "Projects Quality", score: categories.projectsQuality },
    { subject: "Structure", fullName: "Resume Structure", score: categories.resumeStructure },
  ];

  const barData = data.map((d) => ({ ...d, fill: getColor(d.score) }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Circular progress rings row */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Skill Assessment Rings</CardTitle>
          <p className="text-xs text-muted-foreground">Quick visual overview for HR evaluation</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-around gap-6 py-4">
            {data.map((d) => (
              <div key={d.subject} className="flex flex-col items-center gap-2">
                <ScoreRing score={d.score} />
                <span className="text-xs font-medium text-muted-foreground text-center max-w-[90px] leading-tight">{d.fullName}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  d.score >= 75 ? "bg-success/10 text-success" : d.score >= 50 ? "bg-primary/10 text-primary" : d.score >= 30 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                }`}>
                  {d.score >= 75 ? "Excellent" : d.score >= 50 ? "Good" : d.score >= 30 ? "Needs Work" : "Weak"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Skill Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2.5} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="subject" tick={{ fontSize: 12, fontWeight: 500 }} width={70} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
                  formatter={(value: number) => [`${value}/100`, "Score"]}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={28}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
