import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sanitizeResumeText, PRIVACY_INSTRUCTION } from "../_shared/sanitize.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS = {
  analyze: (resume: string) => `${PRIVACY_INSTRUCTION}

You are an expert HR tech analyst and resume evaluator. Analyze the following ANONYMIZED resume thoroughly and return a JSON response.

ANONYMIZED RESUME:
${resume}

Return ONLY valid JSON with this exact structure:
{
  "overallScore": <number 0-100>,
  "categories": {
    "dsaProblemSolving": <number 0-100>,
    "developmentSkills": <number 0-100>,
    "sqlDatabases": <number 0-100>,
    "projectsQuality": <number 0-100>,
    "resumeStructure": <number 0-100>
  },
  "skills": [<string array of detected skills>],
  "experience": [{"title": "", "duration": ""}],
  "education": [{"degree": "", "field": "", "year": ""}],
  "projects": [{"name": "", "description": "", "technologies": []}],
  "strengths": [<string array, 3-5 items>],
  "weaknesses": [<string array, 3-5 items>],
  "redFlags": [<string array, 0-3 items>],
  "recommendation": "hire" | "consider" | "reject",
  "summary": "<2-3 sentence professional summary without any personal identifiers>"
}

IMPORTANT: Do NOT include any names, emails, phone numbers, addresses, or personal identifiers in the output.`,

  questions: (resume: string) => `${PRIVACY_INSTRUCTION}

You are a senior technical interviewer. Based on this ANONYMIZED resume, generate targeted interview questions.

ANONYMIZED RESUME:
${resume}

Return ONLY valid JSON:
{
  "sections": [
    {
      "category": "DSA / Problem Solving",
      "questions": [
        {"question": "", "difficulty": "easy"|"medium"|"hard", "reason": "", "checking": ""}
      ]
    },
    {
      "category": "SQL / Databases",
      "questions": [{"question": "", "difficulty": "", "reason": "", "checking": ""}]
    },
    {
      "category": "Frontend / React",
      "questions": [{"question": "", "difficulty": "", "reason": "", "checking": ""}]
    },
    {
      "category": "Project-Based",
      "questions": [{"question": "", "difficulty": "", "reason": "", "checking": ""}]
    },
    {
      "category": "Behavioral / HR",
      "questions": [{"question": "", "difficulty": "", "reason": "", "checking": ""}]
    }
  ]
}

Generate 3-4 questions per section. For project-based questions, reference specific projects from the resume. Never reference candidate names or personal details.`,

  jdMatch: (resume: string, jd: string) => `${PRIVACY_INSTRUCTION}

You are an expert recruiter matching tool. Compare the candidate's ANONYMIZED resume against the job description.

ANONYMIZED RESUME:
${resume}

JOB DESCRIPTION:
${jd}

Return ONLY valid JSON:
{
  "eligibility": "Eligible" | "Partially Eligible" | "Not Eligible",
  "matchPercentage": <number 0-100>,
  "matchedSkills": [<string array>],
  "missingSkills": [<string array>],
  "suggestions": [<string array, 3-5 actionable suggestions>],
  "summary": "<2-3 sentence analysis without personal identifiers>"
}`,

  roadmap: (resume: string) => `${PRIVACY_INSTRUCTION}

You are a career coach. Create a 4-week preparation roadmap based on the resume's weaknesses.

ANONYMIZED RESUME:
${resume}

Return ONLY valid JSON:
{
  "weeks": [
    {
      "week": 1,
      "theme": "",
      "topics": [{"topic": "", "priority": "high"|"medium"|"low", "resources": ""}],
      "goal": ""
    }
  ],
  "topicsToRevise": [<string array>],
  "skillsToAdd": [<string array>],
  "projectsToImprove": [<string array>]
}`,

  structure: (resume: string) => `${PRIVACY_INSTRUCTION}

You are an expert resume parser. Extract ONLY professional data from this anonymized resume into structured JSON.
Do NOT include any personal identifiers.

ANONYMIZED RESUME:
${resume}

Return ONLY valid JSON with this exact structure:
{
  "skills": [<string array of technical skills, frameworks, tools, languages>],
  "experience": [
    {"title": "<role title>", "duration": "<e.g. 2 years>", "responsibilities": "<key responsibilities>"}
  ],
  "projects": [
    {"name": "<project name>", "description": "<what it does>", "technologies": [<string array>]}
  ],
  "education": [
    {"degree": "<degree>", "field": "<field of study>", "year": "<graduation year or empty>"}
  ]
}

Extract ALL relevant entries. If a section has no data, return an empty array.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, resumeText, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    // Sanitize resume text — strip all PII before processing
    const sanitizedResume = sanitizeResumeText(resumeText || "");
    if (!sanitizedResume.trim()) throw new Error("Resume content is empty after processing.");

    let prompt = "";
    switch (action) {
      case "analyze": prompt = PROMPTS.analyze(sanitizedResume); break;
      case "questions": prompt = PROMPTS.questions(sanitizedResume); break;
      case "jdMatch": prompt = PROMPTS.jdMatch(sanitizedResume, jobDescription || ""); break;
      case "roadmap": prompt = PROMPTS.roadmap(sanitizedResume); break;
      case "structure": prompt = PROMPTS.structure(sanitizedResume); break;
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
          { role: "system", content: "You are a precise AI that returns only valid JSON. No markdown, no explanations, just JSON. Never include personal identifiers in your output." },
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
      const errText = await response.text();
      // Do NOT log raw resume text — only log error status
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
      // Do NOT log raw AI content that might contain residual data
      console.error("Failed to parse AI response format");
      throw new Error("AI returned invalid format. Please try again.");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e instanceof Error ? e.message : "Unknown error");
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
