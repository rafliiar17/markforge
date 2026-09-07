'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Sparkles, Code2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { DocumentPreviewSkeleton } from '@/components/document-preview';
import { AuditScorecard } from './audit-scorecard';
import type { DocumentTypeDefinition } from '@markforge/core';

const LazyDocumentPreview = dynamic(
  () => import('@/components/document-preview').then((mod) => mod.DocumentPreview),
  {
    ssr: false,
    loading: () => <DocumentPreviewSkeleton />,
  }
);

export interface PreviewPaneProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  previewHtml: string;
  isUpdatingPreview: boolean;
  template: string;
  docTypeId: string;
  activeDocType?: DocumentTypeDefinition;
  atsReport: any;
  isAnalyzing: boolean;
}

export function PreviewPane({
  activeTab,
  onTabChange,
  previewHtml,
  isUpdatingPreview,
  template,
  docTypeId,
  activeDocType,
  atsReport,
  isAnalyzing,
}: PreviewPaneProps) {
  const { t } = useI18n();

  const getAuditTabLabel = () => {
    if (docTypeId === 'cv') {
      return 'ATS Audit';
    }
    if (docTypeId === 'portfolio') {
      return 'Portfolio Audit';
    }
    if (docTypeId === 'tech-spec') {
      return 'Spec Audit';
    }
    const docShortName = activeDocType?.name?.split('/')[0].trim().split(' ')[0] || 'Doc';
    return `${docShortName} Audit`;
  };

  return (
    <div className="flex w-1/2 flex-col bg-zinc-900/40">
      {/* Tabs Bar */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="h-7 bg-zinc-950 p-0.5">
              {/* Document Preview Tab */}
              <TabsTrigger value="preview" data-testid="tab-preview" className="h-6 px-2.5 text-xs">
                <Eye className="mr-1 h-3 w-3" />
                {t('tabs.documentPreview') || 'Document Preview'}
              </TabsTrigger>

              {/* Audit Scorecard Tab */}
              <TabsTrigger value="ats" data-testid="tab-audit" className="h-6 px-2.5 text-xs">
                <Sparkles className="mr-1 h-3 w-3 text-amber-400" />
                {t('tabs.auditScorecard') || getAuditTabLabel()}
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

              {/* Raw HTML Output Tab */}
              <TabsTrigger value="raw" data-testid="tab-raw" className="h-6 px-2.5 text-xs">
                <Code2 className="mr-1 h-3 w-3" />
                {t('tabs.rawOutput') || 'Raw HTML'}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-800">
                {t('tabs.parityBadge') || 'A4 Canvas 1:1 Parity'}
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
            template={template}
          />
        )}

        {activeTab === 'ats' && (
          <AuditScorecard
            atsReport={atsReport}
            isAnalyzing={isAnalyzing}
            docTypeId={docTypeId}
            activeDocType={activeDocType}
          />
        )}

        {activeTab === 'raw' && (
          <div className="w-full max-w-2xl rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-300 border border-zinc-800 overflow-auto max-h-[calc(100vh-140px)]">
            <pre className="whitespace-pre-wrap break-all">{previewHtml}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
