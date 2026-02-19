import { useState, useCallback } from "react";
import { Send, Clock, ChevronRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  evaluateAnswer,
  generateInterviewReport,
  type InterviewQuestion,
  type AnsweredQuestion,
  type AnswerEvaluation,
  type InterviewReport,
} from "@/lib/interview-api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  questions: InterviewQuestion[];
  onComplete: (answered: AnsweredQuestion[], report: InterviewReport) => void;
}

const difficultyColor: Record<string, string> = {
  Easy: "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  Hard: "bg-destructive/10 text-destructive",
};

export const InterviewSession = ({ questions, onComplete }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<AnswerEvaluation | null>(null);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const { toast } = useToast();

  const current = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex) / total) * 100;
  const isLast = currentIndex === total - 1;

  const handleSubmit = useCallback(async () => {
    if (!answer.trim()) {
      toast({ title: "Please enter an answer", variant: "destructive" });
      return;
    }

    setEvaluating(true);
    try {
      const evaluation = await evaluateAnswer(
        current.question, answer, current.category, current.difficulty
      );
      setLastEvaluation(evaluation);

      const newAnswered: AnsweredQuestion[] = [
        ...answered,
        { question: current, answer, evaluation },
      ];
      setAnswered(newAnswered);

      // If last question, generate report
      if (isLast) {
        setGeneratingReport(true);
        const interviewData = JSON.stringify(
          newAnswered.map((a) => ({
            question: a.question.question,
            category: a.question.category,
            difficulty: a.question.difficulty,
            answer: a.answer,
            score: a.evaluation.score,
            strengths: a.evaluation.strengths,
            weaknesses: a.evaluation.weaknesses,
          }))
        );
        const report = await generateInterviewReport(interviewData);
        onComplete(newAnswered, report);
      }
    } catch (e: any) {
      toast({ title: "Evaluation failed", description: e.message, variant: "destructive" });
    } finally {
      setEvaluating(false);
    }
  }, [answer, current, answered, isLast, onComplete, toast]);

  const handleNext = () => {
    setCurrentIndex((i) => i + 1);
    setAnswer("");
    setLastEvaluation(null);
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold">
            Question {currentIndex + 1} of {total}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question card */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={difficultyColor[current.difficulty]}>
                {current.difficulty}
              </Badge>
              <Badge variant="secondary" className="text-xs">{current.category}</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {Math.floor(current.timeLimit / 60)}:{String(current.timeLimit % 60).padStart(2, "0")} suggested
            </div>
          </div>
          <CardTitle className="text-xl mt-3 leading-relaxed">{current.question}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Testing: <span className="font-medium text-foreground">{current.skillTested}</span> · Expected depth: {current.expectedDepth}
          </p>
        </CardHeader>
        <CardContent>
          {!lastEvaluation ? (
            <div className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[150px] resize-none text-sm"
                disabled={evaluating}
              />
              <Button
                onClick={handleSubmit}
                disabled={evaluating || !answer.trim()}
                className="w-full gap-2"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Submit Answer
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score display */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${lastEvaluation.score >= 7 ? "text-success" : lastEvaluation.score >= 4 ? "text-warning" : "text-destructive"}`}>
                    {lastEvaluation.score}/10
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Technical", value: lastEvaluation.technicalCorrectness },
                    { label: "Clarity", value: lastEvaluation.conceptClarity },
                    { label: "Depth", value: lastEvaluation.depthOfExplanation },
                    { label: "Communication", value: lastEvaluation.communicationQuality },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center px-2 py-1 rounded bg-background">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{value}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths / weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-success mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {lastEvaluation.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive mb-2">
                    <AlertCircle className="h-3.5 w-3.5" /> Weaknesses
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {lastEvaluation.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                  </ul>
                </div>
              </div>

              {/* Ideal answer */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                <span className="font-semibold text-primary">Ideal Answer: </span>
                <span className="text-muted-foreground">{lastEvaluation.idealAnswer}</span>
              </div>

              {/* Next / Finish */}
              {isLast ? (
                generatingReport ? (
                  <Button disabled className="w-full gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating Final Report...
                  </Button>
                ) : null
              ) : (
                <Button onClick={handleNext} className="w-full gap-2">
                  Next Question <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
