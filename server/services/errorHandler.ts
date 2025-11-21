/**
 * Error Handling Utilities
 */

import { TRPCError } from "@trpc/server";

export interface ErrorContext {
  userId?: number;
  operation: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export function logError(error: unknown, context: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error("[ERROR]", {
    operation: context.operation,
    message: errorMessage,
    userId: context.userId,
    timestamp: context.timestamp.toISOString(),
    details: context.details,
    stack: errorStack,
  });
}

export async function withErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>,
  fallback?: T,
  context?: { userId?: number; details?: Record<string, unknown> }
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logError(error, {
      operation,
      userId: context?.userId,
      timestamp: new Date(),
      details: context?.details,
    });

    if (fallback !== undefined) {
      return fallback;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Operation failed: ${operation}`,
    });
  }
}

export function withErrorHandlingSync<T>(
  operation: string,
  fn: () => T,
  fallback?: T,
  context?: { userId?: number; details?: Record<string, unknown> }
): T {
  try {
    return fn();
  } catch (error) {
    logError(error, {
      operation,
      userId: context?.userId,
      timestamp: new Date(),
      details: context?.details,
    });

    if (fallback !== undefined) {
      return fallback;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Operation failed: ${operation}`,
    });
  }
}

export async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: Error }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export function safeSync<T>(
  fn: () => T
): { success: true; data: T } | { success: false; error: Error } {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function retryAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const delayMs = initialDelayMs * Math.pow(2, attempt);

      if (attempt < maxRetries - 1) {
        console.warn(`[RETRY] ${operation} attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  logError(lastError, {
    operation: `${operation} (all ${maxRetries} retries failed)`,
    timestamp: new Date(),
  });

  throw lastError || new Error(`Operation failed after ${maxRetries} retries`);
}

export function mapErrorToTRPC(error: unknown): TRPCError {
  if (error instanceof TRPCError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes("not found") || errorMessage.includes("404")) {
    return new TRPCError({
      code: "NOT_FOUND",
      message: errorMessage,
    });
  }

  if (errorMessage.includes("unauthorized") || errorMessage.includes("401")) {
    return new TRPCError({
      code: "UNAUTHORIZED",
      message: errorMessage,
    });
  }

  if (errorMessage.includes("forbidden") || errorMessage.includes("403")) {
    return new TRPCError({
      code: "FORBIDDEN",
      message: errorMessage,
    });
  }

  if (errorMessage.includes("validation") || errorMessage.includes("invalid")) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: errorMessage,
    });
  }

  if (errorMessage.includes("conflict") || errorMessage.includes("duplicate")) {
    return new TRPCError({
      code: "CONFLICT",
      message: errorMessage,
    });
  }

  if (errorMessage.includes("timeout")) {
    return new TRPCError({
      code: "TIMEOUT",
      message: errorMessage,
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
}
