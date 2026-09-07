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
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            Ganti Tipe Dokumen
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Pilih apakah Anda ingin memuat contoh starter markdown untuk tipe baru atau mempertahankan konten teks Anda saat ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Comparison Cards: Current vs Target */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Current Type Card */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700">
                    Tipe Saat Ini
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
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-700/60 bg-emerald-950/40">
                    Target Baru
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

          <div className="rounded-md bg-zinc-950 border border-zinc-800/80 p-2.5 text-xs text-zinc-400">
            💡 <strong>Tips:</strong> Memilih <span className="text-zinc-200 font-medium">"Muat Contoh"</span> akan menimpa editor dengan starter template resmi tipe ini. Memilih <span className="text-zinc-200 font-medium">"Pertahankan Teks"</span> akan mempertahankan seluruh isi dokumen Anda sembari memperbarui aturan audit & styling.
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onConfirm(false)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            Pertahankan Teks Saat Ini
          </Button>

          <Button
            type="button"
            variant="emerald"
            size="sm"
            onClick={() => onConfirm(true)}
            className="text-xs font-medium"
          >
            {`Muat Contoh ${targetType.name}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
