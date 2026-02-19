import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResumeUploadProps {
  onResumeText: (text: string) => void;
  isLoading: boolean;
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: any) => item.str).join(" "));
  }
  return pages.join("\n\n");
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export function ResumeUpload({ onResumeText, isLoading }: ResumeUploadProps) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["txt", "pdf", "docx"].includes(ext || "")) {
      toast({ title: "Unsupported format", description: "Please upload a PDF, DOCX, or TXT file.", variant: "destructive" });
      return;
    }

    setFileName(file.name);
    setParsing(true);

    try {
      let content = "";
      if (ext === "txt") {
        content = await file.text();
      } else if (ext === "pdf") {
        content = await extractPdfText(file);
      } else if (ext === "docx") {
        content = await extractDocxText(file);
      }

      if (!content.trim()) {
        toast({ title: "Empty file", description: "Could not extract text. Try pasting manually.", variant: "destructive" });
      } else {
        setText(content);
        toast({ title: "File parsed", description: `Extracted ${content.length} characters from ${file.name}` });
        onResumeText(content);
      }
    } catch (err) {
      console.error("Parse error:", err);
      toast({ title: "Parse failed", description: "Could not read this file. Please try again.", variant: "destructive" });
    } finally {
      setParsing(false);
    }
  }, [toast, onResumeText]);

  const clearFile = () => { setFileName(null); setText(""); };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement("input");
      input.type = "file";
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      handleFileUpload({ target: input } as any);
    }
  }, [handleFileUpload]);

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 hover:bg-accent/30 transition-all duration-300 group"
      >
        {parsing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-medium">Parsing {fileName}...</p>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{fileName}</p>
              <p className="text-xs text-muted-foreground">{text.length.toLocaleString()} characters extracted</p>
            </div>
            <button onClick={clearFile} className="ml-2 p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <p className="text-base font-semibold text-foreground">Drop your resume here or click to upload</p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Supports <span className="font-medium text-foreground">PDF</span>, <span className="font-medium text-foreground">DOCX</span>, and <span className="font-medium text-foreground">TXT</span> files
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              {["PDF", "DOCX", "TXT"].map((fmt) => (
                <span key={fmt} className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">{fmt}</span>
              ))}
            </div>
            <input type="file" accept=".txt,.pdf,.docx" onChange={handleFileUpload} className="hidden" />
          </label>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-semibold text-foreground">Analyzing Resume with AI...</span>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-accent/40 border border-border/30">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Privacy-first analysis.</span>{" "}
          We automatically strip all personal information (name, email, phone, address) before AI processing. Only professional skills, experience, and projects are analyzed. No PII is stored or sent to AI models.
        </p>
      </div>
    </div>
  );
}
