/**
 * Structured Logging Middleware
 * 
 * Logs all requests and responses with structured context for debugging and monitoring
 */

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  operation: string;
  userId?: number;
  duration?: number;
  status?: number;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Create a structured log entry
 */
export function createLogEntry(
  operation: string,
  level: "info" | "warn" | "error" | "debug" = "info",
  context?: {
    userId?: number;
    duration?: number;
    status?: number;
    error?: string;
    details?: Record<string, unknown>;
  }
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    operation,
    userId: context?.userId,
    duration: context?.duration,
    status: context?.status,
    error: context?.error,
    details: context?.details,
  };
}

/**
 * Log operation with structured format
 */
export function log(entry: LogEntry): void {
  const prefix = `[${entry.level.toUpperCase()}]`;
  const timestamp = `${entry.timestamp}`;
  const operation = `${entry.operation}`;
  const userId = entry.userId ? ` [user:${entry.userId}]` : "";
  const duration = entry.duration ? ` (${entry.duration}ms)` : "";
  const status = entry.status ? ` [${entry.status}]` : "";

  const message = `${prefix} ${timestamp} ${operation}${userId}${duration}${status}`;

  if (entry.level === "error") {
    console.error(message, {
      error: entry.error,
      details: entry.details,
    });
  } else if (entry.level === "warn") {
    console.warn(message, entry.details);
  } else if (entry.level === "debug") {
    console.debug(message, entry.details);
  } else {
    console.log(message, entry.details);
  }
}

/**
 * Log API request
 */
export function logRequest(
  operation: string,
  context?: { userId?: number; details?: Record<string, unknown> }
): void {
  log(
    createLogEntry("REQUEST", "info", {
      userId: context?.userId,
      details: { operation, ...context?.details },
    })
  );
}

/**
 * Log API response
 */
export function logResponse(
  operation: string,
  duration: number,
  context?: { userId?: number; status?: number; details?: Record<string, unknown> }
): void {
  log(
    createLogEntry("RESPONSE", "info", {
      userId: context?.userId,
      duration,
      status: context?.status || 200,
      details: { operation, ...context?.details },
    })
  );
}

/**
 * Log error with context
 */
export function logErrorEntry(
  operation: string,
  error: Error | string,
  context?: { userId?: number; details?: Record<string, unknown> }
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  log(
    createLogEntry("ERROR", "error", {
      userId: context?.userId,
      error: errorMessage,
      details: {
        operation,
        stack: errorStack,
        ...context?.details,
      },
    })
  );
}

/**
 * Measure operation duration and log
 */
export async function measureOperation<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: { userId?: number; details?: Record<string, unknown> }
): Promise<T> {
  const startTime = Date.now();
  logRequest(operation, context);

  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    logResponse(operation, duration, { ...context, status: 200 });
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logErrorEntry(operation, error as Error, { ...context, details: { duration } });
    throw error;
  }
}

/**
 * Measure sync operation duration and log
 */
export function measureOperationSync<T>(
  operation: string,
  fn: () => T,
  context?: { userId?: number; details?: Record<string, unknown> }
): T {
  const startTime = Date.now();
  logRequest(operation, context);

  try {
    const result = fn();
    const duration = Date.now() - startTime;
    logResponse(operation, duration, { ...context, status: 200 });
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logErrorEntry(operation, error as Error, { ...context, details: { duration } });
    throw error;
  }
}

/**
 * Create a tRPC middleware for logging
 */
export function createLoggingMiddleware() {
  return async ({ ctx, next, path }: any) => {
    const startTime = Date.now();
    const userId = ctx.user?.id;

    try {
      logRequest(path, { userId, details: { type: "trpc" } });
      const result = await next();
      const duration = Date.now() - startTime;
      logResponse(path, duration, { userId, status: 200 });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logErrorEntry(path, error as Error, {
        userId,
        details: { duration, type: "trpc" },
      });
      throw error;
    }
  };
}
