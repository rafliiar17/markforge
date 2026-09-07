'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export interface DocumentTypeSummary {
  id: string;
  name: string;
  description?: string;
}

export interface TemplateSwitchDialogProps {
  open: boolean;
  currentType: DocumentTypeSummary;
  targetType: DocumentTypeSummary;
  onConfirm: (loadStarter: boolean) => void;
  onCancel: () => void;
}

export function TemplateSwitchDialog({
  open,
  currentType,
  targetType,
  onConfirm,
  onCancel,
}: TemplateSwitchDialogProps) {
  const { t } = useI18n();

  const title = t('switchDialog.title') || 'Ganti Tipe Dokumen';
  const description =
    t('switchDialog.description') ||
    'Pilih apakah Anda ingin memuat contoh starter markdown untuk tipe baru atau mempertahankan konten teks Anda saat ini.';
  const currentDocLabel = t('switchDialog.currentDoc') || 'Tipe Saat Ini';
  const targetDocLabel = t('switchDialog.targetDoc') || 'Target Baru';
  const cancelLabel = t('switchDialog.cancel') || 'Batal';
  const keepTextLabel = t('switchDialog.keepText') || 'Pertahankan Teks Saat Ini';
  const loadStarterLabel =
    t('switchDialog.loadStarter', { target: targetType.name }) ||
    `Muat Contoh ${targetType.name}`;
  const tipText =
    t('switchDialog.tip') ||
    'Tips: Memilih "Muat Contoh" akan menimpa editor dengan starter template resmi tipe ini. Memilih "Pertahankan Teks" akan mempertahankan seluruh isi dokumen Anda sembari memperbarui aturan audit & styling.';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-xl sm:max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="pr-6">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
            <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Comparison Cards: Current vs Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Current Type Card */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700">
                    {currentDocLabel}
                  </Badge>
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <h4 className="text-xs font-semibold text-zinc-200">{currentType.name}</h4>
                {currentType.description && (
                  <p className="mt-1 text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">
                    {currentType.description}
                  </p>
                )}
              </div>
            </div>

            {/* Target Type Card */}
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-700/60 bg-emerald-950/40">
                    {targetDocLabel}
                  </Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <h4 className="text-xs font-semibold text-emerald-300">{targetType.name}</h4>
                {targetType.description && (
                  <p className="mt-1 text-[11px] text-zinc-300 line-clamp-3 leading-relaxed">
                    {targetType.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-md bg-zinc-950 border border-zinc-800/80 p-2.5 text-xs text-zinc-400 leading-relaxed">
            💡 <strong>Tips:</strong> {tipText.replace(/^Tips?:\s*/i, '')}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white px-3"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onConfirm(false)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5"
          >
            {keepTextLabel}
          </Button>

          <Button
            type="button"
            variant="emerald"
            size="sm"
            onClick={() => onConfirm(true)}
            className="text-xs font-medium px-4 truncate max-w-full sm:max-w-sm shrink-0"
            title={loadStarterLabel}
          >
            {loadStarterLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
