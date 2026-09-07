'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  Code2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Copy,
  Check,
  Cpu,
  Layers,
  Zap,
  Info,
  FolderDown,
  UploadCloud,
  RefreshCw,
  SlidersHorizontal,
  Workflow,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { DocumentPreviewSkeleton } from '@/components/document-preview';

const LazyDocumentPreview = dynamic(
  () => import('@/components/document-preview').then((mod) => mod.DocumentPreview),
  {
    ssr: false,
    loading: () => <DocumentPreviewSkeleton />,
  }
);

const DEFAULT_MARKDOWN = `# Jane Doe
*Senior Staff Software Engineer*
jane.doe@example.com | +1 (555) 019-2834 | linkedin.com/in/janedoe | github.com/janedoe | San Francisco, CA

## Professional Summary
Accomplished distributed systems engineer with 8+ years architecting high-throughput cloud infrastructure serving 60M+ monthly active users. Specialized in high-availability backend microservices, performance optimization, and developer tooling. Spearheaded initiatives cutting cloud expenditures by $180,000 annually.

## Work Experience
### Staff Software Engineer | ApexCloud Technologies
*2022 - Present | San Francisco, CA*
- Architected multi-region event-streaming platform using Go, Kafka, and Redis processing 2.4M msgs/sec with 99.999% uptime.
- Optimized database query caching layers, slashing p99 latency by 45% (from 320ms to 42ms).
- Spearheaded company-wide zero-trust network migration across 140+ Kubernetes microservices.
- Mentored 12 senior and mid-level software engineers across 3 distributed engineering squads.

### Senior Backend Engineer | DataSphere Systems
*2019 - 2022 | Austin, TX*
- Engineered automated CI/CD validation pipelines, decreasing release deployment cycle from 2 weeks to 35 minutes.
- Automated database indexing and migration scripts, saving an estimated 15 engineering hours weekly.
- Built high-performance gRPC gateway serving 15,000 requests/second with sub-10ms latency.

## Education
### B.S. in Computer Science & Engineering | University of California, Berkeley
*2015 - 2019 | GPA: 3.85 / 4.0*

## Technical Skills
- **Languages:** TypeScript, Go, Rust, Python, SQL, C++
- **Cloud & DevOps:** Kubernetes, Docker, AWS, Cloudflare Workers, Terraform, Prometheus
- **Databases & Queues:** PostgreSQL, Redis, Apache Kafka, ClickHouse, SQLite

## Featured Projects
### MarkForge Open Source
- Author and lead maintainer of open-source universal markdown-to-document compilation engine with ATS optimization and Model Context Protocol (MCP) server support.
`;

const TEMPLATE_PRESETS = [
  { id: 'ats-classic', name: 'ATS Classic (Standard)', category: 'Resume' },
  { id: 'modern-accent', name: 'Modern Emerald', category: 'Resume' },
  { id: 'tech-spec', name: 'Technical Spec / RFC', category: 'Documentation' },
  { id: 'academic', name: 'Academic Whitepaper', category: 'Academic' },
  { id: 'executive', name: 'Executive Leadership', category: 'Executive' },
];

export default function MarkForgeStudio() {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [template, setTemplate] = useState<string>('ats-classic');
  const [activeTab, setActiveTab] = useState<string>('preview');

  // Export & preview states
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  // ATS Report state
  const [atsReport, setAtsReport] = useState<any>(null);

  // Preview HTML & sync state
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isUpdatingPreview, setIsUpdatingPreview] = useState<boolean>(false);

  // Fetch / Compute ATS report
  const runAnalysis = async (content: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: content }),
      });
      if (res.ok) {
        const data = await res.json();
        setAtsReport(data);
      }
    } catch (e) {
      console.error('Analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    runAnalysis(markdown);
  }, []);

  // Update HTML preview smoothly on markdown or template change without flickering
  useEffect(() => {
    setIsUpdatingPreview(true);
    generateLocalPreview(markdown, template);
    const timer = setTimeout(() => {
      setIsUpdatingPreview(false);
    }, 120);
    return () => clearTimeout(timer);
  }, [markdown, template]);

  const generateLocalPreview = (md: string, tmpl: string) => {
    // Generate inline simulated HTML for real-time responsiveness
    const lines = md.split('\n');
    let outHtml = '';

    const isTeal = tmpl === 'modern-accent';
    const isTech = tmpl === 'tech-spec';
    const isAcademic = tmpl === 'academic';
    const isExecutive = tmpl === 'executive';

    const accentColor = isTeal ? '#0f766e' : isTech ? '#2563eb' : isExecutive ? '#854d0e' : '#000000';
    const font = isAcademic ? 'Georgia, serif' : isExecutive ? 'Georgia, serif' : 'system-ui, -apple-system, sans-serif';

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle Code Blocks & Mermaid Flowcharts
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim().toLowerCase();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // skip closing ```
        const rawCode = codeLines.join('\n');
        if (lang === 'mermaid') {
          outHtml += `<div class="mermaid my-5 flex justify-center overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 shadow-sm">${rawCode}</div>`;
        } else {
          const safeCode = rawCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          outHtml += `<pre style="font-family:'Courier New', monospace; font-size:9pt; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; padding:8px 12px; margin:10px 0; overflow-x:auto;"><code>${safeCode}</code></pre>`;
        }
        continue;
      }

      if (!trimmed) {
        i++;
        continue;
      }

      if (trimmed.startsWith('# ')) {
        const align = (tmpl === 'tech-spec' || isAcademic) ? 'text-left' : 'text-center';
        outHtml += `<h1 style="font-family:${font}; font-size:24pt; font-weight:bold; color:${accentColor}; margin:0 0 6px 0; text-align:${(tmpl === 'tech-spec' || isAcademic) ? 'left' : 'center'}">${trimmed.slice(2)}</h1>`;
      } else if (trimmed.startsWith('## ')) {
        outHtml += `<h2 style="font-family:${font}; font-size:11pt; font-weight:bold; text-transform:${tmpl.includes('ats') ? 'uppercase' : 'none'}; color:${accentColor}; border-bottom:1.5px solid ${accentColor}; margin:16px 0 6px 0; padding-bottom:2px; letter-spacing:0.5px">${trimmed.slice(3)}</h2>`;
      } else if (trimmed.startsWith('### ')) {
        outHtml += `<h3 style="font-family:${font}; font-size:10pt; font-weight:bold; color:#1f2937; margin:10px 0 2px 0;">${trimmed.slice(4)}</h3>`;
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        outHtml += `<li style="font-family:${font}; font-size:9.5pt; color:#374151; margin:0 0 3px 18px; list-style-type:disc">${trimmed.slice(2)}</li>`;
      } else if (trimmed.includes('|') && i < 10) {
        outHtml += `<div style="font-family:${font}; font-size:9pt; color:#4b5563; text-align:center; padding-bottom:6px; margin-bottom:12px; border-bottom:1px solid #e5e7eb">${trimmed}</div>`;
      } else if (/^\*[^*].*[^*]\*$/.test(trimmed)) {
        outHtml += `<p style="font-family:${font}; font-size:10.5pt; font-style:italic; color:#6b7280; text-align:center; margin:0 0 6px 0">${trimmed.slice(1, -1)}</p>`;
      } else {
        outHtml += `<p style="font-family:${font}; font-size:9.5pt; color:#1f2937; margin:0 0 6px 0; line-height:1.4">${trimmed}</p>`;
      }

      i++;
    }

    setPreviewHtml(outHtml);
  };

  // Export to DOCX handler
  const handleExportDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      const res = await fetch('/api/compile/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown,
          template,
          title: 'MarkForge-Document',
        }),
      });
      if (!res.ok) throw new Error('DOCX compilation failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `markforge-${template}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Error exporting DOCX: ${e.message}`);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  // Export to PDF handler
  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const res = await fetch('/api/compile/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown,
          template,
          title: 'MarkForge-Document',
        }),
      });
      if (!res.ok) throw new Error('PDF compilation failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `markforge-${template}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Error exporting PDF: ${e.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setMarkdown(text);
          runAnalysis(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // Insert Mermaid Flowchart snippet into markdown editor
  const insertMermaidSnippet = () => {
    const snippet = `\n\n## System Flow & Architecture\n\`\`\`mermaid\ngraph TD\n  A[Markdown Input] --> B[MarkForge Engine]\n  B --> C{Output Format?}\n  C -->|DOCX| D[OpenXML Document]\n  C -->|PDF| E[LibreOffice / Weasyprint]\n  C -->|Web| F[Live Studio + Mermaid SVG]\n  D --> G[Download .docx]\n  E --> H[Download .pdf]\n\`\`\`\n`;
    setMarkdown((prev) => prev + snippet);
  };

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        markforge: {
          command: 'bun',
          args: ['run', '/path/to/markforge/packages/mcp/src/index.ts'],
        },
      },
    },
    null,
    2
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      {/* ── Header Bar ── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>MarkForge</span>
          </div>
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-950/20 text-xs">
            v1.0.0 Open Source
          </Badge>
          <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300">
            MD → PDF / DOCX
          </Badge>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Template Select */}
          <div className="w-56">
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="h-8 bg-zinc-950 border-zinc-700 text-xs text-zinc-200">
                <SelectValue placeholder="Select Template" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectGroup>
                  <SelectLabel className="text-xs text-zinc-400">Document Styles</SelectLabel>
                  {TEMPLATE_PRESETS.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Export DOCX Button */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-xs text-zinc-100"
            onClick={handleExportDocx}
            disabled={isGeneratingDocx}
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
            {isGeneratingDocx ? 'Compiling...' : 'Export DOCX'}
          </Button>

          {/* Export PDF Button */}
          <Button
            size="sm"
            variant="emerald"
            className="h-8 text-xs font-semibold"
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-white" />
            {isGeneratingPdf ? 'Compiling...' : 'Export PDF'}
          </Button>

          {/* MCP Integration Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 text-xs text-zinc-300 hover:text-white">
                <Cpu className="mr-1.5 h-3.5 w-3.5 text-purple-400" />
                MCP Server
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
                  <Cpu className="h-5 w-5 text-purple-400" />
                  Model Context Protocol (MCP) Setup
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Connect MarkForge directly into Claude Desktop, Cursor, or Antigravity to convert documents and analyze ATS scores via AI prompts.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-2">
                <p className="text-xs text-zinc-300">
                  Add this block to your <code className="bg-zinc-800 px-1 py-0.5 rounded text-emerald-400">claude_desktop_config.json</code> or cursor config:
                </p>
                <div className="relative rounded-md bg-zinc-950 p-3 font-mono text-xs text-zinc-300 border border-zinc-800 overflow-x-auto">
                  <pre>{mcpConfigJson}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-2 h-7 px-2 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(mcpConfigJson);
                      setCopiedMcp(true);
                      setTimeout(() => setCopiedMcp(false), 2000);
                    }}
                  >
                    {copiedMcp ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <div className="rounded bg-purple-950/30 border border-purple-800/40 p-2.5 text-xs text-purple-200">
                  ⚡ <strong>AI Tools Included:</strong> <code>convert_markdown</code>, <code>analyze_document</code>, <code>list_templates</code>, and <code>doctor</code>.
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* ── Main Studio Split View ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: Markdown Editor */}
        <div
          className="flex w-1/2 flex-col border-r border-zinc-800 bg-zinc-950"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Editor Header Toolbar */}
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/50 px-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2 font-medium text-zinc-300">
              <Code2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>MARKDOWN SOURCE</span>
              <span className="text-[10px] text-zinc-500">| Drop any .md file</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-zinc-400 hover:text-emerald-300"
                onClick={insertMermaidSnippet}
                title="Insert sample Mermaid flowchart"
              >
                <Workflow className="mr-1 h-3 w-3 text-emerald-400" />
                Mermaid Flow
              </Button>
              <span className="text-zinc-600">|</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-zinc-400 hover:text-zinc-200"
                onClick={() => runAnalysis(markdown)}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Analyze ATS
              </Button>
              <span className="text-zinc-600">|</span>
              <span className="text-[11px] text-zinc-400">
                {markdown.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </div>

          {/* Textarea Editor */}
          <div className="relative flex-1">
            <textarea
              className="h-full w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-zinc-200 outline-none selection:bg-emerald-600/30"
              value={markdown}
              onChange={(e) => {
                setMarkdown(e.target.value);
              }}
              placeholder="Paste or write your markdown document here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Pane: Live Preview & ATS Auditor */}
        <div className="flex w-1/2 flex-col bg-zinc-900/40">
          {/* Tabs bar */}
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between">
                <TabsList className="h-7 bg-zinc-950 p-0.5">
                  <TabsTrigger value="preview" className="h-6 px-2.5 text-xs">
                    <Eye className="mr-1 h-3 w-3" />
                    Document Preview
                  </TabsTrigger>
                  <TabsTrigger value="ats" className="h-6 px-2.5 text-xs">
                    <Sparkles className="mr-1 h-3 w-3 text-amber-400" />
                    ATS Audit
                    {atsReport && (
                      <Badge
                        variant="secondary"
                        className={`ml-1.5 h-4 px-1 text-[10px] font-bold ${
                          atsReport.score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {atsReport.score}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-800">
                    A4 Canvas 1:1 Parity
                  </Badge>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-6 flex justify-center">
            {activeTab === 'preview' && (
              <LazyDocumentPreview
                html={previewHtml}
                isUpdating={isUpdatingPreview}
              />
            )}

            {activeTab === 'ats' && (
              <div className="w-full max-w-xl space-y-5">
                {isAnalyzing ? (
                  /* High-Fidelity Shimmer Skeletons for ATS cards */
                  <div className="space-y-4">
                    <Skeleton className="h-28 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </div>
                ) : atsReport ? (
                  <>
                    {/* Score Card Header */}
                    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                          ATS COMPLIANCE SCORE
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-4xl font-extrabold text-white">{atsReport.score}</span>
                          <span className="text-sm text-zinc-400">/ 100</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">
                          {atsReport.score >= 85
                            ? 'Excellent! Optimized for modern enterprise ATS parsers.'
                            : 'Good baseline, but improvements can boost keyword visibility.'}
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 px-5 py-3">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Grade</span>
                        <span
                          className={`text-3xl font-black ${
                            atsReport.grade.startsWith('A')
                              ? 'text-emerald-400'
                              : atsReport.grade === 'B'
                              ? 'text-blue-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {atsReport.grade}
                        </span>
                      </div>
                    </div>

                    {/* Metric Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                        <span className="text-[10px] text-zinc-400 uppercase">Impact Verbs</span>
                        <p className="text-lg font-bold text-purple-400">{atsReport.actionVerbsCount}</p>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                        <span className="text-[10px] text-zinc-400 uppercase">Quantified Metrics</span>
                        <p className="text-lg font-bold text-emerald-400">{atsReport.quantifiedMetricsCount}</p>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                        <span className="text-[10px] text-zinc-400 uppercase">Read Time</span>
                        <p className="text-lg font-bold text-blue-400">~{atsReport.readingTimeMinutes} min</p>
                      </div>
                    </div>

                    {/* Standard Sections Checklist */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2.5">
                      <span className="text-xs font-bold text-zinc-200">Standard Sections Audit</span>
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {atsReport.sections.map((sec: any) => (
                          <div
                            key={sec.section}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded bg-zinc-950/60 border border-zinc-800/60"
                          >
                            <span className="text-zinc-300">{sec.section}</span>
                            {sec.found ? (
                              <Badge variant="success" className="h-5 text-[10px]">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Found
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="h-5 text-[10px]">
                                <AlertTriangle className="mr-1 h-3 w-3" /> Missing
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Critical Warnings */}
                    {atsReport.warnings.length > 0 && (
                      <Alert variant="warning">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold">Suggestions to improve parseability</AlertTitle>
                        <AlertDescription className="text-xs space-y-1 mt-1">
                          {atsReport.warnings.map((w: string, i: number) => (
                            <div key={i}>• {w}</div>
                          ))}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Verbs Found Tag Cloud */}
                    {atsReport.actionVerbsFound.length > 0 && (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
                        <span className="text-xs font-bold text-zinc-200">
                          Detected Action Verbs ({atsReport.actionVerbsFound.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {atsReport.actionVerbsFound.map((verb: string) => (
                            <Badge key={verb} variant="secondary" className="text-[11px] bg-zinc-800 text-zinc-300">
                              {verb}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
