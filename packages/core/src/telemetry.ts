import { ATSReport, ASTNode } from './types';

export interface CompilationMetrics {
  parseTimeMs: number;
  docxTimeMs?: number;
  pdfTimeMs?: number;
  htmlTimeMs?: number;
  totalTimeMs: number;
}

export interface ASTStats {
  totalNodes: number;
  headings: number;
  bullets: number;
  tables: number;
  codeBlocks: number;
  quotes: number;
}

export interface EngineExecutionInfo {
  primaryEngine: string;
  actualEngineUsed: string;
  fallbackOccurred: boolean;
  attemptedEngines: string[];
}

export interface CompilationTelemetry {
  traceId: string;
  timestamp: string;
  documentTitle?: string;
  templateId: string;
  format: 'docx' | 'pdf' | 'html' | 'both' | 'all';
  metrics: CompilationMetrics;
  astStats: ASTStats;
  atsAudit?: Pick<ATSReport, 'score' | 'grade' | 'actionVerbsCount' | 'quantifiedMetricsCount'>;
  engine?: EngineExecutionInfo;
  outputSizeBytes: number;
  serverTimingHeader: string;
}

export type TelemetryObserver = (event: CompilationTelemetry) => void;

class TelemetryEmitter {
  private observers: TelemetryObserver[] = [];

  subscribe(observer: TelemetryObserver): () => void {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter((o) => o !== observer);
    };
  }

  emit(event: CompilationTelemetry): void {
    for (const observer of this.observers) {
      try {
        observer(event);
      } catch {
        // Suppress observer exceptions
      }
    }
  }
}

export const telemetryEmitter = new TelemetryEmitter();

export function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function extractASTStats(nodes: ASTNode[]): ASTStats {
  let headings = 0;
  let bullets = 0;
  let tables = 0;
  let codeBlocks = 0;
  let quotes = 0;

  for (const node of nodes) {
    if (['h1', 'h2', 'h3', 'h4'].includes(node.type)) headings++;
    else if (node.type === 'bullet') bullets++;
    else if (node.type === 'table') tables++;
    else if (node.type === 'code_block') codeBlocks++;
    else if (node.type === 'quote') quotes++;
  }

  return {
    totalNodes: nodes.length,
    headings,
    bullets,
    tables,
    codeBlocks,
    quotes,
  };
}

export function formatServerTiming(metrics: CompilationMetrics): string {
  const parts: string[] = [
    `parse;dur=${metrics.parseTimeMs.toFixed(1)}`,
  ];
  if (metrics.docxTimeMs !== undefined) {
    parts.push(`docx;dur=${metrics.docxTimeMs.toFixed(1)}`);
  }
  if (metrics.pdfTimeMs !== undefined) {
    parts.push(`pdf;dur=${metrics.pdfTimeMs.toFixed(1)}`);
  }
  if (metrics.htmlTimeMs !== undefined) {
    parts.push(`html;dur=${metrics.htmlTimeMs.toFixed(1)}`);
  }
  parts.push(`total;dur=${metrics.totalTimeMs.toFixed(1)}`);
  return parts.join(', ');
}
