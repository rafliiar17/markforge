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

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;

  const getAnalyzeButtonText = () => {
    if (isAnalyzing) {
      return t('editor.analyzing') || 'Analyzing...';
    }
    if (docTypeId === 'cv') {
      return t('editor.analyzeAts') || 'Analyze ATS';
    }
    if (docTypeId === 'portfolio') {
      return t('editor.analyzePortfolio') || 'Analyze Portfolio';
    }
    if (docTypeId === 'tech-spec') {
      return t('editor.analyzeSpec') || 'Analyze Spec';
    }
    const docShortName = activeDocType?.name?.split('/')[0].trim().split(' ')[0] || 'Doc';
    return `Analyze ${docShortName}`;
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
          <span>{t('editor.sourceTitle') || 'MARKDOWN SOURCE'}</span>
          <span className="text-[10px] text-zinc-500">
            {t('editor.dropzoneHint') || '| Drop any .md file'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Syntax Guide trigger */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] text-zinc-400 hover:text-emerald-300"
            onClick={onOpenCheatsheet}
            title={t('header.syntaxGuide') || 'Panduan Sintaks'}
          >
            <BookOpen className="mr-1 h-3 w-3 text-emerald-400" />
            {t('editor.formatGuide') || 'Panduan Format'}
          </Button>
          <span className="text-zinc-600">|</span>

          {/* Mermaid Flow insert button */}
          <Button
            variant="ghost"
            size="sm"
            data-testid="mermaid-flow-btn"
            className="h-6 px-2 text-[11px] text-zinc-400 hover:text-emerald-300"
            onClick={onInsertMermaid}
            title="Insert sample Mermaid flowchart"
          >
            <Workflow className="mr-1 h-3 w-3 text-emerald-400" />
            {t('editor.mermaidFlow') || 'Mermaid Flow'}
          </Button>
          <span className="text-zinc-600">|</span>

          {/* Dynamic Analyze button */}
          <Button
            variant="ghost"
            size="sm"
            data-testid="analyze-btn"
            className="h-6 px-2 text-[11px] text-zinc-400 hover:text-zinc-200"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            <RefreshCw className={`mr-1 h-3 w-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {getAnalyzeButtonText()}
          </Button>
          <span className="text-zinc-600">|</span>

          {/* Word Count */}
          <span className="text-[11px] text-zinc-400">
            {t('editor.wordsCount', { count: wordCount }) || `${wordCount} words`}
          </span>
        </div>
      </div>

      {/* Textarea Editor */}
      <div className="relative flex-1">
        <textarea
          className="h-full w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-zinc-200 outline-none selection:bg-emerald-600/30"
          value={markdown}
          onChange={(e) => onMarkdownChange(e.target.value)}
          placeholder={
            t('editor.placeholder') || 'Paste or write your markdown document here...'
          }
          spellCheck={false}
        />
      </div>
    </div>
  );
}
