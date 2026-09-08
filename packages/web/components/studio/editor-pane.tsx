import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  Code2,
  BookOpen,
  Workflow,
  RefreshCw,
  ChevronDown,
  Layers,
  ShieldCheck,
  Database,
  Cpu,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { DocumentTypeDefinition } from '@markforge/core';
import {
  BUILTIN_MERMAID_TEMPLATES,
  listMermaidTemplates,
  MermaidArchitectureTemplate,
} from '@markforge/core';

export interface EditorPaneProps {
  markdown: string;
  onMarkdownChange: (value: string) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onOpenCheatsheet: () => void;
  onInsertMermaid: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  docTypeId: string;
  activeDocType?: DocumentTypeDefinition;
}

export function EditorPane({
  markdown,
  onMarkdownChange,
  onDrop,
  onOpenCheatsheet,
  onInsertMermaid,
  onAnalyze,
  isAnalyzing,
  docTypeId,
  activeDocType,
}: EditorPaneProps) {
  const { t } = useI18n();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isMermaidMenuOpen, setIsMermaidMenuOpen] = useState(false);

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;

  const insertDiagramSnippet = (diagramCode: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onInsertMermaid();
      return;
    }

    const start = textarea.selectionStart ?? markdown.length;
    const end = textarea.selectionEnd ?? markdown.length;

    const before = markdown.substring(0, start);
    const after = markdown.substring(end);
    const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
    const suffix = after.length > 0 && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : '';

    const snippet = `${prefix}\`\`\`mermaid\n${diagramCode.trim()}\n\`\`\`${suffix}`;

    const newMarkdown = before + snippet + after;
    onMarkdownChange(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + snippet.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleInsertMermaid = (templateId: string = 'cloud-microservices') => {
    const template = BUILTIN_MERMAID_TEMPLATES[templateId];
    if (template) {
      insertDiagramSnippet(template.diagram);
    } else {
      insertDiagramSnippet(BUILTIN_MERMAID_TEMPLATES['cloud-microservices'].diagram);
    }
    setIsMermaidMenuOpen(false);
  };

  const getAnalyzeButtonText = () => {
    if (isAnalyzing) {
      return t('editor.analyzing') || 'Analyzing...';
    }
    if (docTypeId === 'cv') {
      return t('editor.analyzeAts') || 'Audit ATS';
    }
    if (docTypeId === 'portfolio') {
      return t('editor.analyzePortfolio') || 'Audit Portofolio';
    }
    if (docTypeId === 'tech-spec') {
      return t('editor.analyzeSpec') || 'Audit Spesifikasi';
    }
    const docShortName = activeDocType?.name?.split('/')[0].trim().split(' ')[0] || 'Dokumen';
    return `Audit ${docShortName}`;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      data-testid="editor-pane"
      className="flex w-1/2 flex-col border-r border-zinc-800 bg-zinc-950"
      onDragOver={handleDragOver}
      onDrop={onDrop}
    >
      {/* Editor Header Toolbar */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/50 px-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2 font-medium text-zinc-300">
          <Code2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>{t('editor.sourceTitle') || 'SUMBER MARKDOWN'}</span>
          <span className="text-[10px] text-zinc-500">
            {t('editor.dropzoneHint') || '| Tarik & lepas berkas .md di sini'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mermaid Architecture Templates Popover Button */}
          <div className="flex items-center rounded-sm bg-zinc-900 border border-zinc-800/80">
            <Button
              variant="ghost"
              size="sm"
              data-testid="mermaid-flow-btn"
              className="h-6 px-2 text-[11px] text-zinc-300 hover:text-emerald-300 hover:bg-zinc-800"
              onClick={() => handleInsertMermaid('cloud-microservices')}
              title="Sisipkan diagram arsitektur Cloud Microservices (klik panah untuk pilihan templat lainnya)"
            >
              <Workflow className="mr-1 h-3 w-3 text-emerald-400" />
              {t('editor.mermaidFlow') || 'Diagram Mermaid'}
            </Button>

            <Popover open={isMermaidMenuOpen} onOpenChange={setIsMermaidMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="mermaid-templates-dropdown"
                  className="h-6 w-5 p-0 text-zinc-400 hover:text-emerald-300 hover:bg-zinc-800 border-l border-zinc-800"
                  title="Pilih templat arsitektur produksi"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-84 max-h-[380px] overflow-y-auto p-2 bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl rounded-lg"
              >
                <div className="px-2 py-1.5 border-b border-zinc-800/80 mb-1">
                  <div className="flex items-center gap-1.5 font-medium text-xs text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{t('editor.mermaidTemplatesTitle') || 'Templat Arsitektur Produksi'}</span>
                  </div>
                  <p className="text-[10.5px] text-zinc-400 mt-0.5">
                    {t('editor.mermaidTemplatesDesc') || 'Pilih pola sistem production-grade untuk disisipkan ke dokumen:'}
                  </p>
                </div>

                <div className="space-y-1">
                  {listMermaidTemplates().map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      data-testid={`mermaid-tmpl-${tmpl.id}`}
                      onClick={() => handleInsertMermaid(tmpl.id)}
                      className="w-full text-left p-2 rounded-md hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800 group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium text-xs text-zinc-200 group-hover:text-emerald-300">
                          {tmpl.name}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-zinc-700 text-zinc-400">
                          {tmpl.category}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                        {tmpl.description}
                      </p>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <span className="text-zinc-700">|</span>

          {/* Dynamic Analyze button with direct tab switch */}
          <Button
            variant="ghost"
            size="sm"
            data-testid="analyze-btn"
            className="h-6 px-2 text-[11px] text-zinc-300 hover:text-emerald-300"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            title="Jalankan audit dan buka kartu skor audit"
          >
            <RefreshCw className={`mr-1 h-3 w-3 text-amber-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {getAnalyzeButtonText()}
          </Button>
          <span className="text-zinc-700">|</span>

          {/* Word Count */}
          <span className="text-[11px] text-zinc-400 font-mono">
            {t('editor.wordsCount', { count: wordCount }) || `${wordCount} kata`}
          </span>
        </div>
      </div>

      {/* Textarea Editor */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          className="h-full w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-zinc-200 outline-none selection:bg-emerald-600/30"
          value={markdown}
          onChange={(e) => onMarkdownChange(e.target.value)}
          placeholder={
            t('editor.placeholder') || 'Ketik atau tempel dokumen markdown Anda di sini...'
          }
          spellCheck={false}
        />
      </div>
    </div>
  );
}
