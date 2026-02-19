import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SkillsEditorProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsEditor({ skills, onChange }: SkillsEditorProps) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setInput("");
    }
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="pl-3 pr-1.5 py-1.5 text-sm gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No skills added yet</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
          placeholder="Add a skill (e.g., React, Python)..."
          className="text-sm"
        />
        <Button size="sm" variant="outline" onClick={addSkill} disabled={!input.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
}
