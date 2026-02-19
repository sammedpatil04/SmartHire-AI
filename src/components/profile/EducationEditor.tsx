import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { ProfileEducation } from "@/lib/structured-profile";

interface EducationEditorProps {
  items: ProfileEducation[];
  onChange: (items: ProfileEducation[]) => void;
}

const emptyEdu: ProfileEducation = { degree: "", field: "", year: "" };

export function EducationEditor({ items, onChange }: EducationEditorProps) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProfileEducation>(emptyEdu);

  const startAdd = () => { setDraft(emptyEdu); setEditing(-1); };
  const startEdit = (i: number) => { setDraft({ ...items[i] }); setEditing(i); };
  const save = () => {
    if (!draft.degree.trim()) return;
    if (editing === -1) onChange([...items, draft]);
    else if (editing !== null) { const u = [...items]; u[editing] = draft; onChange(u); }
    setEditing(null);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const cancel = () => setEditing(null);

  return (
    <div className="space-y-3">
      {items.map((edu, i) =>
        editing === i ? (
          <EditForm key={i} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />
        ) : (
          <Card key={i} className="glass-card group">
            <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{edu.degree}</p>
                  <p className="text-xs text-muted-foreground">
                    {edu.field}{edu.year ? ` · ${edu.year}` : ""}
                  </p>
                </div>
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
      {editing === -1 && <EditForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />}
      {editing === null && (
        <Button variant="outline" size="sm" onClick={startAdd} className="w-full border-dashed">
          <Plus className="h-4 w-4 mr-1" /> Add Education
        </Button>
      )}
    </div>
  );
}

function EditForm({
  draft, setDraft, onSave, onCancel,
}: {
  draft: ProfileEducation;
  setDraft: (d: ProfileEducation) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="py-3 px-4 space-y-2">
        <Input placeholder="Degree (e.g., B.Tech)" value={draft.degree} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} className="text-sm" />
        <Input placeholder="Field of study (e.g., Computer Science)" value={draft.field} onChange={(e) => setDraft({ ...draft, field: e.target.value })} className="text-sm" />
        <Input placeholder="Graduation year (optional)" value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} className="text-sm" />
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
          <Button size="sm" onClick={onSave} disabled={!draft.degree.trim()}><Check className="h-3.5 w-3.5 mr-1" /> Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
