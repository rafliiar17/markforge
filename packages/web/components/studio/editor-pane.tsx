'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Code2, BookOpen, Workflow, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { DocumentTypeDefinition } from '@markforge/core';

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

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;

  const handleInsertMermaid = () => {
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

    const snippet = `${prefix}\`\`\`mermaid\ngraph TD\n    A[Mulai Proyek] --> B{Validasi Kebutuhan}\n    B -->|Ya| C[Desain Arsitektur]\n    B -->|Tidak| D[Revisi Spesifikasi]\n    C --> E[Eksekusi & Rilis]\n\`\`\`${suffix}`;

    const newMarkdown = before + snippet + after;
    onMarkdownChange(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + snippet.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
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
          {/* Mermaid Flow insert button */}
          <Button
            variant="ghost"
            size="sm"
            data-testid="mermaid-flow-btn"
            className="h-6 px-2 text-[11px] text-zinc-300 hover:text-emerald-300"
            onClick={handleInsertMermaid}
            title="Sisipkan diagram alur Mermaid di posisi kursor"
          >
            <Workflow className="mr-1 h-3 w-3 text-emerald-400" />
            {t('editor.mermaidFlow') || 'Diagram Alur Mermaid'}
          </Button>
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
