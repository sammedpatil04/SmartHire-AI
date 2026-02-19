import { supabase } from "@/integrations/supabase/client";

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  skillTested: string;
  expectedDepth: "brief" | "moderate" | "detailed";
  timeLimit: number;
}

export interface AnswerEvaluation {
  score: number;
  technicalCorrectness: number;
  conceptClarity: number;
  depthOfExplanation: number;
  communicationQuality: number;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  improvementTips: string[];
}

export interface InterviewReport {
  overallScore: number;
  categoryScores: Record<string, number | null>;
  strongestSkills: string[];
  weakestSkills: string[];
  readinessLevel: "Interview Ready" | "Needs Improvement" | "Not Ready";
  recommendation: "Strong Hire" | "Hire" | "Borderline" | "Reject";
  summary: string;
  detailedFeedback: string;
}

export interface AnsweredQuestion {
  question: InterviewQuestion;
  answer: string;
  evaluation: AnswerEvaluation;
}

async function callInterviewFunction(action: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("ai-interview", {
    body: { action, ...body },
  });
  if (error) throw new Error(error.message || "Interview function failed");
  if (data?.error) throw new Error(data.error);
  return data;
}

export const generateInterviewQuestions = (resumeText: string): Promise<{ questions: InterviewQuestion[] }> =>
  callInterviewFunction("generateQuestions", { resumeText });

export const evaluateAnswer = (
  question: string, answer: string, category: string, difficulty: string
): Promise<AnswerEvaluation> =>
  callInterviewFunction("evaluateAnswer", { question, answer, category, difficulty });

export const generateInterviewReport = (interviewData: string): Promise<InterviewReport> =>
  callInterviewFunction("generateReport", { interviewData });
