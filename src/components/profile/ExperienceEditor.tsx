import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import type { ProfileExperience } from "@/lib/structured-profile";

interface ExperienceEditorProps {
  items: ProfileExperience[];
  onChange: (items: ProfileExperience[]) => void;
}

const emptyExp: ProfileExperience = { title: "", duration: "", responsibilities: "" };

export function ExperienceEditor({ items, onChange }: ExperienceEditorProps) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProfileExperience>(emptyExp);

  const startAdd = () => {
    setDraft(emptyExp);
    setEditing(-1);
  };

  const startEdit = (i: number) => {
    setDraft({ ...items[i] });
    setEditing(i);
  };

  const save = () => {
    if (!draft.title.trim()) return;
    if (editing === -1) {
      onChange([...items, draft]);
    } else if (editing !== null) {
      const updated = [...items];
      updated[editing] = draft;
      onChange(updated);
    }
    setEditing(null);
  };

  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const cancel = () => setEditing(null);

  return (
    <div className="space-y-3">
      {items.map((exp, i) =>
        editing === i ? (
          <EditForm key={i} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />
        ) : (
          <Card key={i} className="glass-card group">
            <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary shrink-0" />
                  <p className="font-semibold text-sm truncate">{exp.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{exp.duration}</p>
                {exp.responsibilities && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exp.responsibilities}</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(i)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {editing === -1 && (
        <EditForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />
      )}

      {editing === null && (
        <Button variant="outline" size="sm" onClick={startAdd} className="w-full border-dashed">
          <Plus className="h-4 w-4 mr-1" /> Add Experience
        </Button>
      )}
    </div>
  );
}

function EditForm({
  draft, setDraft, onSave, onCancel,
}: {
  draft: ProfileExperience;
  setDraft: (d: ProfileExperience) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="py-3 px-4 space-y-2">
        <Input
          placeholder="Role title (e.g., Software Engineer)"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="text-sm"
        />
        <Input
          placeholder="Duration (e.g., 2 years)"
          value={draft.duration}
          onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
          className="text-sm"
        />
        <Textarea
          placeholder="Key responsibilities..."
          value={draft.responsibilities}
          onChange={(e) => setDraft({ ...draft, responsibilities: e.target.value })}
          className="text-sm min-h-[60px] resize-none"
        />
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-3.5 w-3.5 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={!draft.title.trim()}>
            <Check className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
