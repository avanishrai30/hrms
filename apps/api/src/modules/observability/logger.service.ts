import { Injectable, type LoggerService as NestLoggerService } from "@nestjs/common";

export type LogLevel = "info" | "warn" | "error" | "debug" | "verbose";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  tenantId?: string;
  requestId?: string;
  message: string;
  metadata?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
}

@Injectable()
export class StructuredLoggerService implements NestLoggerService {
  private defaultContext = "Application";
  private currentTenantId?: string;
  private currentRequestId?: string;

  constructor(context?: string, tenantId?: string, requestId?: string) {
    if (context) this.defaultContext = context;
    this.currentTenantId = tenantId;
    this.currentRequestId = requestId;
  }

  setContext(context: string) {
    this.defaultContext = context;
  }

  setTenantId(tenantId?: string) {
    this.currentTenantId = tenantId;
  }

  setRequestId(requestId?: string) {
    this.currentRequestId = requestId;
  }

  withContext(context: string, tenantId?: string, requestId?: string): StructuredLoggerService {
    return new StructuredLoggerService(
      context,
      tenantId ?? this.currentTenantId,
      requestId ?? this.currentRequestId
    );
  }

  private write(
    level: LogLevel,
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
    errorObj?: { message: string; stack?: string }
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: context || this.defaultContext,
      message,
      ...(this.currentTenantId || meta?.tenantId ? { tenantId: (meta?.tenantId as string) || this.currentTenantId } : {}),
      ...(this.currentRequestId || meta?.requestId ? { requestId: (meta?.requestId as string) || this.currentRequestId } : {}),
      ...(meta ? { metadata: meta } : {}),
      ...(errorObj ? { error: errorObj } : {})
    };

    const serialized = JSON.stringify(entry);

    if (level === "error") {
      process.stderr.write(`${serialized}\n`);
    } else {
      process.stdout.write(`${serialized}\n`);
    }
  }

  log(message: string, context?: string, meta?: Record<string, unknown>) {
    this.write("info", message, context, meta);
  }

  info(message: string, context?: string, meta?: Record<string, unknown>) {
    this.write("info", message, context, meta);
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>) {
    this.write("warn", message, context, meta);
  }

  error(message: string, trace?: string, context?: string, meta?: Record<string, unknown>) {
    const errorObj = trace ? { message, stack: trace } : { message };
    this.write("error", message, context, meta, errorObj);
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>) {
    this.write("debug", message, context, meta);
  }

  verbose(message: string, context?: string, meta?: Record<string, unknown>) {
    this.write("verbose", message, context, meta);
  }
}
