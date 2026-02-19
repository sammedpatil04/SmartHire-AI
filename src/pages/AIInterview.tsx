import { useState } from "react";
import { Brain, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/ResumeUpload";
import { StructuredProfileEditor } from "@/components/profile/StructuredProfileEditor";
import { InterviewSession } from "@/components/interview/InterviewSession";
import { InterviewReportView } from "@/components/interview/InterviewReportView";
import { structureResume } from "@/lib/api";
import { profileToText, type StructuredProfile } from "@/lib/structured-profile";
import {
  generateInterviewQuestions,
  type InterviewQuestion,
  type AnsweredQuestion,
  type InterviewReport,
} from "@/lib/interview-api";
import { useToast } from "@/hooks/use-toast";

type Phase = "upload" | "profile" | "interview" | "report";

const AIInterview = () => {
  const [phase, setPhase] = useState<Phase>("upload");
  const [profile, setProfile] = useState<StructuredProfile | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const { toast } = useToast();

  // Step 1: Upload → extract structured profile
  const handleUpload = async (text: string) => {
    setLoading(true);
    try {
      const structured = await structureResume(text);
      setProfile(structured);
      setPhase("profile");
      toast({ title: "✨ Profile Extracted", description: "Review your profile, then start the interview." });
    } catch (e: any) {
      toast({ title: "Extraction Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Start interview from structured profile
  const handleStartInterview = async () => {
    if (!profile) return;
    setStarting(true);
    const text = profileToText(profile);
    try {
      const data = await generateInterviewQuestions(text);
      setQuestions(data.questions);
      setPhase("interview");
      toast({ title: "🎯 Interview Ready", description: `${data.questions.length} questions generated from your profile.` });
    } catch (e: any) {
      toast({ title: "Failed to generate questions", description: e.message, variant: "destructive" });
    } finally {
      setStarting(false);
    }
  };

  const handleInterviewComplete = (answered: AnsweredQuestion[], finalReport: InterviewReport) => {
    setAnsweredQuestions(answered);
    setReport(finalReport);
    setPhase("report");
  };

  const handleRestart = () => {
    setPhase("upload");
    setProfile(null);
    setQuestions([]);
    setAnsweredQuestions([]);
    setReport(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Back</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="h-9 w-9 rounded-xl bg-primary shadow-md flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">SmartHire AI</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">Autonomous Interview System</span>
            </div>
          </div>
          {phase === "interview" && (
            <span className="text-xs px-3 py-1.5 rounded-full bg-warning/10 text-warning font-semibold animate-pulse">
              Interview In Progress
            </span>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {phase === "upload" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-semibold mb-4">
                <Brain className="h-3.5 w-3.5" /> Auto AI Interviewer
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                AI-Powered<br />Mock Interview
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                Upload your resume and experience a real AI interview. Get instant feedback on every answer and a comprehensive hiring report.
              </p>
            </div>
            <ResumeUpload onResumeText={handleUpload} isLoading={loading} />
          </div>
        )}

        {phase === "profile" && profile && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight mb-1">Your Professional Profile</h2>
              <p className="text-sm text-muted-foreground">Review and edit before starting the interview.</p>
            </div>
            <StructuredProfileEditor profile={profile} onChange={setProfile} />
            <Button
              onClick={handleStartInterview}
              disabled={starting || profile.skills.length === 0}
              className="w-full h-13 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
              size="lg"
            >
              {starting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Generating Interview Questions...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Start AI Interview
                </span>
              )}
            </Button>
          </div>
        )}

        {phase === "interview" && (
          <InterviewSession
            questions={questions}
            onComplete={handleInterviewComplete}
          />
        )}

        {phase === "report" && report && (
          <InterviewReportView
            report={report}
            answeredQuestions={answeredQuestions}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
};

export default AIInterview;
