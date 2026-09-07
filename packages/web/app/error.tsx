'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to client console or monitoring service
    console.error('MarkForge Web Studio Error Boundary caught:', error);
  }, [error]);

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20 shadow-inner">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
              Terjadi Kesalahan di Web Studio
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
              Aplikasi mengalami kendala tak terduga saat memproses dokumen atau antarmuka studio.
            </p>
          </div>
        </div>

        {/* Error Detail Display */}
        <Alert variant="destructive" className="border-red-500/30 bg-red-950/20 text-red-200">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-xs font-semibold uppercase tracking-wider text-red-300">
              Pesan Kesalahan
            </AlertTitle>
          </div>
          <AlertDescription className="mt-2.5">
            <div className="max-h-32 overflow-y-auto rounded-md bg-zinc-950/70 p-3 font-mono text-xs text-red-200 border border-red-900/30 break-all select-text">
              {error.message || 'Unknown runtime error occurred.'}
            </div>
            {error.digest && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 select-text">
                <span className="text-zinc-500">Digest ID:</span>
                <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-zinc-300 border border-zinc-700/50">
                  {error.digest}
                </span>
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            variant="emerald"
            size="default"
            onClick={() => reset()}
            className="w-full sm:flex-1 font-medium shadow-md transition-all active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Muat Ulang
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={handleGoHome}
            className="w-full sm:flex-1 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Kembali ke Halaman Utama
          </Button>
        </div>

        {/* Subtle footer hint */}
        <div className="text-center pt-1 border-t border-zinc-800/60">
          <p className="text-[11px] text-zinc-500">
            MarkForge Universal Engine • Hubungi tim pengembang jika masalah terus berulang.
          </p>
        </div>
      </div>
    </div>
  );
}
