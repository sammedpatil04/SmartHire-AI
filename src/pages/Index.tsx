import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, BarChart3, MessageSquare, Target, Map, Sparkles, Brain, Mic, UserCheck, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ScoreOverview } from "@/components/ScoreOverview";
import { SkillCharts } from "@/components/SkillCharts";
import { InterviewQuestions } from "@/components/InterviewQuestions";
import { JDComparison } from "@/components/JDComparison";
import { PrepRoadmap } from "@/components/PrepRoadmap";
import { StructuredProfileEditor } from "@/components/profile/StructuredProfileEditor";
import { structureResume, analyzeResume, generateQuestions, type ResumeAnalysis, type InterviewSection } from "@/lib/api";
import { profileToText, type StructuredProfile } from "@/lib/structured-profile";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [profile, setProfile] = useState<StructuredProfile | null>(null);
  const [profileText, setProfileText] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [questions, setQuestions] = useState<InterviewSection[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();

  // Step 1: Upload → extract structured profile (no raw text stored)
  const handleUpload = async (text: string) => {
    setLoading(true);
    try {
      const structured = await structureResume(text);
      setProfile(structured);
      setActiveTab("profile");
      toast({ title: "✨ Profile Extracted", description: "Review and edit your professional profile below." });
    } catch (e: any) {
      toast({ title: "Extraction Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Analyze from structured profile only (no raw text)
  const handleAnalyze = async () => {
    if (!profile) return;
    setAnalyzing(true);
    const text = profileToText(profile);
    setProfileText(text);
    try {
      const [analysisData, questionsData] = await Promise.all([
        analyzeResume(text),
        generateQuestions(text),
      ]);
      setAnalysis(analysisData);
      setQuestions(questionsData.sections);
      setActiveTab("overview");
      toast({ title: "✨ Analysis Complete", description: `Resume scored ${analysisData.overallScore}/100` });
    } catch (e: any) {
      toast({ title: "Analysis Failed", description: e.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const hasProfile = !!profile;
  const hasResults = !!analysis;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary shadow-md flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">SmartHire AI</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">AI-Powered Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/interview"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
            >
              <Mic className="h-4 w-4" /> AI Interview
            </Link>
            {hasResults && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-success/10 text-success font-semibold">
                Score: {analysis!.overallScore}/100
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto mb-8 bg-card border border-border/50 p-1.5 h-auto flex-wrap rounded-xl shadow-sm">
            <TabsTrigger value="upload" className="gap-2 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" /> Upload
            </TabsTrigger>
            <TabsTrigger value="profile" disabled={!hasProfile} className="gap-2 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <UserCheck className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="overview" disabled={!hasResults} className="gap-2 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <Sparkles className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="charts" disabled={!hasResults} className="gap-2 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4" /> Skills
            </TabsTrigger>
            <TabsTrigger value="questions" disabled={!hasResults} className="gap-2 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <MessageSquare className="h-4 w-4" /> Questions
            </TabsTrigger>
            <TabsTrigger value="jd" disabled={!hasResults} className="gap-2 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <Target className="h-4 w-4" /> JD Match
            </TabsTrigger>
            <TabsTrigger value="roadmap" disabled={!hasResults} className="gap-2 text-xs sm:text-sm rounded-lg data-[state=active]:shadow-sm">
              <Map className="h-4 w-4" /> Roadmap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-semibold mb-4">
                  <Sparkles className="h-3.5 w-3.5" /> Powered by AI
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                  SmartHire AI<br />Intelligence Platform
                </h1>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                  Upload your resume and get instant AI-powered analysis with scores, interview prep, and career roadmap.
                </p>
              </div>
              <ResumeUpload onResumeText={handleUpload} isLoading={loading} />

              {/* Features preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
                {[
                  { icon: BarChart3, label: "Score Analysis", desc: "0-100 rating" },
                  { icon: MessageSquare, label: "Interview Qs", desc: "Tailored questions" },
                  { icon: Target, label: "JD Matching", desc: "Skill gap analysis" },
                  { icon: Map, label: "Prep Roadmap", desc: "4-week plan" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="text-center p-4 rounded-xl bg-card border border-border/40 hover:border-primary/30 transition-colors">
                    <Icon className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            {profile && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Extracted Profile</h2>
                  <p className="text-sm text-muted-foreground">Review and edit your professional details before analysis.</p>
                </div>
                <StructuredProfileEditor profile={profile} onChange={setProfile} />
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || profile.skills.length === 0}
                  className="w-full h-13 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
                  size="lg"
                >
                  {analyzing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> Analyzing Profile with AI...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" /> Analyze Profile with AI
                    </span>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview">
            {analysis && <ScoreOverview analysis={analysis} />}
          </TabsContent>

          <TabsContent value="charts">
            {analysis && <SkillCharts categories={analysis.categories} />}
          </TabsContent>

          <TabsContent value="questions">
            {questions && <InterviewQuestions sections={questions} />}
          </TabsContent>

          <TabsContent value="jd">
            <JDComparison resumeText={profileText} />
          </TabsContent>

          <TabsContent value="roadmap">
            <PrepRoadmap resumeText={profileText} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
