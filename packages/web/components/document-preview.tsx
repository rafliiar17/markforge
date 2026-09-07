'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DocumentPreviewProps {
  html: string;
  isUpdating?: boolean;
  className?: string;
}

/**
 * High-Fidelity Shimmer Skeleton matching the A4 document layout.
 * Used for lazy loading, initial mounting, or asynchronous document hydration.
 */
export function DocumentPreviewSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-testid="preview-skeleton"
      className={cn(
        'min-h-[960px] w-full max-w-[720px] rounded-sm bg-white p-10 shadow-2xl space-y-6',
        className
      )}
    >
      {/* Header Profile Area */}
      <div className="flex flex-col items-center space-y-2.5 pb-2">
        <Skeleton className="h-8 w-64 bg-zinc-200 dark:bg-zinc-200/60" />
        <Skeleton className="h-4 w-48 bg-zinc-200 dark:bg-zinc-200/60" />
        <Skeleton className="h-3 w-80 bg-zinc-100 dark:bg-zinc-200/40" />
      </div>

      <div className="h-px w-full bg-zinc-100" />

      {/* Summary Section */}
      <div className="space-y-2.5">
        <Skeleton className="h-4 w-36 bg-zinc-300 dark:bg-zinc-300/80" />
        <Skeleton className="h-3 w-full bg-zinc-100 dark:bg-zinc-200/40" />
        <Skeleton className="h-3 w-11/12 bg-zinc-100 dark:bg-zinc-200/40" />
        <Skeleton className="h-3 w-4/5 bg-zinc-100 dark:bg-zinc-200/40" />
      </div>

      {/* Experience Section */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-4 w-44 bg-zinc-300 dark:bg-zinc-300/80" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-52 bg-zinc-200 dark:bg-zinc-200/60" />
          <Skeleton className="h-3 w-28 bg-zinc-100 dark:bg-zinc-200/40" />
        </div>
        <div className="space-y-1.5 pl-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 shrink-0" />
            <Skeleton className="h-3 w-full bg-zinc-100 dark:bg-zinc-200/40" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 shrink-0" />
            <Skeleton className="h-3 w-10/12 bg-zinc-100 dark:bg-zinc-200/40" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 shrink-0" />
            <Skeleton className="h-3 w-11/12 bg-zinc-100 dark:bg-zinc-200/40" />
          </div>
        </div>
      </div>

      {/* Second Experience Block */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-48 bg-zinc-200 dark:bg-zinc-200/60" />
          <Skeleton className="h-3 w-24 bg-zinc-100 dark:bg-zinc-200/40" />
        </div>
        <div className="space-y-1.5 pl-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 shrink-0" />
            <Skeleton className="h-3 w-full bg-zinc-100 dark:bg-zinc-200/40" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 shrink-0" />
            <Skeleton className="h-3 w-9/12 bg-zinc-100 dark:bg-zinc-200/40" />
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-2.5 pt-2">
        <Skeleton className="h-4 w-32 bg-zinc-300 dark:bg-zinc-300/80" />
        <div className="flex flex-wrap gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full bg-zinc-100 dark:bg-zinc-200/50" />
          <Skeleton className="h-6 w-24 rounded-full bg-zinc-100 dark:bg-zinc-200/50" />
          <Skeleton className="h-6 w-16 rounded-full bg-zinc-100 dark:bg-zinc-200/50" />
          <Skeleton className="h-6 w-28 rounded-full bg-zinc-100 dark:bg-zinc-200/50" />
          <Skeleton className="h-6 w-20 rounded-full bg-zinc-100 dark:bg-zinc-200/50" />
        </div>
      </div>
    </div>
  );
}

/**
 * Real-time A4 Document Canvas Preview.
 * Renders in-place with zero flicker during typing and handles live DOM updates cleanly,
 * including client-side SVG rendering for Mermaid flowcharts and diagrams.
 */
export function DocumentPreview({ html, isUpdating, className }: DocumentPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const mermaidNodes = containerRef.current.querySelectorAll('.mermaid');
    if (mermaidNodes.length === 0) return;

    let isMounted = true;

    // Dynamically import mermaid on the client side
    import('mermaid')
      .then((m) => {
        if (!isMounted) return;
        const mermaid = m.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
          },
        });

        mermaidNodes.forEach(async (node, index) => {
          const el = node as HTMLElement;
          const rawSource = el.getAttribute('data-mermaid-src') || el.textContent || '';
          if (!el.getAttribute('data-mermaid-src')) {
            el.setAttribute('data-mermaid-src', rawSource);
          }

          if (!rawSource.trim()) return;

          try {
            const uniqueId = `mermaid-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;
            const { svg } = await mermaid.render(uniqueId, rawSource.trim());
            if (isMounted && el) {
              el.innerHTML = svg;
              el.setAttribute('data-rendered', 'true');
            }
          } catch {
            // Live typing might produce temporary incomplete syntax; keep existing content
          }
        });
      })
      .catch((err) => {
        console.warn('Error loading mermaid module:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [html]);

  return (
    <div className={cn('relative w-full max-w-[720px]', className)}>
      {isUpdating && (
        <div
          data-testid="preview-syncing-indicator"
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-2.5 py-1 text-[10px] font-medium text-emerald-400 shadow-lg backdrop-blur-sm border border-emerald-500/30 animate-pulse"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Syncing
        </div>
      )}

      <div
        ref={containerRef}
        data-testid="document-preview-canvas"
        className="min-h-[960px] rounded-sm bg-white px-10 py-8 text-black shadow-2xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
