export interface StructuredProfile {
  skills: string[];
  experience: ProfileExperience[];
  projects: ProfileProject[];
  education: ProfileEducation[];
}

export interface ProfileExperience {
  title: string;
  duration: string;
  responsibilities: string;
}

export interface ProfileProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface ProfileEducation {
  degree: string;
  field: string;
  year: string;
}

/**
 * Converts a structured profile into a sanitized text representation
 * for AI processing. Contains NO PII — only professional data.
 */
export function profileToText(profile: StructuredProfile): string {
  const parts: string[] = [];

  if (profile.skills.length > 0) {
    parts.push(`SKILLS:\n${profile.skills.join(", ")}`);
  }

  if (profile.experience.length > 0) {
    parts.push(
      `EXPERIENCE:\n${profile.experience
        .map((e) => `- ${e.title} (${e.duration})\n  ${e.responsibilities}`)
        .join("\n")}`
    );
  }

  if (profile.projects.length > 0) {
    parts.push(
      `PROJECTS:\n${profile.projects
        .map((p) => `- ${p.name}: ${p.description}\n  Technologies: ${p.technologies.join(", ")}`)
        .join("\n")}`
    );
  }

  if (profile.education.length > 0) {
    parts.push(
      `EDUCATION:\n${profile.education
        .map((e) => `- ${e.degree} in ${e.field}${e.year ? ` (${e.year})` : ""}`)
        .join("\n")}`
    );
  }

  return parts.join("\n\n");
}
