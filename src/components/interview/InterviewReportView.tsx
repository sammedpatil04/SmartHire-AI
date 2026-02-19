import { RotateCcw, CheckCircle2, AlertCircle, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { InterviewReport, AnsweredQuestion } from "@/lib/interview-api";

interface Props {
  report: InterviewReport;
  answeredQuestions: AnsweredQuestion[];
  onRestart: () => void;
}

const recColors: Record<string, string> = {
  "Strong Hire": "bg-success/10 text-success border-success/30",
  Hire: "bg-primary/10 text-primary border-primary/30",
  Borderline: "bg-warning/10 text-warning border-warning/30",
  Reject: "bg-destructive/10 text-destructive border-destructive/30",
};

const readinessColors: Record<string, string> = {
  "Interview Ready": "text-success",
  "Needs Improvement": "text-warning",
  "Not Ready": "text-destructive",
};

export const InterviewReportView = ({ report, answeredQuestions, onRestart }: Props) => {
  const categoryEntries = Object.entries(report.categoryScores).filter(([, v]) => v !== null) as [string, number][];

  const categoryLabels: Record<string, string> = {
    dsaProblemSolving: "DSA / Problem Solving",
    sqlDatabases: "SQL / Databases",
    frontendReact: "Frontend / React",
    backend: "Backend",
    projectBased: "Project-Based",
    behavioral: "Behavioral / HR",
  };

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="text-center space-y-3">
        <Trophy className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-3xl font-extrabold tracking-tight">Interview Complete</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">{report.summary}</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center border-border/50">
          <CardContent className="pt-6">
            <div className={`text-4xl font-bold ${report.overallScore >= 70 ? "text-success" : report.overallScore >= 40 ? "text-warning" : "text-destructive"}`}>
              {report.overallScore}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
          </CardContent>
        </Card>
        <Card className="text-center border-border/50">
          <CardContent className="pt-6">
            <div className={`text-lg font-bold ${readinessColors[report.readinessLevel]}`}>
              {report.readinessLevel}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Readiness Level</p>
          </CardContent>
        </Card>
        <Card className="text-center border-border/50">
          <CardContent className="pt-6">
            <Badge variant="outline" className={`text-sm px-4 py-1 ${recColors[report.recommendation]}`}>
              {report.recommendation}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Recommendation</p>
          </CardContent>
        </Card>
      </div>

      {/* Category scores */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base">Category Performance</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {categoryEntries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs font-medium w-40 shrink-0">{categoryLabels[key] || key}</span>
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${value >= 70 ? "bg-success" : value >= 40 ? "bg-warning" : "bg-destructive"}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-xs font-bold w-10 text-right">{value}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" /> Strongest Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {report.strongestSkills.map((s) => (
                <Badge key={s} variant="outline" className="bg-success/5 text-success border-success/20 text-xs">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" /> Weakest Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {report.weakestSkills.map((s) => (
                <Badge key={s} variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 text-xs">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed feedback */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base">Detailed Feedback</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{report.detailedFeedback}</p>
        </CardContent>
      </Card>

      {/* Per-question breakdown */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base">Question-by-Question Review</CardTitle></CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {answeredQuestions.map((aq, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    <span className={`font-bold ${aq.evaluation.score >= 7 ? "text-success" : aq.evaluation.score >= 4 ? "text-warning" : "text-destructive"}`}>
                      {aq.evaluation.score}/10
                    </span>
                    <span className="line-clamp-1">{aq.question.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-xs pb-4">
                  <div>
                    <span className="font-semibold text-muted-foreground">Your Answer:</span>
                    <p className="mt-1 p-2 rounded bg-muted/50">{aq.answer}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-success/5">
                      <div className="flex items-center gap-1 font-semibold text-success mb-1"><CheckCircle2 className="h-3 w-3" /> Strengths</div>
                      {aq.evaluation.strengths.map((s, j) => <p key={j}>• {s}</p>)}
                    </div>
                    <div className="p-2 rounded bg-destructive/5">
                      <div className="flex items-center gap-1 font-semibold text-destructive mb-1"><AlertCircle className="h-3 w-3" /> Weaknesses</div>
                      {aq.evaluation.weaknesses.map((w, j) => <p key={j}>• {w}</p>)}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-primary/5">
                    <span className="font-semibold text-primary">Ideal: </span>{aq.evaluation.idealAnswer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Button onClick={onRestart} variant="outline" className="w-full gap-2">
        <RotateCcw className="h-4 w-4" /> Start New Interview
      </Button>
    </div>
  );
};
