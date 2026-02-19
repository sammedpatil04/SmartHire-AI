import { supabase } from "@/integrations/supabase/client";
import type { StructuredProfile } from "@/lib/structured-profile";

export interface ResumeAnalysis {
  overallScore: number;
  categories: {
    dsaProblemSolving: number;
    developmentSkills: number;
    sqlDatabases: number;
    projectsQuality: number;
    resumeStructure: number;
  };
  skills: string[];
  experience: { title: string; duration: string }[];
  education: { degree: string; field: string; year: string }[];
  projects: { name: string; description: string; technologies: string[] }[];
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
  recommendation: "hire" | "consider" | "reject";
  summary: string;
}

export interface InterviewQuestion {
  question: string;
  difficulty: "easy" | "medium" | "hard";
  reason: string;
  checking: string;
}

export interface InterviewSection {
  category: string;
  questions: InterviewQuestion[];
}

export interface JDMatch {
  eligibility: "Eligible" | "Partially Eligible" | "Not Eligible";
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  summary: string;
}

export interface RoadmapWeek {
  week: number;
  theme: string;
  topics: { topic: string; priority: "high" | "medium" | "low"; resources: string }[];
  goal: string;
}

export interface Roadmap {
  weeks: RoadmapWeek[];
  topicsToRevise: string[];
  skillsToAdd: string[];
  projectsToImprove: string[];
}

async function callEdgeFunction(action: string, resumeText: string, jobDescription?: string) {
  const { data, error } = await supabase.functions.invoke("analyze-resume", {
    body: { action, resumeText, jobDescription },
  });
  if (error) throw new Error(error.message || "Analysis failed");
  if (data?.error) throw new Error(data.error);
  return data;
}

export const structureResume = (text: string): Promise<StructuredProfile> => callEdgeFunction("structure", text);
export const analyzeResume = (text: string): Promise<ResumeAnalysis> => callEdgeFunction("analyze", text);
export const generateQuestions = (text: string): Promise<{ sections: InterviewSection[] }> => callEdgeFunction("questions", text);
export const matchJD = (text: string, jd: string): Promise<JDMatch> => callEdgeFunction("jdMatch", text, jd);
export const generateRoadmap = (text: string): Promise<Roadmap> => callEdgeFunction("roadmap", text);
