import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProfileProject } from "@/lib/structured-profile";

interface ProjectsEditorProps {
  items: ProfileProject[];
  onChange: (items: ProfileProject[]) => void;
}

const emptyProject: ProfileProject = { name: "", description: "", technologies: [] };

export function ProjectsEditor({ items, onChange }: ProjectsEditorProps) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProfileProject>(emptyProject);

  const startAdd = () => { setDraft(emptyProject); setEditing(-1); };
  const startEdit = (i: number) => { setDraft({ ...items[i], technologies: [...items[i].technologies] }); setEditing(i); };
  const save = () => {
    if (!draft.name.trim()) return;
    if (editing === -1) onChange([...items, draft]);
    else if (editing !== null) { const u = [...items]; u[editing] = draft; onChange(u); }
    setEditing(null);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const cancel = () => setEditing(null);

  return (
    <div className="space-y-3">
      {items.map((proj, i) =>
        editing === i ? (
          <EditForm key={i} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />
        ) : (
          <Card key={i} className="glass-card group">
            <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                  <p className="font-semibold text-sm truncate">{proj.name}</p>
                </div>
                {proj.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>
                )}
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.technologies.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px] px-2 py-0">{t}</Badge>
                    ))}
                  </div>
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
      {editing === -1 && <EditForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />}
      {editing === null && (
        <Button variant="outline" size="sm" onClick={startAdd} className="w-full border-dashed">
          <Plus className="h-4 w-4 mr-1" /> Add Project
        </Button>
      )}
    </div>
  );
}

function EditForm({
  draft, setDraft, onSave, onCancel,
}: {
  draft: ProfileProject;
  setDraft: (d: ProfileProject) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [techInput, setTechInput] = useState("");
  const addTech = () => {
    const t = techInput.trim();
    if (t && !draft.technologies.includes(t)) {
      setDraft({ ...draft, technologies: [...draft.technologies, t] });
      setTechInput("");
    }
  };
  const removeTech = (tech: string) => setDraft({ ...draft, technologies: draft.technologies.filter((t) => t !== tech) });

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="py-3 px-4 space-y-2">
        <Input placeholder="Project name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="text-sm" />
        <Textarea placeholder="Description..." value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="text-sm min-h-[60px] resize-none" />
        <div className="flex flex-wrap gap-1.5">
          {draft.technologies.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs gap-1 pr-1">
              {t}
              <button onClick={() => removeTech(t)} className="rounded-full hover:bg-muted p-0.5"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add technology..." value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())} className="text-sm" />
          <Button size="sm" variant="outline" onClick={addTech} disabled={!techInput.trim()}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
          <Button size="sm" onClick={onSave} disabled={!draft.name.trim()}><Check className="h-3.5 w-3.5 mr-1" /> Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
