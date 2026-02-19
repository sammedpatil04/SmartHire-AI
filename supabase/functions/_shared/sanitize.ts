/**
 * PII Sanitization Utility
 * Strips personally identifiable information from resume text
 * before sending to AI models. Privacy-by-design approach.
 */

const PII_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi, replacement: "[EMAIL_REMOVED]" },
  // Phone numbers (various formats)
  { pattern: /(\+?\d{1,4}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}/g, replacement: "[PHONE_REMOVED]" },
  // URLs (LinkedIn, GitHub, personal sites)
  { pattern: /https?:\/\/[^\s,)]+/gi, replacement: "[URL_REMOVED]" },
  { pattern: /www\.[^\s,)]+/gi, replacement: "[URL_REMOVED]" },
  // LinkedIn profile patterns
  { pattern: /linkedin\.com\/in\/[^\s,)]+/gi, replacement: "[URL_REMOVED]" },
  // GitHub profile patterns
  { pattern: /github\.com\/[^\s,)]+/gi, replacement: "[URL_REMOVED]" },
  // Date of birth patterns
  { pattern: /\b(date of birth|dob|d\.o\.b\.?)\s*[:.]?\s*\d{1,2}[\s\/\-\.]\d{1,2}[\s\/\-\.]\d{2,4}/gi, replacement: "[DOB_REMOVED]" },
  { pattern: /\b(born|birthday)\s*[:.]?\s*\d{1,2}[\s\/\-\.]\d{1,2}[\s\/\-\.]\d{2,4}/gi, replacement: "[DOB_REMOVED]" },
  // Gender references
  { pattern: /\b(gender|sex)\s*[:.]?\s*(male|female|non[- ]?binary|other|prefer not to say)\b/gi, replacement: "[GENDER_REMOVED]" },
  // Full address patterns (street + city + state/zip)
  { pattern: /\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|place|pl)[\s,]+[\w\s]+,?\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?/gi, replacement: "[ADDRESS_REMOVED]" },
  // Simpler address: city, state ZIP
  { pattern: /[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?/g, replacement: "[ADDRESS_REMOVED]" },
  // PIN/ZIP codes standalone
  { pattern: /\bpin\s*(?:code)?\s*[:.]?\s*\d{5,6}\b/gi, replacement: "[PIN_REMOVED]" },
  // Passport / ID numbers
  { pattern: /\b(passport|national id|aadhar|aadhaar|ssn|social security)\s*(?:no\.?|number|#)?\s*[:.]?\s*[\dA-Z\-]+/gi, replacement: "[ID_REMOVED]" },
  // Marital status
  { pattern: /\b(marital status|married|unmarried|single|divorced|widowed)\b/gi, replacement: "[PERSONAL_REMOVED]" },
  // Nationality / visa
  { pattern: /\b(nationality|citizenship|visa status)\s*[:.]?\s*[\w\s]+/gi, replacement: "[PERSONAL_REMOVED]" },
];

/**
 * Remove the "header" section of a resume that typically contains
 * name, contact info, and personal details (usually the first few lines).
 */
function removeHeaderBlock(text: string): string {
  const lines = text.split("\n");
  let professionalStartIndex = 0;

  // Scan the first 15 lines for the start of professional content
  const professionalKeywords = /\b(experience|skills|education|summary|objective|profile|projects|certifications|achievements|technical|work history|employment|qualifications|competencies)\b/i;

  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    if (professionalKeywords.test(lines[i])) {
      professionalStartIndex = i;
      break;
    }
  }

  // If we found a professional section, skip everything before it
  if (professionalStartIndex > 0) {
    return lines.slice(professionalStartIndex).join("\n");
  }

  return text;
}

/**
 * Main sanitization function.
 * Strips PII from resume text and returns only professional content.
 */
export function sanitizeResumeText(rawText: string): string {
  if (!rawText || typeof rawText !== "string") return "";

  // Step 1: Remove header block (name, contact details)
  let sanitized = removeHeaderBlock(rawText);

  // Step 2: Apply regex-based PII removal
  for (const { pattern, replacement } of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  // Step 3: Clean up consecutive replacement markers and whitespace
  sanitized = sanitized
    .replace(/(\[[\w_]+\]\s*){2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return sanitized;
}

/**
 * Privacy instruction to prepend to all AI prompts
 */
export const PRIVACY_INSTRUCTION = `IMPORTANT PRIVACY RULES:
- The resume content below has been anonymized. All personal identifiers have been removed.
- Do NOT infer, assume, or generate any personal identity details (name, email, phone, address, gender, age).
- Do NOT reference any [REMOVED] markers in your output.
- Focus EXCLUSIVELY on professional skills, experience, projects, education, and certifications.
- Never include personal names, emails, or contact info in your response.
`;
