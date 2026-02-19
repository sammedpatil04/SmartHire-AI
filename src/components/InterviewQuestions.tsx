import { useState } from "react";
import { ChevronDown, ChevronRight, MessageSquare, Lightbulb, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InterviewSection } from "@/lib/api";

interface InterviewQuestionsProps {
  sections: InterviewSection[];
}

const difficultyColors: Record<string, string> = {
  easy: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  hard: "bg-destructive/10 text-destructive border-destructive/20",
};

export function InterviewQuestions({ sections }: InterviewQuestionsProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (cat: string) => setExpanded((p) => ({ ...p, [cat]: !p[cat] }));

  return (
    <div className="space-y-3 animate-fade-in">
      {sections.map((section) => (
        <Card key={section.category} className="glass-card overflow-hidden">
          <button
            onClick={() => toggle(section.category)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{section.category}</span>
              <Badge variant="secondary" className="text-xs">{section.questions.length} Qs</Badge>
            </div>
            {expanded[section.category] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {expanded[section.category] && (
            <CardContent className="pt-0 space-y-4">
              {section.questions.map((q, i) => (
                <div key={i} className="border border-border/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium flex-1">{q.question}</p>
                    <Badge className={`text-xs shrink-0 ${difficultyColors[q.difficulty]}`}>{q.difficulty}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-start gap-1.5">
                      <Lightbulb className="h-3 w-3 mt-0.5 text-warning shrink-0" />
                      <span><strong>Why asked:</strong> {q.reason}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Target className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                      <span><strong>Checking:</strong> {q.checking}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
