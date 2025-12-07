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
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const sessionStatusEnum = pgEnum("session_status", ["scheduled", "completed", "cancelled", "no-show"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "past_due", "trialing"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["free", "starter", "professional", "enterprise"]);
export const billingPeriodEnum = pgEnum("billing_period", ["monthly", "yearly"]);
export const reminderStatusEnum = pgEnum("reminder_status", ["pending", "sent", "failed"]);
export const complianceSeverityEnum = pgEnum("compliance_severity", ["low", "medium", "high", "critical"]);

// ============================================================================
// ANONYMOUS SESSIONS (Frictionless Onboarding)
// ============================================================================

export const anonymousSessions = pgTable("anonymous_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: varchar("session_token", { length: 256 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // 7 days from creation
  convertedToUserId: integer("converted_to_user_id").references(() => users.id, { onDelete: "set null" }),
  convertedAt: timestamp("converted_at"),
  
  // Session metadata
  ipAddress: varchar("ip_address", { length: 45 }), // IPv6 compatible
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  
  // Conversation data
  conversationData: jsonb("conversation_data").default([]), // Array of messages
  extractedData: jsonb("extracted_data").default({}), // AI-extracted profile info
  
  // Media files
  mediaFiles: jsonb("media_files").default([]), // Array of file references
  
  // Engagement metrics
  engagementScore: integer("engagement_score").default(0).notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  sessionDurationSeconds: integer("session_duration_seconds").default(0).notNull(),
  valueDelivered: boolean("value_delivered").default(false).notNull(),
  
  // Conversion tracking
  conversionPromptShown: boolean("conversion_prompt_shown").default(false).notNull(),
  conversionPromptCount: integer("conversion_prompt_count").default(0).notNull(),
});

export type AnonymousSession = typeof anonymousSessions.$inferSelect;
export type InsertAnonymousSession = typeof anonymousSessions.$inferInsert;

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
  // Subscription info
  subscriptionTier: subscriptionTierEnum("subscription_tier").default("free"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status"),
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

// Magic links for passwordless login
export const magicLinks = pgTable("magic_links", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 256 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MagicLink = typeof magicLinks.$inferSelect;
export type InsertMagicLink = typeof magicLinks.$inferInsert;

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
  // Imported from anonymous session
  importedFromSessionId: uuid("imported_from_session_id").references(() => anonymousSessions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ============================================================================
// CLIENT DATA FOLDER (One Client, One Folder)
// ============================================================================

export const clientFolders = pgTable("client_folders", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "cascade" }),
  anonymousSessionId: uuid("anonymous_session_id").references(() => anonymousSessions.id),
  folderPath: varchar("folder_path", { length: 512 }).notNull().unique(), // e.g., /client-data/{id}/
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ClientFolder = typeof clientFolders.$inferSelect;
export type InsertClientFolder = typeof clientFolders.$inferInsert;

export const clientFiles = pgTable("client_files", {
  id: serial("id").primaryKey(),
  folderId: integer("folder_id").notNull().references(() => clientFolders.id, { onDelete: "cascade" }),
  fileType: varchar("file_type", { length: 64 }).notNull(), // conversation, audio, video, document, assessment
  fileName: varchar("file_name", { length: 512 }).notNull(),
  filePath: varchar("file_path", { length: 1024 }).notNull(),
  fileSize: integer("file_size"), // bytes
  mimeType: varchar("mime_type", { length: 128 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ClientFile = typeof clientFiles.$inferSelect;
export type InsertClientFile = typeof clientFiles.$inferInsert;

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

// Continue with rest of schema...
// (Keeping all existing tables from the original schema)
