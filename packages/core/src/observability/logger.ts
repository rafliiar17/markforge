import pino, { Logger, LevelWithSilent } from 'pino';
import { trace } from '@opentelemetry/api';

export type LogLevel = LevelWithSilent;

// Root Pino logger writing strictly to stderr (protects MCP JSON-RPC stdout integrity)
const rootLogger: Logger = pino(
  {
    level: process.env.LOG_LEVEL?.toLowerCase() || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    // Automatic OpenTelemetry context injection into every log entry
    mixin() {
      const activeSpan = trace.getActiveSpan();
      if (activeSpan) {
        const ctx = activeSpan.spanContext();
        return {
          trace_id: ctx.traceId,
          span_id: ctx.spanId,
          trace_flags: ctx.traceFlags,
        };
      }
      return {};
    },
  },
  typeof process !== 'undefined' && process.stderr ? process.stderr : undefined
);

class LoggerManager {
  private loggerInstance: Logger = rootLogger;

  setLevel(level: LogLevel): void {
    this.loggerInstance.level = level;
  }

  getLevel(): string {
    return this.loggerInstance.level;
  }

  getRoot(): Logger {
    return this.loggerInstance;
  }
}

export const loggerRegistry = new LoggerManager();

/**
 * Create a child Pino logger scoped to a specific namespace
 * Automatically includes OpenTelemetry trace_id and span_id when running inside an active span.
 */
export function createLogger(namespace: string): Logger {
  return rootLogger.child({ namespace });
}

export const logger = createLogger('markforge');

export { rootLogger };
