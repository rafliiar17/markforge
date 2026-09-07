export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  namespace: string;
  message: string;
  context?: Record<string, unknown>;
}

export type LogSubscriber = (record: LogRecord) => void;

class LoggerRegistry {
  private currentLevel: LogLevel = 'info';
  private subscribers: LogSubscriber[] = [];

  constructor() {
    const envLevel = typeof process !== 'undefined' ? process.env?.LOG_LEVEL?.toLowerCase() : undefined;
    if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
      this.currentLevel = envLevel as LogLevel;
    }
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  getLevel(): LogLevel {
    return this.currentLevel;
  }

  subscribe(subscriber: LogSubscriber): () => void {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== subscriber);
    };
  }

  emit(namespace: string, level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.currentLevel]) {
      return;
    }

    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      namespace,
      message,
      context,
    };

    // Notify custom subscribers
    for (const sub of this.subscribers) {
      try {
        sub(record);
      } catch {
        // Prevent subscriber errors from bubbling
      }
    }

    // Default output to stderr (CRITICAL: NEVER write to stdout to avoid breaking MCP JSON-RPC protocol!)
    if (typeof process !== 'undefined' && process.stderr) {
      const colorPrefix =
        level === 'debug'
          ? '\x1b[90m[DEBUG]\x1b[0m'
          : level === 'info'
          ? '\x1b[36m[INFO]\x1b[0m'
          : level === 'warn'
          ? '\x1b[33m[WARN]\x1b[0m'
          : '\x1b[31m[ERROR]\x1b[0m';

      const ctxStr = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
      process.stderr.write(`${colorPrefix} \x1b[2m[${record.namespace}]\x1b[0m ${message}${ctxStr}\n`);
    }
  }
}

export const loggerRegistry = new LoggerRegistry();

export class ScopedLogger {
  constructor(private namespace: string) {}

  debug(message: string, context?: Record<string, unknown>): void {
    loggerRegistry.emit(this.namespace, 'debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    loggerRegistry.emit(this.namespace, 'info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    loggerRegistry.emit(this.namespace, 'warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    loggerRegistry.emit(this.namespace, 'error', message, context);
  }
}

export function createLogger(namespace: string): ScopedLogger {
  return new ScopedLogger(namespace);
}
