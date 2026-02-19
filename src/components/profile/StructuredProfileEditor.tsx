import { ShieldCheck, Pencil, Code2, Briefcase, FolderOpen, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillsEditor } from "./SkillsEditor";
import { ExperienceEditor } from "./ExperienceEditor";
import { ProjectsEditor } from "./ProjectsEditor";
import { EducationEditor } from "./EducationEditor";
import type { StructuredProfile } from "@/lib/structured-profile";

interface StructuredProfileEditorProps {
  profile: StructuredProfile;
  onChange: (profile: StructuredProfile) => void;
}

export function StructuredProfileEditor({ profile, onChange }: StructuredProfileEditorProps) {
  return (
    <div className="space-y-5">
      {/* Privacy & edit notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-accent/40 border border-border/30">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Privacy-first profile.</span>{" "}
          We do not display or store personal information from your resume. Only professional data is shown below.
          <span className="flex items-center gap-1 mt-1 text-primary font-medium">
            <Pencil className="h-3 w-3" /> You can edit or add details to improve accuracy.
          </span>
        </div>
      </div>

      {/* Skills */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" /> Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkillsEditor
            skills={profile.skills}
            onChange={(skills) => onChange({ ...profile, skills })}
          />
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" /> Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExperienceEditor
            items={profile.experience}
            onChange={(experience) => onChange({ ...profile, experience })}
          />
        </CardContent>
      </Card>

      {/* Projects */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" /> Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectsEditor
            items={profile.projects}
            onChange={(projects) => onChange({ ...profile, projects })}
          />
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" /> Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EducationEditor
            items={profile.education}
            onChange={(education) => onChange({ ...profile, education })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
