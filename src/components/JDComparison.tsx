import { useState } from "react";
import { Search, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { matchJD, type JDMatch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface JDComparisonProps {
  resumeText: string;
}

const statusConfig = {
  "Eligible": { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  "Partially Eligible": { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
  "Not Eligible": { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export function JDComparison({ resumeText }: JDComparisonProps) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<JDMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCompare = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    try {
      const data = await matchJD(resumeText, jd);
      setResult(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const config = result ? statusConfig[result.eligibility] : null;
  const StatusIcon = config?.icon || AlertCircle;

  return (
    <div className="space-y-4 animate-fade-in">
      <Textarea
        placeholder="Paste the Job Description here...&#10;&#10;e.g., We are looking for a Frontend Developer with 2+ years of experience in React, TypeScript..."
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        className="min-h-[150px] resize-none text-sm"
      />
      <Button onClick={handleCompare} disabled={!jd.trim() || loading} className="w-full">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Comparing...
          </span>
        ) : (
          <span className="flex items-center gap-2"><Search className="h-4 w-4" /> Compare with JD</span>
        )}
      </Button>

      {result && (
        <div className="space-y-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className={`p-4 rounded-xl ${config?.bg}`}>
                  <StatusIcon className={`h-8 w-8 ${config?.color}`} />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <p className={`text-lg font-semibold ${config?.color}`}>{result.eligibility}</p>
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{result.matchPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Match</p>
                  <Progress value={result.matchPercentage} className="w-24 mt-1 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-success">Matched Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map((s) => <Badge key={s} className="bg-success/10 text-success border-success/20 text-xs">{s}</Badge>)}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-destructive">Missing Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s) => <Badge key={s} variant="destructive" className="text-xs bg-destructive/10 text-destructive border-destructive/20">{s}</Badge>)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Suggestions to Improve</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
