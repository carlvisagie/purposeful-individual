/**
 * PostgreSQL Schema - Standalone (No Manus Dependencies)
 * Converted from MySQL with standalone authentication added
 */

import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  json,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const sessionStatusEnum = pgEnum("session_status", ["scheduled", "completed", "cancelled", "no-show"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "past_due", "trialing"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["ai_only", "hybrid", "premium"]);
export const billingPeriodEnum = pgEnum("billing_period", ["monthly", "yearly"]);
export const reminderStatusEnum = pgEnum("reminder_status", ["pending", "sent", "failed"]);
export const complianceSeverityEnum = pgEnum("compliance_severity", ["low", "medium", "high", "critical"]);

// ============================================================================
// USERS & AUTHENTICATION (Standalone - No Manus)
// ============================================================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // Email/password auth (standalone)
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }),
  passwordSalt: varchar("password_salt", { length: 64 }),
  // User info
  name: text("name"),
  loginMethod: varchar("login_method", { length: 64 }).default("email"),
  role: roleEnum("role").default("user").notNull(),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Auth sessions (separate from coaching sessions)
export const authSessions = pgTable("auth_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 256 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuthSession = typeof authSessions.$inferSelect;
export type InsertAuthSession = typeof authSessions.$inferInsert;

// ============================================================================
// COACHES & CLIENTS
// ============================================================================

export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  specialties: text("specialties"),
  certifications: text("certifications"),
  hourlyRate: integer("hourly_rate"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Coach = typeof coaches.$inferSelect;
export type InsertCoach = typeof coaches.$inferInsert;

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  goals: text("goals"),
  preferences: text("preferences"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ============================================================================
// JOURNAL & EMOTIONS
// ============================================================================

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  content: text("content").notNull(),
  mood: varchar("mood", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

export const emotionLogs = pgTable("emotion_logs", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  emotion: varchar("emotion", { length: 50 }).notNull(),
  intensity: integer("intensity").notNull(), // 1-10 scale
  trigger: text("trigger"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmotionLog = typeof emotionLogs.$inferSelect;
export type InsertEmotionLog = typeof emotionLogs.$inferInsert;

export const copingStrategies = pgTable("coping_strategies", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  strategy: text("strategy").notNull(),
  effectiveness: integer("effectiveness"), // 1-10 scale
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CopingStrategy = typeof copingStrategies.$inferSelect;
export type InsertCopingStrategy = typeof copingStrategies.$inferInsert;

// ============================================================================
// AI COACHING
// ============================================================================

export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  insight: text("insight").notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = typeof aiInsights.$inferInsert;

export const aiChatConversations = pgTable("ai_chat_conversations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AiChatConversation = typeof aiChatConversations.$inferSelect;
export type InsertAiChatConversation = typeof aiChatConversations.$inferInsert;

export const aiChatMessages = pgTable("ai_chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => aiChatConversations.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAiChatMessage = typeof aiChatMessages.$inferInsert;

// ============================================================================
// SESSIONS & SCHEDULING
// ============================================================================

export const sessionTypes = pgTable("session_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(), // in cents
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SessionType = typeof sessionTypes.$inferSelect;
export type InsertSessionType = typeof sessionTypes.$inferInsert;

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => coaches.id),
  clientId: integer("client_id").notNull().references(() => clients.id),
  sessionTypeId: integer("session_type_id").references(() => sessionTypes.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price"), // in cents
  sessionType: varchar("session_type", { length: 100 }), // legacy field
  notes: text("notes"),
  status: sessionStatusEnum("status").default("scheduled").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export const coachAvailability = pgTable("coach_availability", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => coaches.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time", { length: 5 }).notNull(), // HH:MM format
  endTime: varchar("end_time", { length: 5 }).notNull(), // HH:MM format
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CoachAvailability = typeof coachAvailability.$inferSelect;
export type InsertCoachAvailability = typeof coachAvailability.$inferInsert;

export const availabilityExceptions = pgTable("availability_exceptions", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => coaches.id),
  date: timestamp("date").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AvailabilityException = typeof availabilityExceptions.$inferSelect;
export type InsertAvailabilityException = typeof availabilityExceptions.$inferInsert;

export const sessionReminders = pgTable("session_reminders", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessions.id),
  reminderTime: timestamp("reminder_time").notNull(),
  status: reminderStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});

export type SessionReminder = typeof sessionReminders.$inferSelect;
export type InsertSessionReminder = typeof sessionReminders.$inferInsert;

// ============================================================================
// SUBSCRIPTIONS & PAYMENTS
// ============================================================================

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  tier: subscriptionTierEnum("tier").notNull(),
  billingPeriod: billingPeriodEnum("billing_period").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountPercent: integer("discount_percent"),
  discountAmount: integer("discount_amount"), // in cents
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = typeof discountCodes.$inferInsert;

export const discountCodeUsage = pgTable("discount_code_usage", {
  id: serial("id").primaryKey(),
  discountCodeId: integer("discount_code_id").notNull().references(() => discountCodes.id),
  clientId: integer("client_id").notNull().references(() => clients.id),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

export type DiscountCodeUsage = typeof discountCodeUsage.$inferSelect;
export type InsertDiscountCodeUsage = typeof discountCodeUsage.$inferInsert;

// ============================================================================
// PLATFORM SETTINGS & COMPLIANCE
// ============================================================================

export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;

export const videoTestimonials = pgTable("video_testimonials", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  videoUrl: varchar("video_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  isApproved: boolean("is_approved").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type VideoTestimonial = typeof videoTestimonials.$inferSelect;
export type InsertVideoTestimonial = typeof videoTestimonials.$inferInsert;

export const complianceFlags = pgTable("compliance_flags", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => aiChatConversations.id),
  sessionId: integer("session_id").references(() => sessions.id),
  flagType: varchar("flag_type", { length: 100 }).notNull(),
  severity: complianceSeverityEnum("severity").notNull(),
  description: text("description"),
  isResolved: boolean("is_resolved").default(false).notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ComplianceFlag = typeof complianceFlags.$inferSelect;
export type InsertComplianceFlag = typeof complianceFlags.$inferInsert;
