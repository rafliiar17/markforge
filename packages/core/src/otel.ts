import {
  trace,
  context,
  Span,
  SpanStatusCode,
  Tracer,
  Attributes,
} from '@opentelemetry/api';

const TRACER_NAME = 'markforge';
const TRACER_VERSION = '1.0.0';

export function getTracer(): Tracer {
  return trace.getTracer(TRACER_NAME, TRACER_VERSION);
}

export interface TraceContextInfo {
  traceId: string;
  spanId: string;
  traceparent: string;
}

export function getCurrentTraceContext(): TraceContextInfo | null {
  const span = trace.getActiveSpan();
  if (!span) return null;

  const ctx = span.spanContext();
  const flags = ctx.traceFlags.toString(16).padStart(2, '0');
  return {
    traceId: ctx.traceId,
    spanId: ctx.spanId,
    traceparent: `00-${ctx.traceId}-${ctx.spanId}-${flags}`,
  };
}

/**
 * Execute an async or sync callback within an active OpenTelemetry span
 */
export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  fn: (span: Span) => Promise<T> | T
): Promise<T> {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err: any) {
      span.recordException(err);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err?.message || 'Operation failed',
      });
      throw err;
    } finally {
      span.end();
    }
  });
}
