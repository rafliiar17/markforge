'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DocumentPreviewProps {
  html: string;
  isUpdating?: boolean;
  className?: string;
  template?: string;
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

export interface MermaidThemeConfig {
  theme: 'base' | 'neutral';
  fontFamily: string;
  themeVariables: Record<string, string>;
}

/**
 * Synchronizes Mermaid diagram styling with MarkForge template presets.
 */
export function getMermaidThemeConfig(template: string = 'ats-classic'): MermaidThemeConfig {
  switch (template) {
    case 'modern-accent':
      return {
        theme: 'base',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        themeVariables: {
          primaryColor: '#ecfdf5', // emerald-50
          primaryTextColor: '#065f46', // emerald-800
          primaryBorderColor: '#059669', // emerald-600
          lineColor: '#0d9488', // teal-600
          secondaryColor: '#f0fdf4',
          tertiaryColor: '#ffffff',
          edgeLabelBackground: '#ffffff',
          nodeBorder: '#059669',
          clusterBkg: '#f0fdf4',
          clusterBorder: '#6ee7b7',
          titleColor: '#0f766e',
          arrowheadColor: '#0d9488',
        },
      };
    case 'tech-spec':
      return {
        theme: 'base',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        themeVariables: {
          primaryColor: '#eff6ff', // blue-50
          primaryTextColor: '#1e40af', // blue-800
          primaryBorderColor: '#2563eb', // blue-600
          lineColor: '#3b82f6', // blue-500
          secondaryColor: '#f8fafc',
          tertiaryColor: '#ffffff',
          edgeLabelBackground: '#ffffff',
          nodeBorder: '#2563eb',
          clusterBkg: '#f8fafc',
          clusterBorder: '#bfdbfe',
          titleColor: '#1e293b',
          arrowheadColor: '#2563eb',
        },
      };
    case 'academic':
      return {
        theme: 'base',
        fontFamily: 'Georgia, "Times New Roman", serif',
        themeVariables: {
          primaryColor: '#f8fafc',
          primaryTextColor: '#1e3a8a',
          primaryBorderColor: '#1e3a8a',
          lineColor: '#1e3a8a',
          secondaryColor: '#ffffff',
          tertiaryColor: '#f1f5f9',
          edgeLabelBackground: '#ffffff',
          nodeBorder: '#1e3a8a',
          clusterBkg: '#f8fafc',
          clusterBorder: '#cbd5e1',
          titleColor: '#000000',
          arrowheadColor: '#1e3a8a',
        },
      };
    case 'executive':
      return {
        theme: 'base',
        fontFamily: 'Georgia, serif',
        themeVariables: {
          primaryColor: '#fffbeb', // amber-50
          primaryTextColor: '#78350f', // amber-900
          primaryBorderColor: '#92400e', // amber-800
          lineColor: '#b45309', // amber-700
          secondaryColor: '#fefce8',
          tertiaryColor: '#ffffff',
          edgeLabelBackground: '#ffffff',
          nodeBorder: '#92400e',
          clusterBkg: '#fefce8',
          clusterBorder: '#fde68a',
          titleColor: '#27272a',
          arrowheadColor: '#92400e',
        },
      };
    case 'ats-classic':
    default:
      return {
        theme: 'neutral',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        themeVariables: {
          primaryColor: '#f8fafc',
          primaryTextColor: '#0f172a',
          primaryBorderColor: '#334155',
          lineColor: '#475569',
          secondaryColor: '#f1f5f9',
          tertiaryColor: '#ffffff',
          edgeLabelBackground: '#ffffff',
        },
      };
  }
}

/**
 * Returns container border and background matching document templates.
 */
export function getTemplateContainerClass(template: string = 'ats-classic'): string {
  switch (template) {
    case 'modern-accent':
      return 'border-emerald-200/80 bg-emerald-50/20';
    case 'tech-spec':
      return 'border-blue-200/80 bg-blue-50/20';
    case 'academic':
      return 'border-zinc-300 bg-white';
    case 'executive':
      return 'border-amber-200/80 bg-amber-50/20';
    case 'ats-classic':
    default:
      return 'border-zinc-200/80 bg-zinc-50/40';
  }
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates user-friendly, non-breaking syntax warning HTML for incomplete Mermaid typing.
 */
export function createMermaidWarningHtml(
  rawSource: string,
  errorMessage?: string,
  lastValidSvg?: string
): string {
  const cleanError = (errorMessage || 'Incomplete or invalid syntax')
    .split('\n')[0]
    .replace(/^Parse error on line \d+:\s*/, '')
    .slice(0, 120);

  if (lastValidSvg) {
    return `
      <div class="mermaid-container w-full flex flex-col items-center">
        <div data-testid="mermaid-syntax-warning" class="mermaid-syntax-warning mb-3 flex w-full max-w-lg items-center justify-between gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-800 shadow-xs dark:text-amber-300">
          <div class="flex items-center gap-1.5 font-medium">
            <svg class="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Incomplete Mermaid syntax (editing...)</span>
          </div>
          <span class="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-mono">Retaining last valid render</span>
        </div>
        <div class="mermaid-svg-wrapper w-full flex justify-center items-center opacity-85 transition-opacity">
          ${lastValidSvg}
        </div>
      </div>
    `.trim();
  }

  return `
    <div data-testid="mermaid-syntax-warning" class="mermaid-syntax-warning flex w-full max-w-lg flex-col items-center justify-center rounded-xl border border-dashed border-amber-400/70 bg-amber-50/50 p-5 text-center my-2 shadow-xs">
      <div class="flex items-center gap-2 font-medium text-xs text-amber-800 dark:text-amber-300">
        <svg class="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Mermaid Syntax Warning: Incomplete Diagram</span>
      </div>
      <p class="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
        Continue typing valid Mermaid syntax to render the diagram.
      </p>
      <div class="mt-2.5 max-h-24 w-full overflow-x-auto rounded bg-zinc-900/90 p-2.5 text-left font-mono text-[10.5px] text-zinc-300 border border-zinc-700/50">
        <code>${escapeHtml(rawSource.trim())}</code>
      </div>
      <div class="mt-1.5 text-[10px] text-amber-700/70 dark:text-amber-400/70 font-mono">
        ${escapeHtml(cleanError)}
      </div>
    </div>
  `.trim();
}

/**
 * Asynchronously validate Mermaid syntax without modifying the DOM.
 */
export async function validateMermaidSyntax(
  source: string
): Promise<{ valid: boolean; error?: string }> {
  if (!source || !source.trim()) {
    return { valid: false, error: 'Empty diagram definition' };
  }
  try {
    const mermaidModule = await import('mermaid');
    const mermaid = mermaidModule.default;
    await mermaid.parse(source.trim());
    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Syntax error' };
  }
}

/**
 * Real-time A4 Document Canvas Preview.
 * Renders in-place with zero flicker during typing and handles live DOM updates cleanly,
 * including client-side SVG rendering for Mermaid flowcharts and diagrams with template-synced theming.
 */
interface DocumentCanvasProps {
  html: string;
  template: string;
}

const DocumentCanvas = React.memo(function DocumentCanvas({
  html,
  template,
}: DocumentCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastValidSvgMap = React.useRef<Map<number, string>>(new Map());

  React.useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const mermaidNodes = containerRef.current.querySelectorAll('.mermaid');
    if (mermaidNodes.length === 0) return;

    let isMounted = true;

    const cleanupErrorElements = (uniqueId?: string) => {
      if (typeof document === 'undefined') return;
      if (uniqueId) {
        const errorEl = document.getElementById(`d${uniqueId}`) || document.getElementById(uniqueId);
        if (errorEl && errorEl.parentElement === document.body) {
          errorEl.remove();
        }
      }
      const stray = document.querySelectorAll('body > [id^="dmermaid-"], body > svg[id^="mermaid-"]');
      stray.forEach((el) => {
        try {
          el.remove();
        } catch {}
      });
    };

    // Dynamically import mermaid on the client side
    import('mermaid')
      .then(async (m) => {
        if (!isMounted) return;
        const mermaid = m.default;

        // Synchronize Mermaid theme with MarkForge templates
        const themeConfig = getMermaidThemeConfig(template);

        mermaid.initialize({
          startOnLoad: false,
          theme: themeConfig.theme,
          themeVariables: themeConfig.themeVariables,
          fontFamily: themeConfig.fontFamily,
          securityLevel: 'loose',
          suppressErrorRendering: true,
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

          // Template-aligned container styling: subtle shadow, rounded borders, centering
          const containerTheme = getTemplateContainerClass(template);
          el.className = cn(
            'mermaid my-6 flex flex-col items-center justify-center overflow-x-auto rounded-xl border p-5 shadow-sm',
            containerTheme
          );

          const uniqueId = `mermaid-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;

          try {
            // First validate syntax before calling render to catch typing errors gracefully
            await mermaid.parse(rawSource.trim());

            // If syntax is valid, render the SVG
            const { svg } = await mermaid.render(uniqueId, rawSource.trim());

            if (isMounted && el) {
              lastValidSvgMap.current.set(index, svg);
              el.innerHTML = `<div class="mermaid-svg-wrapper w-full flex justify-center items-center overflow-x-auto">${svg}</div>`;
              el.setAttribute('data-rendered', 'true');
              el.setAttribute('data-syntax-valid', 'true');
              el.removeAttribute('data-syntax-warning');

              // Ensure SVG element inside is centered and responsive
              const svgEl = el.querySelector('svg');
              if (svgEl) {
                svgEl.style.maxWidth = '100%';
                svgEl.style.height = 'auto';
                svgEl.classList.add('mx-auto', 'block');
              }
              cleanupErrorElements(uniqueId);
            }
          } catch (err: any) {
            // Incomplete / syntax errors while user is actively typing in editor
            if (isMounted && el) {
              const previousSvg = lastValidSvgMap.current.get(index);
              el.innerHTML = createMermaidWarningHtml(rawSource, err?.message, previousSvg);
              el.setAttribute('data-rendered', 'false');
              el.setAttribute('data-syntax-warning', 'true');
              cleanupErrorElements(uniqueId);
            }
          }
        });
      })
      .catch((err) => {
        console.warn('Error loading mermaid module:', err);
      });

    return () => {
      isMounted = false;
      cleanupErrorElements();
    };
  }, [html, template]);

  return (
    <div
      ref={containerRef}
      data-testid="document-preview-canvas"
      className="min-h-[960px] rounded-sm bg-white px-10 py-8 text-black shadow-2xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

/**
 * Real-time A4 Document Canvas Preview.
 * Renders in-place with zero flicker during typing and handles live DOM updates cleanly,
 * including client-side SVG rendering for Mermaid flowcharts and diagrams with template-synced theming.
 */
export function DocumentPreview({
  html,
  isUpdating,
  className,
  template = 'ats-classic',
}: DocumentPreviewProps) {
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

      <DocumentCanvas html={html} template={template} />
    </div>
  );
}
