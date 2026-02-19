import { useState } from "react";
import { Calendar, BookOpen, Rocket, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateRoadmap, type Roadmap } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PrepRoadmapProps {
  resumeText: string;
}

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

export function PrepRoadmap({ resumeText }: PrepRoadmapProps) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateRoadmap(resumeText);
      setRoadmap(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!roadmap) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Preparation Roadmap</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Get a personalized 4-week preparation plan based on your resume's gaps and areas for improvement.
        </p>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Generate Roadmap</span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { title: "Topics to Revise", items: roadmap.topicsToRevise, icon: BookOpen, color: "text-primary" },
          { title: "Skills to Add", items: roadmap.skillsToAdd, icon: Target, color: "text-success" },
          { title: "Projects to Improve", items: roadmap.projectsToImprove, icon: Rocket, color: "text-warning" },
        ].map(({ title, items, icon: Icon, color }) => (
          <Card key={title} className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} /> {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {items.map((item) => <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {roadmap.weeks.map((week) => (
          <Card key={week.week} className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {week.week}
                  </span>
                  Week {week.week}: {week.theme}
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Goal: {week.goal}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {week.topics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{topic.topic}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${priorityColors[topic.priority]}`}>{topic.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
