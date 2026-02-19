import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sanitizeResumeText, PRIVACY_INSTRUCTION } from "../_shared/sanitize.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS = {
  generateQuestions: (resume: string) => `${PRIVACY_INSTRUCTION}

You are a senior technical interviewer at a top tech company. Based on this ANONYMIZED resume, generate a structured set of interview questions.

ANONYMIZED RESUME:
${resume}

RULES:
- Questions MUST be tailored to the candidate's actual skills, projects, and experience level
- Reference specific projects, technologies, and experiences from the resume
- Do NOT ask about skills not mentioned in the resume
- Do NOT reference candidate name or personal details
- Vary difficulty appropriately

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "",
      "category": "DSA / Problem Solving" | "SQL / Databases" | "Frontend / React" | "Backend" | "Project-Based" | "Behavioral / HR",
      "difficulty": "Easy" | "Medium" | "Hard",
      "skillTested": "",
      "expectedDepth": "brief" | "moderate" | "detailed",
      "timeLimit": 120
    }
  ]
}

Generate exactly 10-12 questions covering all applicable categories. For project-based questions, reference specific projects from the resume.`,

  evaluateAnswer: (question: string, answer: string, category: string, difficulty: string) => `You are a strict but fair technical interviewer evaluating a candidate's answer.

QUESTION: ${question}
CATEGORY: ${category}
DIFFICULTY: ${difficulty}

CANDIDATE'S ANSWER:
${answer}

Evaluate the answer on these criteria and return ONLY valid JSON:
{
  "score": <number 0-10>,
  "technicalCorrectness": <number 0-10>,
  "conceptClarity": <number 0-10>,
  "depthOfExplanation": <number 0-10>,
  "communicationQuality": <number 0-10>,
  "strengths": [<string array, 1-3 items>],
  "weaknesses": [<string array, 1-3 items>],
  "idealAnswer": "<2-3 sentence ideal answer summary>",
  "improvementTips": [<string array, 1-3 actionable tips>]
}

Be fair but rigorous. An empty or irrelevant answer should score 0-1. A perfect answer scores 9-10.`,

  generateReport: (questionsAndAnswers: string) => `You are an HR analytics expert. Generate a comprehensive interview report based on the following questions, answers, and per-answer evaluations.

${PRIVACY_INSTRUCTION}

INTERVIEW DATA:
${questionsAndAnswers}

Return ONLY valid JSON:
{
  "overallScore": <number 0-100>,
  "categoryScores": {
    "dsaProblemSolving": <number 0-100 or null if not tested>,
    "sqlDatabases": <number 0-100 or null>,
    "frontendReact": <number 0-100 or null>,
    "backend": <number 0-100 or null>,
    "projectBased": <number 0-100 or null>,
    "behavioral": <number 0-100 or null>
  },
  "strongestSkills": [<string array, 2-4 items>],
  "weakestSkills": [<string array, 2-4 items>],
  "readinessLevel": "Interview Ready" | "Needs Improvement" | "Not Ready",
  "recommendation": "Strong Hire" | "Hire" | "Borderline" | "Reject",
  "summary": "<3-4 sentence professional summary without personal identifiers>",
  "detailedFeedback": "<2-3 paragraph detailed feedback>"
}`
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, resumeText, question, answer, category, difficulty, interviewData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    let prompt = "";
    switch (action) {
      case "generateQuestions": {
        const sanitizedResume = sanitizeResumeText(resumeText || "");
        if (!sanitizedResume.trim()) throw new Error("Resume content is empty after processing.");
        prompt = PROMPTS.generateQuestions(sanitizedResume);
        break;
      }
      case "evaluateAnswer": prompt = PROMPTS.evaluateAnswer(question, answer, category, difficulty); break;
      case "generateReport": prompt = PROMPTS.generateReport(interviewData); break;
      default: throw new Error("Invalid action");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a precise AI that returns only valid JSON. No markdown, no explanations, just JSON. Never include personal identifiers in output." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response format");
      throw new Error("AI returned invalid format. Please try again.");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-interview error:", e instanceof Error ? e.message : "Unknown error");
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
