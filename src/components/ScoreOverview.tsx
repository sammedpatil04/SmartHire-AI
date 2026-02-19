import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, MinusCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ResumeAnalysis } from "@/lib/api";

interface ScoreOverviewProps {
  analysis: ResumeAnalysis;
}

function ScoreRing({ score, size = 140, strokeWidth = 10, label }: { score: number; size?: number; strokeWidth?: number; label?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--destructive)";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={`hsl(${color})`} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none">{score}</span>
          <span className="text-[10px] text-muted-foreground font-medium">/100</span>
        </div>
      </div>
      {label && <span className="text-xs font-medium text-muted-foreground text-center leading-tight max-w-[80px]">{label}</span>}
    </div>
  );
}

function RecommendationBadge({ rec }: { rec: string }) {
  const config = {
    hire: { icon: CheckCircle, label: "Recommended to Hire", className: "bg-success/10 text-success border-success/30" },
    consider: { icon: MinusCircle, label: "Consider Further", className: "bg-warning/10 text-warning border-warning/30" },
    reject: { icon: XCircle, label: "Not Recommended", className: "bg-destructive/10 text-destructive border-destructive/30" },
  }[rec] || { icon: MinusCircle, label: rec, className: "" };

  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border font-semibold text-sm ${config.className}`}>
      <Icon className="h-5 w-5" />
      {config.label}
    </div>
  );
}

const categoryLabels: Record<string, string> = {
  dsaProblemSolving: "DSA & Problem Solving",
  developmentSkills: "Development Skills",
  sqlDatabases: "SQL & Databases",
  projectsQuality: "Projects Quality",
  resumeStructure: "Resume Structure",
};

export function ScoreOverview({ analysis }: ScoreOverviewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero score card */}
      <Card className="glass-card overflow-hidden">
        <div className="hero-gradient">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={analysis.overallScore} size={160} strokeWidth={12} />
              <div className="text-center md:text-left space-y-3 flex-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-2xl font-bold">Overall Resume Score</h3>
                </div>
                <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">{analysis.summary}</p>
                <RecommendationBadge rec={analysis.recommendation} />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Category score rings - HR friendly */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Category Scores</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {Object.entries(analysis.categories).map(([key, value]) => (
            <Card key={key} className="glass-card p-4 flex flex-col items-center">
              <ScoreRing score={value} size={90} strokeWidth={7} />
              <span className="text-xs font-medium text-center text-muted-foreground mt-2 leading-tight">
                {categoryLabels[key] || key}
              </span>
            </Card>
          ))}
        </div>
      </div>

      {/* Strengths, Weaknesses, Red Flags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Strengths", items: analysis.strengths, icon: TrendingUp, color: "text-success", accent: "border-l-success" },
          { label: "Weaknesses", items: analysis.weaknesses, icon: TrendingDown, color: "text-warning", accent: "border-l-warning" },
          { label: "Red Flags", items: analysis.redFlags, icon: AlertTriangle, color: "text-destructive", accent: "border-l-destructive" },
        ].map(({ label, items, icon: Icon, color, accent }) => (
          <Card key={label} className={`glass-card border-l-4 ${accent}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} /> {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${color === "text-success" ? "bg-success" : color === "text-warning" ? "bg-warning" : "bg-destructive"}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">None detected</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Detected Skills</h4>
        <div className="flex flex-wrap gap-2">
          {analysis.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="px-3 py-1 text-xs font-medium rounded-full">{skill}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
