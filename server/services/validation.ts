/**
 * Input Validation Utilities
 */

import { z } from "zod";

export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"']/g, "")
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export const emotionValidator = z.enum([
  "excellent",
  "good",
  "neutral",
  "poor",
  "terrible",
]);

export const sessionStatusValidator = z.enum([
  "scheduled",
  "completed",
  "cancelled",
  "no-show",
]);

export const subscriptionStatusValidator = z.enum([
  "active",
  "paused",
  "cancelled",
]);

export const coachingGoalValidator = z.object({
  goal: z.string().min(1).max(500),
  targetDate: z.date().optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  status: z.enum(["not_started", "in_progress", "completed"]).optional(),
});

export const journalEntryValidator = z.object({
  content: z.string().min(1).max(5000),
  mood: emotionValidator,
  triggers: z.array(z.string()).max(10).optional(),
  copingStrategiesUsed: z.array(z.string()).max(10).optional(),
  insights: z.string().max(1000).optional(),
});

export const emotionLogValidator = z.object({
  emotionType: z.string().min(1).max(50),
  intensity: z.number().min(1).max(10),
  trigger: z.string().max(500).optional(),
  context: z.string().max(1000).optional(),
  copingStrategy: z.string().max(500).optional(),
  effectiveness: z.number().min(1).max(10).optional(),
});

export const aiChatMessageValidator = z.object({
  message: z.string().min(1).max(5000),
  conversationId: z.number().optional(),
});

export const bookingValidator = z.object({
  sessionTypeId: z.number().positive(),
  scheduledDate: z.date(),
  clientEmail: z.string().email().optional(),
  clientName: z.string().min(1).max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export const discountCodeValidator = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive(),
  maxUses: z.number().positive().optional(),
  expiresAt: z.date().optional(),
});

export const profileUpdateValidator = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(1000).optional(),
  timezone: z.string().optional(),
  preferences: z.record(z.string(), z.any()).optional(),
});

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj as Record<string, any>)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === "string" ? sanitizeInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function validateAndSanitize<T extends Record<string, any>>(
  data: unknown,
  schema: z.ZodSchema<T>
): { valid: true; data: T } | { valid: false; errors: z.ZodError } {
  try {
    const parsed = schema.parse(data) as T;
    const sanitized = sanitizeObject(parsed);
    return { valid: true, data: sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    throw error;
  }
}
