'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  FileText,
  Workflow,
  Link2,
  Hash,
  Zap,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { DocumentTypeDefinition } from '@markforge/core';

export interface AuditScorecardProps {
  atsReport: any;
  isAnalyzing: boolean;
  docTypeId: string;
  activeDocType?: DocumentTypeDefinition;
}

export function AuditScorecard({
  atsReport,
  isAnalyzing,
  docTypeId,
  activeDocType,
}: AuditScorecardProps) {
  const { t } = useI18n();

  if (isAnalyzing) {
    return (
      <div className="w-full max-w-xl space-y-4">
        <Skeleton className="h-28 w-full rounded-lg bg-zinc-800/60" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-16 w-full rounded-lg bg-zinc-800/60" />
          <Skeleton className="h-16 w-full rounded-lg bg-zinc-800/60" />
          <Skeleton className="h-16 w-full rounded-lg bg-zinc-800/60" />
          <Skeleton className="h-16 w-full rounded-lg bg-zinc-800/60" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg bg-zinc-800/60" />
      </div>
    );
  }

  if (!atsReport) {
    return (
      <div className="w-full max-w-xl text-center py-12 text-zinc-500 text-sm">
        {t('audit.scoreSummaryNeedsWork') || 'No audit report available. Click Analyze to run audit.'}
      </div>
    );
  }

  const score = atsReport.score ?? 0;
  const grade = atsReport.grade || (score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D');

  const gradeColor = grade.startsWith('A')
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
    : grade === 'B'
    ? 'text-blue-400 border-blue-500/30 bg-blue-950/20'
    : 'text-amber-400 border-amber-500/30 bg-amber-950/20';

  const scoreSummary =
    score >= 85
      ? t('audit.scoreSummaryExcellent') || 'Excellent! Meets comprehensive document standards and conventions.'
      : score >= 70
      ? t('audit.scoreSummaryGood') || 'Good baseline, but addressing checklist items can significantly elevate impact.'
      : t('audit.scoreSummaryNeedsWork') || 'Needs refinement. Critical sections or recommended elements are missing.';

  return (
    <div className="w-full max-w-xl space-y-5">
      {/* Score Card Header with 0-100 Score Meter and Grade Badge */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <div className="flex-1 pr-4">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            {atsReport.label || t('audit.scoreLabel') || 'DOCUMENT COMPLIANCE AUDIT'}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{score}</span>
            <span className="text-sm text-zinc-400">/ 100</span>
          </div>
          {/* Visual Score Meter Progress Bar */}
          <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{scoreSummary}</p>
        </div>

        <div className={`flex flex-col items-center justify-center rounded-lg border px-5 py-3 ${gradeColor}`}>
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">
            {t('audit.gradeLabel') || 'Grade'}
          </span>
          <span className="text-3xl font-black">{grade}</span>
        </div>
      </div>

      {/* Metric Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Words */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5 text-zinc-400">
            <FileText className="h-3 w-3" />
            <span className="text-[10px] uppercase">{t('audit.metrics.words') || 'Words'}</span>
          </div>
          <p className="text-lg font-bold text-white">
            {atsReport.metrics?.wordCount ?? atsReport.wordCount ?? 0}
          </p>
        </div>

        {/* Read Time */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5 text-zinc-400">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] uppercase">{t('audit.metrics.readingTime') || 'Read Time'}</span>
          </div>
          <p className="text-lg font-bold text-blue-400">
            ~{atsReport.metrics?.readingTimeMinutes ?? atsReport.readingTimeMinutes ?? 1} min
          </p>
        </div>

        {/* Action Verbs or Diagrams */}
        {atsReport.actionVerbsCount !== undefined && atsReport.actionVerbsCount > 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 text-zinc-400">
              <Zap className="h-3 w-3 text-purple-400" />
              <span className="text-[10px] uppercase">{t('audit.metrics.actionVerbs') || 'Action Verbs'}</span>
            </div>
            <p className="text-lg font-bold text-purple-400">{atsReport.actionVerbsCount}</p>
          </div>
        ) : atsReport.metrics?.diagramCount !== undefined ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 text-zinc-400">
              <Workflow className="h-3 w-3 text-purple-400" />
              <span className="text-[10px] uppercase">{t('audit.metrics.diagrams') || 'Diagrams'}</span>
            </div>
            <p className="text-lg font-bold text-purple-400">{atsReport.metrics.diagramCount}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 text-zinc-400">
              <Workflow className="h-3 w-3" />
              <span className="text-[10px] uppercase">{t('audit.metrics.diagrams') || 'Diagrams'}</span>
            </div>
            <p className="text-lg font-bold text-zinc-400">0</p>
          </div>
        )}

        {/* Links or Quantified Metrics */}
        {atsReport.metrics?.linkCount !== undefined ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 text-zinc-400">
              <Link2 className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] uppercase">{t('audit.metrics.links') || 'Links'}</span>
            </div>
            <p className="text-lg font-bold text-emerald-400">{atsReport.metrics.linkCount}</p>
          </div>
        ) : (atsReport.metrics?.metricPointsCount !== undefined || atsReport.quantifiedMetricsCount !== undefined) ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 text-zinc-400">
              <Hash className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] uppercase">{t('audit.metrics.quantified') || 'Quantified'}</span>
            </div>
            <p className="text-lg font-bold text-emerald-400">
              {atsReport.metrics?.metricPointsCount ?? atsReport.quantifiedMetricsCount ?? 0}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 text-zinc-400">
              <Link2 className="h-3 w-3" />
              <span className="text-[10px] uppercase">{t('audit.metrics.links') || 'Links'}</span>
            </div>
            <p className="text-lg font-bold text-zinc-400">0</p>
          </div>
        )}
      </div>

      {/* Dynamic Checklist Items */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2.5">
        <span className="text-xs font-bold text-zinc-200">
          {t('audit.checklistTitle') || 'Requirements & Compliance Checklist'}
        </span>
        <div className="grid grid-cols-1 gap-2 pt-1">
          {atsReport.checklist && atsReport.checklist.length > 0
            ? atsReport.checklist.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-2 px-3 rounded bg-zinc-950/60 border border-zinc-800/60"
                >
                  <div className="flex items-center gap-2 pr-2">
                    {item.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-zinc-200">{item.title}</div>
                      {item.detail && (
                        <div className="text-[11px] text-zinc-400">{item.detail}</div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={item.passed ? 'success' : 'destructive'}
                    className="h-5 text-[10px] shrink-0"
                  >
                    {item.passed
                      ? `+${item.weight} ${t('audit.pts') || 'pts'}`
                      : `0/${item.weight} ${t('audit.pts') || 'pts'}`}
                  </Badge>
                </div>
              ))
            : atsReport.sections?.map((sec: any) => (
                <div
                  key={sec.section}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded bg-zinc-950/60 border border-zinc-800/60"
                >
                  <span className="text-zinc-300">{sec.section}</span>
                  {sec.found ? (
                    <Badge variant="success" className="h-5 text-[10px]">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> {t('audit.found') || 'Found'}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="h-5 text-[10px]">
                      <AlertTriangle className="mr-1 h-3 w-3" /> {t('audit.missing') || 'Missing'}
                    </Badge>
                  )}
                </div>
              ))}
        </div>
      </div>

      {/* Critical Warnings / Suggestions to Improve */}
      {atsReport.warnings && atsReport.warnings.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-xs font-bold text-amber-400">
            {t('audit.recommendationsTitle') || 'Suggestions to improve document'}
          </AlertTitle>
          <AlertDescription className="text-xs space-y-1 mt-1 text-zinc-300">
            {atsReport.warnings.map((w: string, i: number) => (
              <div key={i}>• {w}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Optimization Recommendations */}
      {atsReport.suggestions && atsReport.suggestions.length > 0 && (
        <Alert className="border-blue-900/50 bg-blue-950/20 text-blue-200">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertTitle className="text-xs font-bold text-blue-300">
            {t('audit.recommendationsTitle') || 'Optimization Recommendations'}
          </AlertTitle>
          <AlertDescription className="text-xs space-y-1 mt-1 text-zinc-300">
            {atsReport.suggestions.map((s: string, i: number) => (
              <div key={i}>• {s}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Verbs Found Tag Cloud */}
      {atsReport.actionVerbsFound && atsReport.actionVerbsFound.length > 0 && (
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
    </div>
  );
}
