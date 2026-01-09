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
import { sql } from "drizzle-orm";

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
  conversationData: jsonb("conversation_data").default(sql`'[]'::jsonb`).notNull(), // Array of messages
  extractedData: jsonb("extracted_data").default(sql`'{}'::jsonb`).notNull(), // AI-extracted profile info
  
  // Media files
  mediaFiles: jsonb("media_files").default(sql`'[]'::jsonb`).notNull(), // Array of file references
  
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

// ============================================================================
// CRISIS ALERTS & NOTIFICATIONS
// ============================================================================

export const crisisAlerts = pgTable("crisis_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Session/User tracking
  sessionId: uuid("session_id").references(() => anonymousSessions.id),
  userId: integer("user_id").references(() => users.id),
  
  // Alert details
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  riskScore: integer("risk_score").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  
  // Detection details
  keywords: jsonb("keywords").notNull().default(sql`'[]'::jsonb`),
  context: text("context").notNull(),
  fullConversation: jsonb("full_conversation").default(sql`'[]'::jsonb`),
  
  // Response tracking
  responseGenerated: text("response_generated"),
  resourcesProvided: jsonb("resources_provided").default(sql`'{}'::jsonb`),
  
  // Follow-up
  assignedTo: varchar("assigned_to", { length: 255 }),
  assignedAt: timestamp("assigned_at"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  escalatedToEmergency: boolean("escalated_to_emergency").default(false),
  
  // Metadata
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CrisisAlert = typeof crisisAlerts.$inferSelect;
export type InsertCrisisAlert = typeof crisisAlerts.$inferInsert;

export const crisisAlertNotifications = pgTable("crisis_alert_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  alertId: uuid("alert_id").references(() => crisisAlerts.id).notNull(),
  
  // Notification details
  notificationType: varchar("notification_type", { length: 50 }).notNull(),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  
  // Delivery tracking
  sentAt: timestamp("sent_at"),
  failedAt: timestamp("failed_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CrisisAlertNotification = typeof crisisAlertNotifications.$inferSelect;
export type InsertCrisisAlertNotification = typeof crisisAlertNotifications.$inferInsert;

// ============================================================================
// CONVERTED MYSQL SCHEMAS (All 357 tables)
// ============================================================================

// From adaptiveLearningSchema.ts
export const techniqueEffectiveness = pgTable("techniqueEffectiveness", {
  id: serial("id").primaryKey(),
  
  // Technique details
  techniqueName: varchar("techniqueName", { length: 255 }).notNull(),
  techniqueCategory: varchar("techniqueCategory", { length: 100 }).notNull(), // CBT, DBT, mindfulness, etc.
  techniqueDescription: text("techniqueDescription"),
  
  // Context
  problemType: varchar("problemType", { length: 255 }).notNull(), // anxiety, depression, stress, etc.
  clientDemographic: text("clientDemographic"), // JSON: age range, background, etc.
  
  // Effectiveness metrics
  timesRecommended: integer("timesRecommended").default(0).notNull(),
  timesUsed: integer("timesUsed").default(0).notNull(),
  successCount: integer("successCount").default(0).notNull(),
  failureCount: integer("failureCount").default(0).notNull(),
  averageRating: integer("averageRating"), // 1-10 scale
  
  // Learning data
  lastRecommended: timestamp("lastRecommended"),
  confidenceScore: integer("confidenceScore").default(50).notNull(), // 0-100, increases with data
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TechniqueEffectiveness = typeof techniqueEffectiveness.$inferSelect;
export type InsertTechniqueEffectiveness = typeof techniqueEffectiveness.$inferInsert;
export const clientPatterns = pgTable("clientPatterns", {
  id: serial("id").primaryKey(),
  
  // Pattern details
  patternName: varchar("patternName", { length: 255 }).notNull(),
  patternDescription: text("patternDescription").notNull(),
  patternType: varchar("patternType", { length: 100 }).notNull(), // trigger, coping, emotional, behavioral
  
  // Frequency
  occurrenceCount: integer("occurrenceCount").default(1).notNull(),
  affectedClientCount: integer("affectedClientCount").default(1).notNull(),
  
  // Associated data
  commonTriggers: text("commonTriggers"), // JSON array
  effectiveSolutions: text("effectiveSolutions"), // JSON array
  relatedPatterns: text("relatedPatterns"), // JSON array of pattern IDs
  
  // Learning status
  isValidated: pgEnum("isValidated", ["true", "false"]).default("false").notNull(),
  confidenceScore: integer("confidenceScore").default(50).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ClientPattern = typeof clientPatterns.$inferSelect;
export type InsertClientPattern = typeof clientPatterns.$inferInsert;
export const recommendationFeedback = pgTable("recommendationFeedback", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id),
  
  // Recommendation details
  recommendationType: varchar("recommendationType", { length: 100 }).notNull(), // technique, strategy, habit, etc.
  recommendationContent: text("recommendationContent").notNull(),
  context: text("context"), // What situation prompted this recommendation
  
  // Feedback
  wasUsed: pgEnum("wasUsed", ["yes", "no"]).notNull(),
  wasHelpful: pgEnum("wasHelpful", ["yes", "no", "somewhat"]),
  rating: integer("rating"), // 1-10 scale
  feedbackNotes: text("feedbackNotes"),
  
  // Outcome tracking
  problemResolved: pgEnum("problemResolved", ["yes", "no", "partially"]),
  timeToResolution: integer("timeToResolution"), // minutes or hours
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RecommendationFeedback = typeof recommendationFeedback.$inferSelect;
export type InsertRecommendationFeedback = typeof recommendationFeedback.$inferInsert;
export const adaptiveOutcomeTracking = pgTable("adaptiveOutcomeTracking", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id),
  
  // Baseline (when they started)
  baselineDate: timestamp("baselineDate").notNull(),
  baselineEmotionalState: integer("baselineEmotionalState").notNull(), // 1-10
  baselineFunctioning: integer("baselineFunctioning").notNull(), // 1-10
  baselineGoals: text("baselineGoals"), // JSON array
  
  // Current state
  currentEmotionalState: integer("currentEmotionalState"),
  currentFunctioning: integer("currentFunctioning"),
  goalsAchieved: text("goalsAchieved"), // JSON array
  
  // Improvement metrics
  emotionalImprovement: integer("emotionalImprovement"), // Calculated: current - baseline
  functioningImprovement: integer("functioningImprovement"),
  daysInCoaching: integer("daysInCoaching"),
  
  // Specific improvements
  sleepImproved: pgEnum("sleepImproved", ["yes", "no", "unknown"]),
  relationshipsImproved: pgEnum("relationshipsImproved", ["yes", "no", "unknown"]),
  workPerformanceImproved: pgEnum("workPerformanceImproved", ["yes", "no", "unknown"]),
  physicalHealthImproved: pgEnum("physicalHealthImproved", ["yes", "no", "unknown"]),
  
  // Attribution
  attributedToCoaching: pgEnum("attributedToCoaching", ["yes", "no", "partially"]),
  mostHelpfulAspect: text("mostHelpfulAspect"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdaptiveOutcomeTracking = typeof adaptiveOutcomeTracking.$inferSelect;
export type InsertAdaptiveOutcomeTracking = typeof adaptiveOutcomeTracking.$inferInsert;
export const trendDetection = pgTable("trendDetection", {
  id: serial("id").primaryKey(),
  
  // Trend details
  trendName: varchar("trendName", { length: 255 }).notNull(),
  trendDescription: text("trendDescription").notNull(),
  trendCategory: varchar("trendCategory", { length: 100 }).notNull(), // struggle, success, pattern, etc.
  
  // Statistics
  affectedPercentage: integer("affectedPercentage").notNull(), // 0-100
  totalClientsAnalyzed: integer("totalClientsAnalyzed").notNull(),
  affectedClientCount: integer("affectedClientCount").notNull(),
  
  // Recommendations
  suggestedContent: text("suggestedContent"), // New tools/content to create
  suggestedApproach: text("suggestedApproach"), // How to address this trend
  
  // Status
  isActive: pgEnum("isActive", ["true", "false"]).default("true").notNull(),
  isAddressed: pgEnum("isAddressed", ["true", "false"]).default("false").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TrendDetection = typeof trendDetection.$inferSelect;
export type InsertTrendDetection = typeof trendDetection.$inferInsert;
export const strategyAdjustments = pgTable("strategyAdjustments", {
  id: serial("id").primaryKey(),
  
  // Adjustment details
  adjustmentType: varchar("adjustmentType", { length: 100 }).notNull(), // technique_priority, approach_change, etc.
  adjustmentDescription: text("adjustmentDescription").notNull(),
  
  // Reason
  triggeringData: text("triggeringData"), // JSON: What data prompted this adjustment
  expectedImprovement: text("expectedImprovement"),
  
  // Implementation
  implementedAt: timestamp("implementedAt").defaultNow().notNull(),
  isActive: pgEnum("isActive", ["true", "false"]).default("true").notNull(),
  
  // Results
  measuredImprovement: text("measuredImprovement"), // JSON: Actual results
  wasSuccessful: pgEnum("wasSuccessful", ["yes", "no", "unknown"]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StrategyAdjustment = typeof strategyAdjustments.$inferSelect;
export type InsertStrategyAdjustment = typeof strategyAdjustments.$inferInsert;

// From adminSchema.ts
export const adminUsers = pgTable("admin_users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // Role
  role: pgEnum("role", [
    "super_admin",
    "admin",
    "moderator",
    "support_agent",
    "analyst",
    "developer"
  ]).notNull(),
  
  // Permissions
  permissions: text("permissions"), // JSON: specific permissions
  
  // Status
  active: boolean("active").default(true),
  
  // Access
  lastLoginAt: timestamp("last_login_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminActions = pgTable("admin_actions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  adminUserId: varchar("admin_user_id", { length: 255 }).notNull(),
  
  // Action Details
  actionType: varchar("action_type", { length: 100 }).notNull(),
  actionCategory: pgEnum("action_category", [
    "user_management",
    "content_moderation",
    "system_configuration",
    "data_access",
    "support",
    "security"
  ]).notNull(),
  
  // Target
  targetType: varchar("target_type", { length: 100 }),
  targetId: varchar("target_id", { length: 255 }),
  
  // Details
  description: text("description"),
  changes: text("changes"), // JSON: before/after
  
  // Context
  ipAddress: varchar("ip_address", { length: 50 }),
  
  actionTimestamp: timestamp("action_timestamp").defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Ticket Details
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  subject: varchar("subject", { length: 500 }).notNull(),
  description: text("description"),
  
  // Category
  category: pgEnum("category", [
    "technical_issue",
    "billing",
    "feature_request",
    "bug_report",
    "account_issue",
    "data_privacy",
    "general_inquiry",
    "other"
  ]).notNull(),
  
  // Priority
  priority: pgEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Status
  status: pgEnum("status", [
    "new",
    "open",
    "in_progress",
    "waiting_on_user",
    "waiting_on_team",
    "resolved",
    "closed"
  ]).default("new"),
  
  // Assignment
  assignedTo: varchar("assigned_to", { length: 255 }),
  assignedAt: timestamp("assigned_at"),
  
  // Resolution
  resolvedBy: varchar("resolved_by", { length: 255 }),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  
  // Satisfaction
  satisfactionRating: integer("satisfaction_rating"), // 1-5
  satisfactionFeedback: text("satisfaction_feedback"),
  
  // SLA
  firstResponseAt: timestamp("first_response_at"),
  firstResponseSLA: integer("first_response_sla"), // minutes
  resolutionSLA: integer("resolution_sla"), // minutes
  slaBreached: boolean("sla_breached").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const ticketMessages = pgTable("ticket_messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  ticketId: varchar("ticket_id", { length: 255 }).notNull(),
  
  // Sender
  senderId: varchar("sender_id", { length: 255 }).notNull(),
  senderType: pgEnum("sender_type", ["user", "admin", "system"]).notNull(),
  
  // Message
  message: text("message").notNull(),
  
  // Attachments
  attachments: text("attachments"), // JSON: file URLs
  
  // Internal Note
  internalNote: boolean("internal_note").default(false), // Only visible to admins
  
  sentAt: timestamp("sent_at").defaultNow(),
});

export const knowledgeBaseArticles = pgTable("knowledge_base_articles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Article Details
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  
  // Category
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // JSON array
  
  // SEO
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  metaDescription: text("meta_description"),
  
  // Status
  status: pgEnum("status", ["draft", "published", "archived"]).default("draft"),
  
  // Author
  authorId: varchar("author_id", { length: 255 }),
  
  // Visibility
  public: boolean("public").default(true),
  
  // Helpfulness
  helpfulCount: integer("helpful_count").default(0),
  notHelpfulCount: integer("not_helpful_count").default(0),
  
  // Views
  viewCount: integer("view_count").default(0),
  
  publishedAt: timestamp("published_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const articleFeedback = pgTable("article_feedback", {
  id: varchar("id", { length: 255 }).primaryKey(),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  
  // Feedback
  helpful: boolean("helpful").notNull(),
  feedback: text("feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFeedback = pgTable("user_feedback", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Feedback Type
  feedbackType: pgEnum("feedback_type", [
    "feature_request",
    "bug_report",
    "general_feedback",
    "complaint",
    "praise"
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 500 }),
  description: text("description").notNull(),
  
  // Context
  page: varchar("page", { length: 255 }),
  feature: varchar("feature", { length: 255 }),
  
  // Attachments
  attachments: text("attachments"), // JSON: screenshots, etc.
  
  // Status
  status: pgEnum("status", [
    "new",
    "under_review",
    "planned",
    "in_progress",
    "completed",
    "declined"
  ]).default("new"),
  
  // Votes
  upvotes: integer("upvotes").default(0),
  
  // Response
  adminResponse: text("admin_response"),
  respondedAt: timestamp("responded_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bugReports = pgTable("bug_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }),
  
  // Bug Details
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  stepsToReproduce: text("steps_to_reproduce"),
  expectedBehavior: text("expected_behavior"),
  actualBehavior: text("actual_behavior"),
  
  // Severity
  severity: pgEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  
  // Environment
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  deviceType: varchar("device_type", { length: 100 }),
  
  // Attachments
  screenshots: text("screenshots"), // JSON: URLs
  logs: text("logs"),
  
  // Status
  status: pgEnum("status", [
    "new",
    "confirmed",
    "in_progress",
    "fixed",
    "cannot_reproduce",
    "wont_fix"
  ]).default("new"),
  
  // Assignment
  assignedTo: varchar("assigned_to", { length: 255 }),
  
  // Resolution
  fixedIn: varchar("fixed_in", { length: 100 }), // Version number
  fixedAt: timestamp("fixed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const featureFlags = pgTable("feature_flags", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Flag Details
  flagName: varchar("flag_name", { length: 255 }).notNull().unique(),
  description: text("description"),
  
  // Status
  enabled: boolean("enabled").default(false),
  
  // Rollout
  rolloutPercentage: integer("rollout_percentage").default(0), // 0-100
  
  // Targeting
  targetUserIds: text("target_user_ids"), // JSON: specific users
  targetRoles: text("target_roles"), // JSON: specific roles
  
  // Environment
  environments: text("environments"), // JSON: dev, staging, production
  
  // Modified By
  lastModifiedBy: varchar("last_modified_by", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const systemAnnouncements = pgTable("system_announcements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Announcement Details
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  
  // Type
  announcementType: pgEnum("announcement_type", [
    "maintenance",
    "new_feature",
    "update",
    "alert",
    "info"
  ]).notNull(),
  
  // Severity
  severity: pgEnum("severity", ["info", "warning", "critical"]).default("info"),
  
  // Visibility
  targetAudience: pgEnum("target_audience", ["all_users", "specific_users", "admins"]).default("all_users"),
  targetUserIds: text("target_user_ids"), // JSON
  
  // Display
  displayLocation: text("display_location"), // JSON: where to show
  dismissible: boolean("dismissible").default(true),
  
  // Schedule
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Status
  active: boolean("active").default(true),
  
  createdBy: varchar("created_by", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userReports = pgTable("user_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  reportedBy: varchar("reported_by", { length: 255 }).notNull(),
  
  // Reported Content
  reportedType: pgEnum("reported_type", [
    "user",
    "post",
    "comment",
    "message",
    "other"
  ]).notNull(),
  reportedId: varchar("reported_id", { length: 255 }).notNull(),
  
  // Reason
  reason: pgEnum("reason", [
    "spam",
    "harassment",
    "inappropriate_content",
    "misinformation",
    "hate_speech",
    "violence",
    "other"
  ]).notNull(),
  description: text("description"),
  
  // Status
  status: pgEnum("status", [
    "pending",
    "under_review",
    "action_taken",
    "dismissed"
  ]).default("pending"),
  
  // Review
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Action
  actionTaken: varchar("action_taken", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const platformMetrics = pgTable("platform_metrics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  metricDate: timestamp("metric_date").notNull(),
  
  // User Metrics
  totalUsers: integer("total_users"),
  activeUsers: integer("active_users"),
  newUsers: integer("new_users"),
  churnedUsers: integer("churned_users"),
  
  // Engagement Metrics
  avgSessionDuration: decimal("avg_session_duration", { precision: 10, scale: 2 }), // seconds
  avgDailyActiveUsers: integer("avg_daily_active_users"),
  avgWeeklyActiveUsers: integer("avg_weekly_active_users"),
  avgMonthlyActiveUsers: integer("avg_monthly_active_users"),
  
  // Content Metrics
  totalGoals: integer("total_goals"),
  totalHabits: integer("total_habits"),
  totalJournalEntries: integer("total_journal_entries"),
  
  // Support Metrics
  openTickets: integer("open_tickets"),
  avgTicketResolutionTime: decimal("avg_ticket_resolution_time", { precision: 10, scale: 2 }), // hours
  avgSatisfactionRating: decimal("avg_satisfaction_rating", { precision: 4, scale: 2 }),
  
  // System Metrics
  apiRequests: integer("api_requests"),
  avgResponseTime: decimal("avg_response_time", { precision: 8, scale: 2 }), // milliseconds
  errorRate: decimal("error_rate", { precision: 5, scale: 2 }), // %
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminNotifications = pgTable("admin_notifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Notification Type
  notificationType: pgEnum("notification_type", [
    "new_ticket",
    "urgent_ticket",
    "security_alert",
    "system_error",
    "user_report",
    "feature_request",
    "bug_report"
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message"),
  
  // Link
  actionUrl: varchar("action_url", { length: 500 }),
  
  // Priority
  priority: pgEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Status
  read: boolean("read").default(false),
  readAt: timestamp("read_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});


// From aiCoachSchema.ts
export const aiCoachProfiles = pgTable("ai_coach_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Coaching Preferences
  preferredCoachingStyle: pgEnum("preferred_coaching_style", [
    "motivational", // Motivational Interviewing
    "socratic", // Questioning approach
    "solution_focused", // Build on strengths
    "cognitive_behavioral", // Challenge thinking
    "directive", // Clear instructions
    "mixed" // Adaptive
  ]),
  
  // Communication Preferences
  preferredTone: pgEnum("preferred_tone", [
    "supportive",
    "challenging",
    "balanced"
  ]).default("balanced"),
  
  verbosity: pgEnum("verbosity", ["concise", "moderate", "detailed"]).default("moderate"),
  
  // Interaction Preferences
  proactiveCheckins: boolean("proactive_checkins").default(true),
  dailyCheckIn: boolean("daily_check_in").default(false),
  weeklyReview: boolean("weekly_review").default(true),
  
  // Privacy
  dataSharing: boolean("data_sharing").default(true), // Share data with AI for better coaching
  
  // Self-Learning Data
  effectiveQuestionTypes: text("effective_question_types"), // JSON: which questions lead to insights
  effectiveInterventionTypes: text("effective_intervention_types"), // JSON: which interventions work
  optimalCheckInTiming: text("optimal_check_in_timing"), // JSON: when to reach out
  
  // Coach Relationship
  trustLevel: integer("trust_level"), // 1-10 (how much user trusts AI coach)
  satisfactionLevel: integer("satisfaction_level"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coachingConversations = pgTable("coaching_conversations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Conversation Details
  conversationTitle: varchar("conversation_title", { length: 255 }),
  
  // Conversation Type
  conversationType: pgEnum("conversation_type", [
    "check_in", // Daily/weekly check-in
    "goal_setting", // Setting new goals
    "obstacle_solving", // Working through challenges
    "reflection", // Reflecting on progress
    "crisis_support", // Immediate support needed
    "celebration", // Celebrating wins
    "exploration", // Exploring options
    "accountability" // Accountability conversation
  ]).notNull(),
  
  // Status
  status: pgEnum("status", ["active", "paused", "completed"]).default("active"),
  
  // Outcomes
  insightsGenerated: integer("insights_generated").default(0),
  actionsIdentified: integer("actions_identified").default(0),
  
  // Effectiveness
  helpfulnessRating: integer("helpfulness_rating"), // 1-10 (user feedback)
  
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversationMessages = pgTable("conversation_messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Message Details
  sender: pgEnum("sender", ["user", "ai_coach"]).notNull(),
  messageText: text("message_text").notNull(),
  
  // Message Type (for AI messages)
  messageType: pgEnum("message_type", [
    "question", // Asking a question
    "reflection", // Reflecting back what user said
    "insight", // Offering an insight
    "suggestion", // Making a suggestion
    "encouragement", // Providing encouragement
    "challenge", // Challenging user's thinking
    "information", // Providing information
    "summary" // Summarizing conversation
  ]),
  
  // Coaching Technique Used
  coachingTechnique: pgEnum("coaching_technique", [
    "open_question",
    "scaling_question",
    "miracle_question",
    "exception_finding",
    "reframing",
    "socratic_questioning",
    "motivational_interviewing",
    "cognitive_restructuring",
    "strengths_identification"
  ]),
  
  // Context
  contextData: text("context_data"), // JSON: relevant user data that informed this message
  
  // User Response
  userEngaged: boolean("user_engaged"), // Did user respond meaningfully?
  userInsight: boolean("user_insight"), // Did user have an insight?
  userAction: boolean("user_action"), // Did user commit to action?
  
  sentAt: timestamp("sent_at").defaultNow(),
});

export const coachingQuestions = pgTable("coaching_questions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Question Details
  questionText: text("question_text").notNull(),
  
  // Question Type
  questionType: pgEnum("question_type", [
    "open_ended", // "What do you think about...?"
    "scaling", // "On a scale of 1-10..."
    "miracle", // "If a miracle happened..."
    "exception", // "When has this NOT been a problem?"
    "coping", // "How have you managed so far?"
    "values", // "What matters most to you?"
    "strengths", // "What are you good at?"
    "future_focused", // "Where do you want to be?"
    "clarifying", // "Can you tell me more about...?"
    "challenging" // "Is that really true?"
  ]).notNull(),
  
  // Category
  category: varchar("category", { length: 100 }),
  
  // When to Use
  bestFor: text("best_for"), // JSON: situations, emotions, goals
  
  // Research-Backed
  researchBacked: boolean("research_backed").default(false),
  researchSource: text("research_source"),
  
  // Effectiveness
  avgInsightRate: decimal("avg_insight_rate", { precision: 5, scale: 2 }), // % who had insight
  avgActionRate: decimal("avg_action_rate", { precision: 5, scale: 2 }), // % who took action
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  totalUses: integer("total_uses").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Recommendation Type
  recommendationType: pgEnum("recommendation_type", [
    "habit_suggestion", // Try this habit
    "goal_suggestion", // Consider this goal
    "intervention_suggestion", // Use this technique
    "resource_suggestion", // Check out this resource
    "adjustment_suggestion", // Adjust your approach
    "timing_suggestion", // Change when you do X
    "connection_suggestion" // Connect with someone
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Reasoning
  reasoning: text("reasoning"), // Why is AI suggesting this?
  supportingData: text("supporting_data"), // JSON: data that supports this recommendation
  
  // Confidence
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // %
  
  // Priority
  priority: pgEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Status
  status: pgEnum("status", ["pending", "accepted", "declined", "deferred"]).default("pending"),
  
  // User Response
  userFeedback: text("user_feedback"),
  helpfulnessRating: integer("helpfulness_rating"), // 1-10
  
  // Outcome
  implemented: boolean("implemented").default(false),
  implementedAt: timestamp("implemented_at"),
  outcomePositive: boolean("outcome_positive"),
  
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const proactiveCheckIns = pgTable("proactive_check_ins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Check-In Type
  checkInType: pgEnum("check_in_type", [
    "daily_check_in", // How's your day?
    "weekly_review", // How was your week?
    "goal_progress", // How's goal X going?
    "habit_check", // Still doing habit X?
    "wellness_check", // How are you feeling?
    "obstacle_check", // Still struggling with X?
    "celebration", // Congrats on X!
    "motivation_boost" // Need a boost?
  ]).notNull(),
  
  // Trigger
  triggerType: pgEnum("trigger_type", [
    "scheduled", // Regular schedule
    "pattern_detected", // AI noticed something
    "goal_milestone", // Close to goal
    "streak_at_risk", // About to lose streak
    "low_engagement", // Haven't logged in
    "stress_spike", // High stress detected
    "achievement" // Something to celebrate
  ]).notNull(),
  
  // Message
  message: text("message"),
  
  // Response
  responded: boolean("responded").default(false),
  respondedAt: timestamp("responded_at"),
  responseQuality: pgEnum("response_quality", ["brief", "engaged", "insightful"]),
  
  // Effectiveness
  helpful: boolean("helpful"),
  
  sentAt: timestamp("sent_at").defaultNow(),
});

export const coachingInsights = pgTable("coaching_insights", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Insight Type
  insightType: pgEnum("insight_type", [
    "pattern_recognition", // "I notice you always..."
    "strength_identification", // "You're really good at..."
    "blind_spot", // "You might not realize..."
    "opportunity", // "Have you considered..."
    "risk_alert", // "I'm concerned about..."
    "progress_highlight", // "Look how far you've come..."
    "connection", // "X seems related to Y..."
    "discrepancy" // "You say X but do Y..."
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Supporting Evidence
  evidence: text("evidence"), // JSON: data points that support this insight
  
  // Actionability
  actionable: boolean("actionable").default(false),
  suggestedAction: text("suggested_action"),
  
  // User Response
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewed_at"),
  resonated: boolean("resonated"), // Did this insight resonate?
  actionTaken: boolean("action_taken").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const coachingGoals = pgTable("coaching_goals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 255 }),
  goalId: varchar("goal_id", { length: 255 }), // Links to goals table
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Goal Clarity
  initialClarity: integer("initial_clarity"), // 1-10 (how clear was goal at start)
  finalClarity: integer("final_clarity"), // 1-10 (how clear after coaching)
  
  // AI Contribution
  aiContribution: text("ai_contribution"), // How did AI help clarify/refine goal?
  
  // Obstacles Identified
  obstaclesIdentified: text("obstacles_identified"), // JSON array
  
  // Strategies Developed
  strategiesDeveloped: text("strategies_developed"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const coachingEffectiveness = pgTable("coaching_effectiveness", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Coaching Element
  elementType: varchar("element_type", { length: 100 }).notNull(), // question_type, technique, etc.
  elementValue: varchar("element_value", { length: 255 }).notNull(), // specific question, technique, etc.
  
  // Effectiveness Metrics
  avgEngagementRate: decimal("avg_engagement_rate", { precision: 5, scale: 2 }), // % who engaged
  avgInsightRate: decimal("avg_insight_rate", { precision: 5, scale: 2 }), // % who had insights
  avgActionRate: decimal("avg_action_rate", { precision: 5, scale: 2 }), // % who took action
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  
  // Behavioral Impact
  avgBehaviorChange: decimal("avg_behavior_change", { precision: 5, scale: 2 }), // % improvement
  
  // Optimal Parameters
  optimalContext: text("optimal_context"), // JSON: when this works best
  optimalUserType: text("optimal_user_type"), // JSON: who this works best for
  
  // Sample Size
  userCount: integer("user_count"),
  totalUses: integer("total_uses"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiCoachFeedback = pgTable("ai_coach_feedback", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  conversationId: varchar("conversation_id", { length: 255 }),
  messageId: varchar("message_id", { length: 255 }),
  
  // Feedback Type
  feedbackType: pgEnum("feedback_type", [
    "helpful",
    "not_helpful",
    "too_pushy",
    "too_passive",
    "off_topic",
    "insightful",
    "generic",
    "perfect"
  ]).notNull(),
  
  // Details
  feedbackText: text("feedback_text"),
  
  // Rating
  rating: integer("rating"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const coachingResources = pgTable("coaching_resources", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Resource Details
  resourceName: varchar("resource_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Resource Type
  resourceType: pgEnum("resource_type", [
    "article",
    "video",
    "exercise",
    "worksheet",
    "book",
    "podcast",
    "course",
    "tool"
  ]).notNull(),
  
  // URL
  url: varchar("url", { length: 500 }),
  
  // Category
  category: varchar("category", { length: 100 }),
  
  // Research-Backed
  researchBacked: boolean("research_backed").default(false),
  
  // When to Recommend
  recommendFor: text("recommend_for"), // JSON: situations, goals, challenges
  
  // Effectiveness
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  totalRecommendations: integer("total_recommendations").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userResourceInteractions = pgTable("user_resource_interactions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  resourceId: varchar("resource_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Interaction
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewed_at"),
  
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  
  // Feedback
  helpful: boolean("helpful"),
  helpfulnessRating: integer("helpfulness_rating"), // 1-10
  
  // Impact
  actionTaken: boolean("action_taken").default(false),
  impactDescription: text("impact_description"),
  
  recommendedAt: timestamp("recommended_at").defaultNow(),
});


// From analyticsSchema.ts
export const analyticsProfiles = pgTable("analytics_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Dashboard Preferences
  preferredView: pgEnum("preferred_view", ["overview", "detailed", "minimal"]).default("overview"),
  preferredChartType: pgEnum("preferred_chart_type", ["line", "bar", "area", "mixed"]).default("line"),
  
  // Tracking Preferences
  trackingFrequency: pgEnum("tracking_frequency", ["daily", "weekly", "monthly"]),
  
  // Insights Preferences
  insightFrequency: pgEnum("insight_frequency", ["daily", "weekly", "monthly"]),
  insightTypes: text("insight_types"), // JSON: which types of insights to show
  
  // Self-Learning Data
  mostActionableInsights: text("most_actionable_insights"), // JSON: which insights led to action
  preferredMetrics: text("preferred_metrics"), // JSON: which metrics user checks most
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailySnapshots = pgTable("daily_snapshots", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  snapshotDate: timestamp("snapshot_date").notNull(),
  
  // Overall Scores
  overallWellnessScore: integer("overall_wellness_score"), // 0-100
  physicalScore: integer("physical_score"), // 0-100
  mentalScore: integer("mental_score"), // 0-100
  emotionalScore: integer("emotional_score"), // 0-100
  spiritualScore: integer("spiritual_score"), // 0-100
  
  // Habit Completion
  habitsCompleted: integer("habits_completed"),
  habitsTotal: integer("habits_total"),
  habitCompletionRate: decimal("habit_completion_rate", { precision: 5, scale: 2 }), // %
  
  // Sleep
  sleepDuration: decimal("sleep_duration", { precision: 4, scale: 2 }), // hours
  sleepQuality: integer("sleep_quality"), // 1-10
  
  // Mood & Energy
  avgMood: integer("avg_mood"), // 1-10
  avgEnergy: integer("avg_energy"), // 1-10
  
  // Productivity
  productivityScore: integer("productivity_score"), // 0-100
  
  // Stress
  stressLevel: integer("stress_level"), // 1-10
  
  // Recovery
  recoveryScore: integer("recovery_score"), // 0-100
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const weeklyReports = pgTable("weekly_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  weekStartDate: timestamp("week_start_date").notNull(),
  
  // Overall Performance
  overallScore: integer("overall_score"), // 0-100
  scoreChange: decimal("score_change", { precision: 6, scale: 2 }), // % vs last week
  
  // Habits
  avgHabitCompletionRate: decimal("avg_habit_completion_rate", { precision: 5, scale: 2 }),
  habitsCompletionChange: decimal("habits_completion_change", { precision: 6, scale: 2 }), // % change
  
  // Sleep
  avgSleepDuration: decimal("avg_sleep_duration", { precision: 4, scale: 2 }),
  avgSleepQuality: decimal("avg_sleep_quality", { precision: 4, scale: 2 }),
  sleepConsistency: decimal("sleep_consistency", { precision: 5, scale: 2 }), // % (bedtime variance)
  
  // Mood & Energy
  avgMood: decimal("avg_mood", { precision: 4, scale: 2 }),
  avgEnergy: decimal("avg_energy", { precision: 4, scale: 2 }),
  moodStability: decimal("mood_stability", { precision: 5, scale: 2 }), // Low variance = stable
  
  // Goals
  goalsAchieved: integer("goals_achieved"),
  goalsInProgress: integer("goals_in_progress"),
  
  // Wins
  biggestWins: text("biggest_wins"), // JSON array
  
  // Challenges
  biggestChallenges: text("biggest_challenges"), // JSON array
  
  // Insights
  keyInsights: text("key_insights"), // JSON array
  
  // Recommendations
  recommendations: text("recommendations"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const monthlyReports = pgTable("monthly_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  monthStartDate: timestamp("month_start_date").notNull(),
  
  // Transformation Summary
  transformationScore: integer("transformation_score"), // 0-100
  
  // Habits
  habitsStarted: integer("habits_started"),
  habitsMastered: integer("habits_mastered"),
  habitsAbandoned: integer("habits_abandoned"),
  avgHabitSuccessRate: decimal("avg_habit_success_rate", { precision: 5, scale: 2 }),
  
  // Goals
  goalsSet: integer("goals_set"),
  goalsAchieved: integer("goals_achieved"),
  goalAchievementRate: decimal("goal_achievement_rate", { precision: 5, scale: 2 }),
  
  // Wellness Trends
  physicalTrend: pgEnum("physical_trend", ["improving", "stable", "declining"]),
  mentalTrend: pgEnum("mental_trend", ["improving", "stable", "declining"]),
  emotionalTrend: pgEnum("emotional_trend", ["improving", "stable", "declining"]),
  spiritualTrend: pgEnum("spiritual_trend", ["improving", "stable", "declining"]),
  
  // Community
  communityEngagement: integer("community_engagement"), // 0-100
  supportsGiven: integer("supports_given"),
  supportsReceived: integer("supports_received"),
  
  // Achievements
  achievementsUnlocked: integer("achievements_unlocked"),
  milestonesReached: integer("milestones_reached"),
  
  // Identity Shift
  identityShiftScore: integer("identity_shift_score"), // 0-100 (how much have you become who you want to be?)
  
  // Narrative Summary
  monthSummary: text("month_summary"), // AI-generated narrative
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const correlations = pgTable("correlations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Variables
  variable1: varchar("variable1", { length: 255 }).notNull(), // e.g., "sleep_duration"
  variable2: varchar("variable2", { length: 255 }).notNull(), // e.g., "productivity_score"
  
  // Correlation Strength
  correlationCoefficient: decimal("correlation_coefficient", { precision: 4, scale: 3 }), // -1 to 1
  pValue: decimal("p_value", { precision: 6, scale: 5 }), // Statistical significance
  
  // Interpretation
  relationship: pgEnum("relationship", [
    "strong_positive",
    "moderate_positive",
    "weak_positive",
    "no_correlation",
    "weak_negative",
    "moderate_negative",
    "strong_negative"
  ]),
  
  // Insight
  insight: text("insight"), // Human-readable explanation
  actionable: boolean("actionable").default(false), // Can user do something with this?
  
  // Sample Size
  dataPoints: integer("data_points"),
  
  // Confidence
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }), // %
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Prediction Type
  predictionType: pgEnum("prediction_type", [
    "goal_achievement", // Will you achieve this goal?
    "habit_sustainability", // Will this habit stick?
    "wellness_trajectory", // Where are you headed?
    "risk_assessment", // Risk of burnout, relapse, etc.
    "optimal_intervention" // What should you do next?
  ]).notNull(),
  
  // Target
  targetId: varchar("target_id", { length: 255 }), // Goal ID, habit ID, etc.
  targetName: varchar("target_name", { length: 255 }),
  
  // Prediction
  prediction: text("prediction"), // The actual prediction
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // %
  
  // Timeline
  timeframe: varchar("timeframe", { length: 100 }), // "in 30 days", "by end of year"
  
  // Factors
  keyFactors: text("key_factors"), // JSON: what influences this prediction
  
  // Recommendation
  recommendation: text("recommendation"), // What to do about it
  
  // Validation
  actualOutcome: text("actual_outcome"), // What actually happened
  predictionAccurate: boolean("prediction_accurate"),
  
  createdAt: timestamp("created_at").defaultNow(),
  validatedAt: timestamp("validated_at"),
});

export const insights = pgTable("insights", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Insight Type
  insightType: pgEnum("insight_type", [
    "pattern_detected", // "You always sleep better after exercise"
    "correlation_found", // "Sleep affects your mood"
    "trend_alert", // "Your stress is increasing"
    "achievement_close", // "You're 90% to your goal"
    "recommendation", // "Try this intervention"
    "warning", // "You're at risk of burnout"
    "celebration" // "You've improved 50%!"
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Supporting Data
  supportingData: text("supporting_data"), // JSON: charts, numbers, etc.
  
  // Actionability
  actionable: boolean("actionable").default(false),
  suggestedAction: text("suggested_action"),
  
  // Priority
  priority: pgEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // User Response
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewed_at"),
  actionTaken: boolean("action_taken").default(false),
  actionTakenAt: timestamp("action_taken_at"),
  helpful: boolean("helpful"), // User feedback
  
  // Expiry
  expiresAt: timestamp("expires_at"), // Some insights are time-sensitive
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const progressMilestones = pgTable("progress_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Milestone Type
  milestoneType: pgEnum("milestone_type", [
    "first_improvement",
    "10_percent_improvement",
    "50_percent_improvement",
    "100_percent_improvement",
    "goal_halfway",
    "goal_75_percent",
    "goal_achieved",
    "consistency_milestone",
    "transformation_milestone"
  ]).notNull(),
  
  // Details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Metric
  metric: varchar("metric", { length: 255 }), // What improved?
  baselineValue: decimal("baseline_value", { precision: 10, scale: 2 }),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  improvementPercent: decimal("improvement_percent", { precision: 6, scale: 2 }),
  
  // Context
  relatedTo: varchar("related_to", { length: 255 }), // Module, goal, habit, etc.
  
  achievedAt: timestamp("achieved_at").defaultNow(),
});

export const comparativeAnalytics = pgTable("comparative_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Comparison Type
  comparisonType: pgEnum("comparison_type", [
    "week_over_week",
    "month_over_month",
    "quarter_over_quarter",
    "year_over_year",
    "best_week_vs_current",
    "worst_week_vs_current"
  ]).notNull(),
  
  // Metric
  metric: varchar("metric", { length: 255 }).notNull(),
  
  // Values
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  comparisonValue: decimal("comparison_value", { precision: 10, scale: 2 }),
  
  // Change
  absoluteChange: decimal("absolute_change", { precision: 10, scale: 2 }),
  percentChange: decimal("percent_change", { precision: 6, scale: 2 }),
  
  // Interpretation
  trend: pgEnum("trend", ["improving", "stable", "declining"]),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Event Type
  eventType: varchar("event_type", { length: 100 }).notNull(), // dashboard_viewed, insight_clicked, etc.
  
  // Event Data
  eventData: text("event_data"), // JSON: additional context
  
  // Session
  sessionId: varchar("session_id", { length: 255 }),
  
  eventTimestamp: timestamp("event_timestamp").defaultNow(),
});

export const analyticsLearning = pgTable("analytics_learning", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Insight Type Effectiveness
  insightType: varchar("insight_type", { length: 100 }).notNull(),
  
  // Engagement Metrics
  avgViewRate: decimal("avg_view_rate", { precision: 5, scale: 2 }), // %
  avgActionRate: decimal("avg_action_rate", { precision: 5, scale: 2 }), // % who took action
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  
  // Impact Metrics
  avgBehaviorChange: decimal("avg_behavior_change", { precision: 5, scale: 2 }), // % improvement
  
  // Optimal Parameters
  optimalTiming: varchar("optimal_timing", { length: 100 }), // When to show this insight
  optimalFrequency: varchar("optimal_frequency", { length: 100 }),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From autismSchema.ts
export const autismProfiles = pgTable("autismProfiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id), // Parent's user ID
  childName: varchar("childName", { length: 255 }).notNull(),
  dateOfBirth: timestamp("dateOfBirth").notNull(),
  diagnosisDate: timestamp("diagnosisDate"),
  severity: pgEnum("severity", ["mild", "moderate", "severe"]).notNull(),
  
  // Assessment Data
  atecScore: integer("atecScore"), // Autism Treatment Evaluation Checklist
  carsScore: integer("carsScore"), // Childhood Autism Rating Scale
  communicationLevel: pgEnum("communicationLevel", ["nonverbal", "minimally_verbal", "verbal"]).notNull(),
  
  // Symptoms & Challenges (stored as JSON text)
  giSymptoms: text("giSymptoms"), // JSON: ["constipation", "diarrhea", "pain"]
  sleepIssues: text("sleepIssues"), // JSON: ["difficulty_falling_asleep", "night_wakings"]
  sensoryProfile: text("sensoryProfile"), // JSON: {"hyper": ["sound", "touch"], "hypo": ["movement"]}
  behaviorChallenges: text("behaviorChallenges"), // JSON: ["aggression", "self_injury", "tantrums"]
  
  // Family Context
  familyResources: text("familyResources"), // JSON: {"time": "limited", "budget": "moderate", "support": "high"}
  treatmentPriorities: text("treatmentPriorities"), // JSON: ["communication", "behavior", "independence"]
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AutismProfile = typeof autismProfiles.$inferSelect;
export type InsertAutismProfile = typeof autismProfiles.$inferInsert;
export const interventionPlans = pgTable("interventionPlans", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull().references(() => autismProfiles.id),
  
  // Tiered Interventions (JSON arrays)
  tier1Interventions: text("tier1Interventions").notNull(), // JSON: ["nutrition", "sleep", "sensory"]
  tier2Interventions: text("tier2Interventions"), // JSON: ["FMT", "GFCF_diet", "omega3"]
  tier3Interventions: text("tier3Interventions"), // JSON: ["ABA", "OT", "speech"]
  tier4Interventions: text("tier4Interventions"), // JSON: ["neurofeedback", "TMS_trial"]
  
  // Timeline & Providers
  currentPhase: pgEnum("currentPhase", ["foundation", "biomedical", "behavioral", "advanced"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  providerDirectory: text("providerDirectory"), // JSON: {"ABA": "provider_name", "OT": "provider_name"}
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type InterventionPlan = typeof interventionPlans.$inferSelect;
export type InsertInterventionPlan = typeof interventionPlans.$inferInsert;
export const supplementTracking = pgTable("supplementTracking", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull().references(() => autismProfiles.id),
  
  supplementName: varchar("supplementName", { length: 255 }).notNull(), // "Omega-3", "Vitamin D", "Methylcobalamin"
  dosage: varchar("dosage", { length: 255 }).notNull(), // "1000mg EPA+DHA", "300 IU/kg/day"
  frequency: pgEnum("frequency", ["daily", "twice_daily", "every_3_days"]).notNull(),
  
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  // Tracking
  adherence: integer("adherence"), // Percentage: 0-100
  sideEffects: text("sideEffects"), // JSON: ["fishy_burps", "loose_stools"]
  perceivedBenefit: integer("perceivedBenefit"), // 1-10 scale
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SupplementTracking = typeof supplementTracking.$inferSelect;
export type InsertSupplementTracking = typeof supplementTracking.$inferInsert;
export const dietaryInterventions = pgTable("dietaryInterventions", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull().references(() => autismProfiles.id),
  
  dietType: pgEnum("dietType", ["GFCF", "ketogenic", "SCD"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  // Tracking
  adherence: integer("adherence"), // Percentage: 0-100
  giSymptomChanges: text("giSymptomChanges"), // JSON: {"constipation": "improved", "bloating": "resolved"}
  behaviorChanges: text("behaviorChanges"), // JSON: {"attention": "improved", "sleep": "improved"}
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DietaryIntervention = typeof dietaryInterventions.$inferSelect;
export type InsertDietaryIntervention = typeof dietaryInterventions.$inferInsert;
export const therapySessions = pgTable("therapySessions", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull().references(() => autismProfiles.id),
  
  therapyType: pgEnum("therapyType", ["ABA", "OT", "speech", "Floortime", "neurofeedback"]).notNull(),
  sessionDate: timestamp("sessionDate").notNull(),
  duration: integer("duration").notNull(), // Minutes
  
  // Session Details
  goalsAddressed: text("goalsAddressed"), // JSON: ["increase_eye_contact", "reduce_tantrums"]
  progress: text("progress"), // JSON: {"eye_contact": "improved", "tantrums": "reduced_by_30%"}
  parentFeedback: text("parentFeedback"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TherapySession = typeof therapySessions.$inferSelect;
export type InsertTherapySession = typeof therapySessions.$inferInsert;
export const autismOutcomeTracking = pgTable("autismOutcomeTracking", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull().references(() => autismProfiles.id),
  
  assessmentDate: timestamp("assessmentDate").notNull(),
  
  // Core Autism Symptoms
  atecScore: integer("atecScore"),
  carsScore: integer("carsScore"),
  communicationLevel: pgEnum("communicationLevel", ["nonverbal", "minimally_verbal", "verbal"]),
  
  // Behavior & Function
  behaviorScore: integer("behaviorScore"), // 1-10 scale (parent-reported)
  adaptiveFunctionScore: integer("adaptiveFunctionScore"), // 1-10 scale
  
  // Physical Health
  giSymptomScore: integer("giSymptomScore"), // 1-10 scale (1=severe, 10=none)
  sleepScore: integer("sleepScore"), // 1-10 scale (1=severe issues, 10=excellent)
  
  // Family Quality of Life
  familyQOL: integer("familyQOL"), // 1-10 scale
  parentStress: integer("parentStress"), // 1-10 scale (1=low, 10=high)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutismOutcomeTracking = typeof autismOutcomeTracking.$inferSelect;
export type InsertAutismOutcomeTracking = typeof autismOutcomeTracking.$inferInsert;
export const autismPatternDetection = pgTable("autismPatternDetection", {
  id: serial("id").primaryKey(),
  
  // Child Profile Characteristics
  childProfile: text("childProfile").notNull(), // JSON: {"severity": "moderate", "giSymptoms": true, "age": 4}
  
  // Intervention Combination
  interventionCombination: text("interventionCombination").notNull(), // JSON: ["FMT", "omega3", "ABA"]
  
  // Outcome Data
  outcomeData: text("outcomeData").notNull(), // JSON: {"atec_improvement": 40, "behavior_improvement": 60}
  
  // Pattern Insights
  patternType: pgEnum("patternType", ["high_responder", "moderate_responder", "non_responder"]),
  confidence: integer("confidence"), // 0-100
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutismPatternDetection = typeof autismPatternDetection.$inferSelect;
export type InsertAutismPatternDetection = typeof autismPatternDetection.$inferInsert;
export const autismProviders = pgTable("autismProviders", {
  id: serial("id").primaryKey(),
  
  providerType: pgEnum("providerType", ["ABA", "OT", "speech", "FMT_clinic", "neurofeedback"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(), // City, State
  
  // Contact & Details
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  
  // Ratings & Reviews
  rating: integer("rating"), // 1-5 stars
  reviewCount: integer("reviewCount"),
  
  // Insurance & Cost
  acceptsInsurance: pgEnum("acceptsInsurance", ["true", "false"]).notNull(),
  costRange: varchar("costRange", { length: 100 }), // "$100-$200/session"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AutismProvider = typeof autismProviders.$inferSelect;
export type InsertAutismProvider = typeof autismProviders.$inferInsert;
export const autismDailyLogs = pgTable("autismDailyLogs", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull().references(() => autismProfiles.id),
  
  date: timestamp("date").notNull(),
  mood: integer("mood").notNull(), // 1-10 scale
  sleepQuality: integer("sleepQuality").notNull(), // 1-10 scale
  sleepHours: integer("sleepHours"), // Decimal hours (stored as int * 10, e.g., 8.5 hours = 85)
  
  // Behaviors
  meltdownCount: integer("meltdownCount").notNull().default(0),
  communicationAttempts: integer("communicationAttempts").notNull().default(0),
  
  // Observations
  wins: text("wins"), // Today's wins/successes
  challenges: text("challenges"), // Today's challenges
  notes: text("notes"), // Additional notes
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutismDailyLog = typeof autismDailyLogs.$inferSelect;
export type InsertAutismDailyLog = typeof autismDailyLogs.$inferInsert;

// From careerSchema.ts
export const careerProfiles = pgTable("career_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current Status
  employmentStatus: pgEnum("employment_status", [
    "employed_full_time",
    "employed_part_time",
    "self_employed",
    "unemployed",
    "student",
    "career_transition",
    "retired"
  ]).notNull(),
  
  currentRole: varchar("current_role", { length: 255 }),
  currentIndustry: varchar("current_industry", { length: 255 }),
  yearsExperience: integer("years_experience"),
  
  // Career Goals
  primaryGoal: pgEnum("primary_goal", [
    "find_first_job",
    "career_change",
    "advancement",
    "entrepreneurship",
    "find_purpose",
    "work_life_balance",
    "skill_development",
    "leadership_role"
  ]).notNull(),
  
  targetRole: varchar("target_role", { length: 255 }),
  targetIndustry: varchar("target_industry", { length: 255 }),
  targetTimeline: integer("target_timeline"), // months
  
  // Ikigai Framework (What you love, what you're good at, what the world needs, what you can be paid for)
  whatYouLove: text("what_you_love"), // JSON array
  whatYoureGoodAt: text("what_youre_good_at"), // JSON array
  whatWorldNeeds: text("what_world_needs"), // JSON array
  whatYouCanBePaidFor: text("what_you_can_be_paid_for"), // JSON array
  
  // Purpose Statement
  purposeStatement: text("purpose_statement"),
  coreValues: text("core_values"), // JSON array
  
  // Skills & Strengths
  currentSkills: text("current_skills"), // JSON array
  skillsToLearn: text("skills_to_learn"), // JSON array
  strengths: text("strengths"), // JSON array (based on VIA Character Strengths or StrengthsFinder)
  
  // Barriers & Challenges
  mainBarriers: text("main_barriers"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobSearchActivities = pgTable("job_search_activities", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  activityDate: timestamp("activity_date").notNull(),
  
  activityType: pgEnum("activity_type", [
    "application_submitted",
    "networking_event",
    "informational_interview",
    "phone_screen",
    "interview",
    "follow_up",
    "offer_received",
    "rejection"
  ]).notNull(),
  
  // Job Details
  companyName: varchar("company_name", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  jobUrl: text("job_url"),
  
  // Application Details
  applicationMethod: varchar("application_method", { length: 255 }), // LinkedIn, company site, referral, etc.
  referralSource: varchar("referral_source", { length: 255 }),
  
  // Interview Details
  interviewType: pgEnum("interview_type", ["phone", "video", "in_person", "panel", "technical"]),
  interviewRound: integer("interview_round"),
  interviewNotes: text("interview_notes"),
  
  // Outcome
  status: pgEnum("status", ["pending", "interviewing", "offered", "rejected", "accepted", "declined"]),
  
  // Follow-up
  nextSteps: text("next_steps"),
  followUpDate: timestamp("follow_up_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const networkingContacts = pgTable("networking_contacts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Contact Info
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  company: varchar("company", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  
  // Connection
  howMet: text("how_met"),
  connectionStrength: pgEnum("connection_strength", ["weak", "moderate", "strong"]),
  
  // Contact Details
  email: varchar("email", { length: 255 }),
  linkedIn: varchar("linkedin", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  
  // Relationship
  lastContact: timestamp("last_contact"),
  contactFrequency: pgEnum("contact_frequency", ["monthly", "quarterly", "yearly", "as_needed"]),
  
  // Value Exchange
  howTheyCanHelp: text("how_they_can_help"),
  howYouCanHelp: text("how_you_can_help"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const skillDevelopment = pgTable("skill_development", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  skillName: varchar("skill_name", { length: 255 }).notNull(),
  skillCategory: pgEnum("skill_category", ["technical", "soft_skill", "leadership", "industry_specific"]),
  
  // Current Level
  currentLevel: pgEnum("current_level", ["beginner", "intermediate", "advanced", "expert"]),
  targetLevel: pgEnum("target_level", ["beginner", "intermediate", "advanced", "expert"]),
  
  // Learning Plan
  learningResources: text("learning_resources"), // JSON array: [{type, name, url, cost}]
  practiceActivities: text("practice_activities"), // JSON array
  
  // Progress
  hoursInvested: decimal("hours_invested", { precision: 10, scale: 2 }).default("0"),
  completedMilestones: text("completed_milestones"), // JSON array
  
  // Application
  projectsUsed: text("projects_used"), // JSON array
  certificationsEarned: text("certifications_earned"), // JSON array
  
  // Timeline
  startDate: timestamp("start_date"),
  targetCompletionDate: timestamp("target_completion_date"),
  completionDate: timestamp("completion_date"),
  
  status: pgEnum("status", ["not_started", "in_progress", "completed", "on_hold"]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purposeActivities = pgTable("purpose_activities", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  activityDate: timestamp("activity_date").notNull(),
  
  // Activity Type (evidence-based purpose discovery methods)
  activityType: pgEnum("activity_type", [
    "values_clarification",
    "life_review",
    "peak_experiences",
    "ideal_day_visualization",
    "legacy_reflection",
    "contribution_mapping",
    "meaning_making"
  ]).notNull(),
  
  // Reflections
  insights: text("insights"),
  patterns: text("patterns"), // What patterns emerged?
  emotions: text("emotions"),
  
  // Purpose Elements Discovered
  passions: text("passions"), // JSON array
  strengths: text("strengths"),
  values: text("values"),
  impact: text("impact"), // How you want to contribute
  
  // Integration
  actionSteps: text("action_steps"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const careerExperiments = pgTable("career_experiments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  experimentType: pgEnum("experiment_type", [
    "informational_interview",
    "job_shadowing",
    "freelance_project",
    "volunteer_work",
    "side_project",
    "online_course",
    "industry_event"
  ]).notNull(),
  
  experimentName: varchar("experiment_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Hypothesis
  hypothesis: text("hypothesis"), // What are you testing?
  successCriteria: text("success_criteria"), // How will you know if it's a fit?
  
  // Timeline
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Results
  whatYouLearned: text("what_you_learned"),
  whatYouLiked: text("what_you_liked"),
  whatYouDisliked: text("what_you_disliked"),
  
  // Decision
  conclusion: text("conclusion"),
  nextSteps: text("next_steps"),
  
  status: pgEnum("status", ["planned", "in_progress", "completed"]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const careerMilestones = pgTable("career_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  milestoneType: pgEnum("milestone_type", [
    "job_offer",
    "promotion",
    "skill_mastery",
    "certification",
    "project_completion",
    "network_milestone",
    "business_launch",
    "revenue_milestone"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  targetDate: timestamp("target_date"),
  achievedDate: timestamp("achieved_date"),
  
  progress: integer("progress"), // 0-100%
  status: pgEnum("status", ["not_started", "in_progress", "achieved"]),
  
  impact: text("impact"), // How did this move you toward your purpose?
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From communitySchema.ts
export const communityProfiles = pgTable("community_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Display Info
  displayName: varchar("display_name", { length: 100 }).notNull(),
  bio: text("bio"),
  profilePhoto: varchar("profile_photo", { length: 500 }),
  
  // Sharing Preferences
  shareProgress: boolean("share_progress").default(true),
  shareStruggles: boolean("share_struggles").default(true),
  shareWins: boolean("share_wins").default(true),
  
  // What They're Working On
  primaryChallenges: text("primary_challenges"), // JSON array: mental_health, addiction, autism, etc.
  primaryGoals: text("primary_goals"), // JSON array
  
  // Community Role
  role: pgEnum("role", ["member", "mentor", "moderator", "admin"]).default("member"),
  
  // Mentor Availability (if mentor)
  availableAsMentor: boolean("available_as_mentor").default(false),
  mentorshipAreas: text("mentorship_areas"), // JSON array: what can they help with?
  
  // Engagement
  totalPosts: integer("total_posts").default(0),
  totalComments: integer("total_comments").default(0),
  totalSupportsGiven: integer("total_supports_given").default(0), // Likes, encouragements
  totalSupportsReceived: integer("total_supports_received").default(0),
  
  // Reputation
  helpfulnessScore: integer("helpfulness_score").default(0), // Community-voted
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communities = pgTable("communities", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Community Info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverImage: varchar("cover_image", { length: 500 }),
  
  // Type
  communityType: pgEnum("community_type", [
    "mental_health_recovery",
    "addiction_recovery",
    "autism_parents",
    "young_men",
    "relationships",
    "career_growth",
    "fitness",
    "spiritual_growth",
    "general_support"
  ]).notNull(),
  
  // Privacy
  privacy: pgEnum("privacy", ["public", "private", "invite_only"]).default("public"),
  
  // Moderation
  moderatorIds: text("moderator_ids"), // JSON array of user IDs
  
  // Guidelines
  guidelines: text("guidelines"),
  
  // Stats
  memberCount: integer("member_count").default(0),
  activeMembers: integer("active_members").default(0), // Active in last 30 days
  totalPosts: integer("total_posts").default(0),
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityMemberships = pgTable("community_memberships", {
  id: varchar("id", { length: 255 }).primaryKey(),
  communityId: varchar("community_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Role in Community
  role: pgEnum("role", ["member", "moderator", "admin"]).default("member"),
  
  // Engagement
  lastActiveAt: timestamp("last_active_at"),
  postsCount: integer("posts_count").default(0),
  commentsCount: integer("comments_count").default(0),
  
  // Notifications
  notificationsEnabled: boolean("notifications_enabled").default(true),
  
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const communityPosts = pgTable("community_posts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  communityId: varchar("community_id", { length: 255 }).notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  
  // Post Type
  postType: pgEnum("post_type", [
    "win", // Celebrating a victory
    "struggle", // Asking for support
    "question", // Seeking advice
    "check_in", // Daily check-in
    "milestone", // Achievement
    "gratitude", // Expressing thanks
    "resource", // Sharing helpful content
    "discussion" // General discussion
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  images: text("images"), // JSON array of image URLs
  
  // Tags
  tags: text("tags"), // JSON array
  
  // Engagement
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  supportsCount: integer("supports_count").default(0), // "You got this!" reactions
  
  // Moderation
  flagged: boolean("flagged").default(false),
  flagReason: text("flag_reason"),
  
  // Visibility
  visible: boolean("visible").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityComments = pgTable("community_comments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  postId: varchar("post_id", { length: 255 }).notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  
  // Content
  content: text("content").notNull(),
  
  // Engagement
  likesCount: integer("likes_count").default(0),
  
  // Moderation
  flagged: boolean("flagged").default(false),
  
  // Visibility
  visible: boolean("visible").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accountabilityPartnerships = pgTable("accountability_partnerships", {
  id: varchar("id", { length: 255 }).primaryKey(),
  user1Id: varchar("user1_id", { length: 255 }).notNull(),
  user2Id: varchar("user2_id", { length: 255 }).notNull(),
  
  // Partnership Details
  sharedGoals: text("shared_goals"), // JSON array: what are they working on together?
  checkInFrequency: pgEnum("check_in_frequency", ["daily", "weekly", "biweekly", "monthly"]),
  
  // Communication
  lastCheckIn: timestamp("last_check_in"),
  totalCheckIns: integer("total_check_ins").default(0),
  
  // Effectiveness
  partnershipSatisfaction: integer("partnership_satisfaction"), // 1-10 (from both partners)
  helpfulnessRating: integer("helpfulness_rating"), // 1-10
  
  // Status
  status: pgEnum("status", ["active", "paused", "ended"]).default("active"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const partnerCheckIns = pgTable("partner_check_ins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  partnershipId: varchar("partnership_id", { length: 255 }).notNull(),
  initiatorId: varchar("initiator_id", { length: 255 }).notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  
  // User 1 Update
  user1Progress: text("user1_progress"),
  user1Struggles: text("user1_struggles"),
  user1Wins: text("user1_wins"),
  user1NextSteps: text("user1_next_steps"),
  
  // User 2 Update
  user2Progress: text("user2_progress"),
  user2Struggles: text("user2_struggles"),
  user2Wins: text("user2_wins"),
  user2NextSteps: text("user2_next_steps"),
  
  // Mutual Support
  encouragementGiven: text("encouragement_given"), // What they said to each other
  
  // Effectiveness
  helpfulness: integer("helpfulness"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentorships = pgTable("mentorships", {
  id: varchar("id", { length: 255 }).primaryKey(),
  mentorId: varchar("mentor_id", { length: 255 }).notNull(),
  menteeId: varchar("mentee_id", { length: 255 }).notNull(),
  
  // Focus Area
  focusArea: varchar("focus_area", { length: 255 }).notNull(), // What is the mentorship about?
  
  // Frequency
  meetingFrequency: pgEnum("meeting_frequency", ["weekly", "biweekly", "monthly"]),
  
  // Progress
  totalSessions: integer("total_sessions").default(0),
  lastSession: timestamp("last_session"),
  
  // Effectiveness
  menteeProgress: integer("mentee_progress"), // 1-10: How much has mentee improved?
  menteeSatisfaction: integer("mentee_satisfaction"), // 1-10
  
  // Status
  status: pgEnum("status", ["active", "paused", "completed"]).default("active"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyCheckIns = pgTable("daily_check_ins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  
  // How Are You?
  mood: varchar("mood", { length: 100 }),
  energy: integer("energy"), // 1-10
  
  // Today's Focus
  todayGoals: text("today_goals"), // JSON array
  
  // Gratitude
  gratefulFor: text("grateful_for"),
  
  // Struggles
  strugglingWith: text("struggling_with"),
  needSupport: boolean("need_support").default(false),
  
  // Wins
  winsToday: text("wins_today"),
  
  // Visibility
  shareWithCommunity: boolean("share_with_community").default(true),
  
  // Engagement
  supportsReceived: integer("supports_received").default(0),
  commentsReceived: integer("comments_received").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityChallenges = pgTable("community_challenges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  communityId: varchar("community_id", { length: 255 }),
  
  // Challenge Details
  challengeName: varchar("challenge_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Type
  challengeType: pgEnum("challenge_type", [
    "habit_building", // 30-day habit challenge
    "goal_achievement", // Specific goal
    "streak", // Longest streak wins
    "transformation" // Before/after
  ]).notNull(),
  
  // Duration
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  duration: integer("duration"), // days
  
  // Participation
  participantCount: integer("participant_count").default(0),
  
  // Status
  status: pgEnum("status", ["upcoming", "active", "completed"]).default("upcoming"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const challengeParticipants = pgTable("challenge_participants", {
  id: varchar("id", { length: 255 }).primaryKey(),
  challengeId: varchar("challenge_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Progress
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // %
  
  // Updates
  lastUpdate: timestamp("last_update"),
  
  // Completion
  completed: boolean("completed").default(false),
  
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const communityAnalytics = pgTable("community_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Support Type Effectiveness
  supportType: varchar("support_type", { length: 100 }).notNull(), // accountability, mentorship, group
  
  // Impact Metrics
  avgUserRetention: decimal("avg_user_retention", { precision: 5, scale: 2 }), // %
  avgGoalAchievement: decimal("avg_goal_achievement", { precision: 5, scale: 2 }), // %
  avgSatisfaction: decimal("avg_satisfaction", { precision: 4, scale: 2 }), // 1-10
  
  // Optimal Parameters
  optimalCheckInFrequency: varchar("optimal_check_in_frequency", { length: 50 }),
  optimalGroupSize: integer("optimal_group_size"),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From contentModerationSchema.ts
export const forbiddenContentDictionary = pgTable("forbidden_content_dictionary", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Content Details
  contentType: pgEnum("content_type", [
    "word",
    "phrase",
    "pattern",
    "domain",
    "topic",
    "context"
  ]).notNull(),
  
  content: text("content").notNull(), // The actual forbidden content
  pattern: text("pattern"), // Regex pattern for matching
  
  // Risk Category
  riskCategory: pgEnum("risk_category", [
    "legal_liability",
    "medical_advice",
    "psychiatric_advice",
    "financial_advice",
    "crisis_intervention",
    "sexual_content",
    "violence",
    "hate_speech",
    "criminal_activity",
    "brand_damage",
    "professional_boundary",
    "insurance_violation",
    "hipaa_violation",
    "gdpr_violation",
    "emotional_dependency",
    "manipulation",
    "misinformation",
    "spam",
    "harassment"
  ]).notNull(),
  
  // Severity
  severityLevel: pgEnum("severity_level", [
    "critical", // Immediate block, legal risk
    "high", // Block, professional risk
    "medium", // Flag for review
    "low" // Log only
  ]).notNull(),
  
  // Action
  action: pgEnum("action", [
    "hard_block", // Prevent message entirely
    "soft_block", // Warn and redirect
    "flag_review", // Allow but flag for human review
    "log_only" // Track but allow
  ]).notNull(),
  
  // Source
  source: pgEnum("source", [
    "manual", // Added by admin
    "ai_detected", // Detected by AI
    "user_report", // Reported by user
    "pattern_learning", // Learned from patterns
    "regulatory_update", // From legal/compliance update
    "incident_response" // Added after incident
  ]).notNull(),
  
  // Learning Data
  detectionCount: integer("detection_count").default(0), // How many times detected
  falsePositiveCount: integer("false_positive_count").default(0), // How many false positives
  truePositiveCount: integer("true_positive_count").default(0), // How many true positives
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // % accuracy
  
  // Status
  active: boolean("active").default(true),
  
  // Metadata
  description: text("description"), // Why this is forbidden
  legalBasis: text("legal_basis"), // Legal reason (HIPAA, etc.)
  redirectMessage: text("redirect_message"), // What to tell user
  
  // Version Control
  version: integer("version").default(1),
  replacedBy: varchar("replaced_by", { length: 255 }), // If updated
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }),
});

export const contentModerationLogs = pgTable("content_moderation_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // User & Session
  userId: varchar("user_id", { length: 255 }),
  sessionId: varchar("session_id", { length: 255 }),
  
  // Content
  originalContent: text("original_content").notNull(),
  contentHash: varchar("content_hash", { length: 255 }), // For deduplication
  
  // Detection
  detectedViolations: text("detected_violations"), // JSON: array of violations
  matchedRules: text("matched_rules"), // JSON: which rules triggered
  
  // Risk Assessment
  riskScore: integer("risk_score"), // 0-100
  riskCategory: varchar("risk_category", { length: 100 }),
  severityLevel: pgEnum("severity_level", ["critical", "high", "medium", "low"]),
  
  // Action Taken
  actionTaken: pgEnum("action_taken", [
    "blocked",
    "redirected",
    "flagged",
    "allowed",
    "escalated"
  ]).notNull(),
  
  // Response
  userResponse: text("user_response"), // What we told the user
  
  // Context
  conversationContext: text("conversation_context"), // Previous messages
  userIntent: text("user_intent"), // AI-detected intent
  
  // Review
  requiresHumanReview: boolean("requires_human_review").default(false),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  reviewedAt: timestamp("reviewed_at"),
  reviewDecision: pgEnum("review_decision", [
    "confirmed_violation",
    "false_positive",
    "needs_escalation",
    "user_educated"
  ]),
  reviewNotes: text("review_notes"),
  
  // Learning
  feedbackProvided: boolean("feedback_provided").default(false),
  improvedAccuracy: boolean("improved_accuracy").default(false),
  
  detectedAt: timestamp("detected_at").defaultNow(),
});

export const aiSafetyRules = pgTable("ai_safety_rules", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Rule Details
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  ruleType: pgEnum("rule_type", [
    "boundary_enforcement",
    "crisis_detection",
    "compliance_check",
    "ethical_guideline",
    "brand_protection",
    "professional_standard"
  ]).notNull(),
  
  // Rule Content
  systemPromptAddition: text("system_prompt_addition"), // Added to AI system prompt
  validationLogic: text("validation_logic"), // How to validate
  
  // Scope
  appliesTo: pgEnum("applies_to", [
    "all_ai_interactions",
    "coaching_sessions",
    "ai_coach_only",
    "community_posts",
    "journal_entries",
    "chat_messages"
  ]).notNull(),
  
  // Priority
  priority: integer("priority").default(100), // Higher = more important
  
  // Status
  active: boolean("active").default(true),
  
  // Effectiveness
  violationsPrevented: integer("violations_prevented").default(0),
  effectiveness: decimal("effectiveness", { precision: 5, scale: 2 }), // %
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const brandSafetyKeywords = pgTable("brand_safety_keywords", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Keyword
  keyword: varchar("keyword", { length: 500 }).notNull(),
  keywordType: pgEnum("keyword_type", [
    "brand_damaging",
    "competitor_mention",
    "negative_sentiment",
    "lawsuit_risk",
    "pr_crisis",
    "customer_complaint",
    "refund_request",
    "cancellation_intent"
  ]).notNull(),
  
  // Risk
  riskLevel: pgEnum("risk_level", ["critical", "high", "medium", "low"]).notNull(),
  
  // Action
  alertTeam: boolean("alert_team").default(false),
  escalateToHuman: boolean("escalate_to_human").default(false),
  
  // Context
  context: text("context"), // When this is/isn't a problem
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const complianceCheckpoints = pgTable("compliance_checkpoints", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Checkpoint Details
  checkpointName: varchar("checkpoint_name", { length: 255 }).notNull(),
  complianceFramework: pgEnum("compliance_framework", [
    "hipaa",
    "gdpr",
    "professional_liability",
    "insurance_requirements",
    "state_regulations",
    "industry_standards"
  ]).notNull(),
  
  // Requirement
  requirement: text("requirement").notNull(),
  validationCriteria: text("validation_criteria"), // How to check compliance
  
  // Enforcement
  mandatory: boolean("mandatory").default(true),
  
  // Violation Handling
  violationSeverity: pgEnum("violation_severity", ["critical", "high", "medium", "low"]),
  violationAction: text("violation_action"), // What to do if violated
  
  // Documentation
  legalReference: text("legal_reference"), // Citation of law/regulation
  documentationRequired: text("documentation_required"), // What docs needed
  
  // Audit
  lastAuditDate: timestamp("last_audit_date"),
  nextAuditDate: timestamp("next_audit_date"),
  auditFrequency: pgEnum("audit_frequency", ["daily", "weekly", "monthly", "quarterly", "annually"]),
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patternLearning = pgTable("pattern_learning", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Pattern Details
  patternType: pgEnum("pattern_type", [
    "violation_pattern",
    "user_behavior_pattern",
    "crisis_indicator_pattern",
    "manipulation_pattern",
    "spam_pattern"
  ]).notNull(),
  
  // Pattern Data
  patternSignature: text("pattern_signature"), // What the pattern looks like
  detectionAlgorithm: text("detection_algorithm"), // How to detect
  
  // Learning Metrics
  occurrences: integer("occurrences").default(0),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  
  // Evolution
  learnedFrom: text("learned_from"), // JSON: source incidents
  improvedBy: text("improved_by"), // JSON: refinements
  
  // Status
  validated: boolean("validated").default(false),
  active: boolean("active").default(false), // Only active after validation
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const crisisInterventionLogs = pgTable("crisis_intervention_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // User
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Crisis Details
  crisisType: pgEnum("crisis_type", [
    "suicide_ideation",
    "self_harm",
    "violence_threat",
    "severe_distress",
    "psychotic_episode",
    "substance_abuse_crisis"
  ]).notNull(),
  
  // Detection
  detectedContent: text("detected_content"),
  crisisIndicators: text("crisis_indicators"), // JSON: what triggered
  riskLevel: pgEnum("risk_level", ["imminent", "high", "moderate", "low"]).notNull(),
  
  // Response
  responseProvided: text("response_provided"),
  resourcesOffered: text("resources_offered"), // JSON: hotlines, etc.
  
  // Escalation
  escalated: boolean("escalated").default(false),
  escalatedTo: varchar("escalated_to", { length: 255 }), // Who was notified
  escalatedAt: timestamp("escalated_at"),
  
  // Follow-up
  followUpRequired: boolean("follow_up_required").default(true),
  followUpCompleted: boolean("follow_up_completed").default(false),
  followUpNotes: text("follow_up_notes"),
  
  // Outcome
  outcome: pgEnum("outcome", [
    "user_safe",
    "emergency_services_contacted",
    "referred_to_professional",
    "user_unresponsive",
    "false_alarm"
  ]),
  
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const professionalBoundaryViolations = pgTable("professional_boundary_violations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Violation Details
  violationType: pgEnum("violation_type", [
    "therapy_vs_coaching",
    "medical_advice",
    "legal_advice",
    "financial_advice",
    "dual_relationship",
    "emotional_dependency",
    "inappropriate_disclosure",
    "scope_of_practice"
  ]).notNull(),
  
  // Context
  conversationId: varchar("conversation_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }),
  coachId: varchar("coach_id", { length: 255 }),
  
  // Content
  violatingContent: text("violating_content"),
  context: text("context"),
  
  // Detection
  detectedBy: pgEnum("detected_by", ["ai", "human_review", "user_report", "compliance_audit"]),
  
  // Severity
  severity: pgEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
  
  // Response
  correctionProvided: text("correction_provided"),
  educationProvided: text("education_provided"),
  
  // Accountability
  coachNotified: boolean("coach_notified").default(false),
  trainingRequired: boolean("training_required").default(false),
  
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const safetyAnalytics = pgTable("safety_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Time Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Metrics
  totalInteractions: integer("total_interactions"),
  violationsDetected: integer("violations_detected"),
  violationRate: decimal("violation_rate", { precision: 5, scale: 2 }), // %
  
  // By Category
  legalViolations: integer("legal_violations"),
  ethicalViolations: integer("ethical_violations"),
  brandSafetyIssues: integer("brand_safety_issues"),
  crisisInterventions: integer("crisis_interventions"),
  
  // Actions
  contentBlocked: integer("content_blocked"),
  contentFlagged: integer("content_flagged"),
  usersEscalated: integer("users_escalated"),
  
  // Accuracy
  falsePositiveRate: decimal("false_positive_rate", { precision: 5, scale: 2 }),
  falseNegativeRate: decimal("false_negative_rate", { precision: 5, scale: 2 }),
  
  // Learning
  newPatternsDetected: integer("new_patterns_detected"),
  rulesUpdated: integer("rules_updated"),
  dictionaryExpanded: integer("dictionary_expanded"),
  
  generatedAt: timestamp("generated_at").defaultNow(),
});


// From emotionalEngineSchema.ts
export const emotionalProfiles = pgTable("emotional_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Baseline Emotional State
  baselineEmotionalState: varchar("baseline_emotional_state", { length: 100 }),
  emotionalRange: pgEnum("emotional_range", ["narrow", "moderate", "wide"]), // How much do emotions fluctuate?
  emotionalIntensity: pgEnum("emotional_intensity", ["low", "moderate", "high"]),
  
  // Regulation Ability
  regulationSkillLevel: integer("regulation_skill_level"), // 1-10
  awarenessLevel: integer("awareness_level"), // 1-10 (how aware are you of your emotions?)
  
  // Challenges
  primaryChallenges: text("primary_challenges"), // JSON: overwhelm, numbness, mood_swings, anger, anxiety, etc.
  
  // Goals
  primaryGoal: pgEnum("primary_goal", [
    "regulate_emotions",
    "reduce_reactivity",
    "increase_awareness",
    "process_trauma",
    "build_resilience",
    "feel_more",
    "feel_less_overwhelmed",
    "emotional_stability"
  ]).notNull(),
  
  // Emotional Patterns (self-learning)
  commonTriggers: text("common_triggers"), // JSON: learned from tracking
  commonEmotions: text("common_emotions"), // JSON: most frequent emotions
  emotionalCycles: text("emotional_cycles"), // JSON: patterns (e.g., anxiety peaks in morning)
  
  // Effective Strategies (self-learning)
  mostEffectiveStrategies: text("most_effective_strategies"), // JSON: what works for this user
  leastEffectiveStrategies: text("least_effective_strategies"), // JSON: what doesn't work
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emotionEntries = pgTable("emotion_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  entryDate: timestamp("entry_date").notNull(),
  
  // Primary Emotion (Lisa Feldman Barrett's emotion categories)
  primaryEmotion: varchar("primary_emotion", { length: 100 }).notNull(), // joy, sadness, anger, fear, disgust, surprise, etc.
  secondaryEmotions: text("secondary_emotions"), // JSON array
  
  // Intensity
  intensity: integer("intensity"), // 1-10
  
  // Valence & Arousal (circumplex model)
  valence: integer("valence"), // -5 to +5 (negative to positive)
  arousal: integer("arousal"), // 1-10 (low energy to high energy)
  
  // Context
  trigger: text("trigger"), // What caused this emotion?
  situation: text("situation"),
  thoughts: text("thoughts"), // What were you thinking?
  
  // Physical Sensations
  physicalSensations: text("physical_sensations"), // JSON: heart racing, tension, warmth, etc.
  
  // Behavior
  urge: text("urge"), // What did you want to do?
  actualBehavior: text("actual_behavior"), // What did you actually do?
  
  // Duration
  durationMinutes: integer("duration_minutes"),
  
  // Regulation Attempted
  regulationUsed: boolean("regulation_used"),
  regulationStrategy: varchar("regulation_strategy", { length: 255 }),
  regulationEffectiveness: integer("regulation_effectiveness"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const dbtSkillsPractice = pgTable("dbt_skills_practice", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // DBT Module
  dbtModule: pgEnum("dbt_module", [
    "mindfulness",
    "distress_tolerance",
    "emotion_regulation",
    "interpersonal_effectiveness"
  ]).notNull(),
  
  // Specific Skill
  skillUsed: pgEnum("skill_used", [
    // Mindfulness
    "observe",
    "describe",
    "participate",
    "non_judgmental_stance",
    "one_mindfully",
    "effectively",
    
    // Distress Tolerance
    "STOP", // Stop, Take a step back, Observe, Proceed mindfully
    "TIPP", // Temperature, Intense exercise, Paced breathing, Paired muscle relaxation
    "distract",
    "self_soothe",
    "IMPROVE", // Imagery, Meaning, Prayer, Relaxation, One thing, Vacation, Encouragement
    "pros_and_cons",
    "radical_acceptance",
    
    // Emotion Regulation
    "check_the_facts",
    "opposite_action",
    "problem_solving",
    "ABC_PLEASE", // Accumulate positives, Build mastery, Cope ahead, Physical illness, Eating, Avoid drugs, Sleep, Exercise
    "build_positive_experiences",
    
    // Interpersonal Effectiveness
    "DEAR_MAN", // Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate
    "GIVE", // Gentle, Interested, Validate, Easy manner
    "FAST" // Fair, Apologies (no excessive), Stick to values, Truthful
  ]).notNull(),
  
  // Context
  situation: text("situation"),
  emotionBefore: varchar("emotion_before", { length: 100 }),
  intensityBefore: integer("intensity_before"), // 1-10
  
  // Practice
  howUsed: text("how_used"),
  
  // Outcome
  emotionAfter: varchar("emotion_after", { length: 100 }),
  intensityAfter: integer("intensity_after"), // 1-10
  
  // Effectiveness
  effectiveness: integer("effectiveness"), // 1-10
  wouldUseAgain: boolean("would_use_again"),
  
  // Challenges
  challenges: text("challenges"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const actPractices = pgTable("act_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // ACT Process
  actProcess: pgEnum("act_process", [
    "acceptance", // Willingness to have difficult emotions
    "cognitive_defusion", // Separating from thoughts
    "present_moment", // Mindfulness
    "self_as_context", // Observer self
    "values", // What matters to you
    "committed_action" // Values-based action
  ]).notNull(),
  
  // Specific Technique
  technique: varchar("technique", { length: 255 }),
  
  // Practice
  situation: text("situation"),
  difficultThought: text("difficult_thought"),
  difficultEmotion: varchar("difficult_emotion", { length: 100 }),
  
  // ACT Response
  acceptanceLevel: integer("acceptance_level"), // 1-10 (how much did you accept vs. struggle?)
  defusionLevel: integer("defusion_level"), // 1-10 (how much did you separate from the thought?)
  
  // Values Alignment
  valueIdentified: varchar("value_identified", { length: 255 }),
  actionTaken: text("action_taken"), // Values-based action
  
  // Outcome
  psychologicalFlexibility: integer("psychological_flexibility"), // 1-10 (how flexible were you?)
  effectiveness: integer("effectiveness"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const emotionRegulationStrategies = pgTable("emotion_regulation_strategies", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  useDate: timestamp("use_date").notNull(),
  
  // Strategy Type (evidence-based)
  strategyType: pgEnum("strategy_type", [
    "reappraisal", // Cognitive reframing
    "suppression", // Inhibiting emotion (generally unhelpful)
    "distraction", // Shifting attention
    "acceptance", // Allowing the emotion
    "problem_solving", // Changing the situation
    "social_support", // Talking to someone
    "expressive_writing", // Journaling
    "physical_release", // Exercise, crying, etc.
    "relaxation", // Deep breathing, PMR
    "mindfulness", // Present moment awareness
    "opposite_action" // DBT: act opposite to emotion urge
  ]).notNull(),
  
  // Context
  emotion: varchar("emotion", { length: 100 }).notNull(),
  intensityBefore: integer("intensity_before"), // 1-10
  trigger: text("trigger"),
  
  // Strategy Application
  whatYouDid: text("what_you_did"),
  duration: integer("duration"), // minutes
  
  // Outcome
  intensityAfter: integer("intensity_after"), // 1-10
  emotionChanged: boolean("emotion_changed"),
  newEmotion: varchar("new_emotion", { length: 100 }),
  
  // Effectiveness
  immediateEffectiveness: integer("immediate_effectiveness"), // 1-10
  longTermHelpful: boolean("long_term_helpful"), // Did this actually help or just avoid?
  
  // Side Effects
  sideEffects: text("side_effects"), // Any negative consequences?
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const resilienceActivities = pgTable("resilience_activities", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  activityDate: timestamp("activity_date").notNull(),
  
  // Activity Type (evidence-based resilience factors)
  activityType: pgEnum("activity_type", [
    "social_connection", // Building relationships
    "meaning_making", // Finding purpose in adversity
    "optimism_practice", // Realistic optimism
    "self_efficacy", // Building confidence
    "emotion_regulation", // Managing emotions
    "cognitive_flexibility", // Adaptive thinking
    "physical_health", // Exercise, sleep, nutrition
    "spirituality", // Connection to something greater
    "growth_mindset", // Learning from challenges
    "gratitude", // Appreciating what you have
    "self_compassion" // Being kind to yourself
  ]).notNull(),
  
  activity: varchar("activity", { length: 255 }).notNull(),
  description: text("description"),
  
  duration: integer("duration"), // minutes
  
  // Impact
  resilienceImpact: integer("resilience_impact"), // 1-10
  emotionalImpact: integer("emotional_impact"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const emotionalProcessing = pgTable("emotional_processing", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  processingDate: timestamp("processing_date").notNull(),
  
  // What You're Processing
  emotionToProcess: varchar("emotion_to_process", { length: 100 }).notNull(),
  relatedEvent: text("related_event"),
  
  // Processing Method
  processingMethod: pgEnum("processing_method", [
    "journaling",
    "talking_to_someone",
    "therapy_session",
    "somatic_experiencing", // Body-based processing
    "EMDR", // Eye Movement Desensitization
    "expressive_art",
    "movement",
    "crying",
    "meditation",
    "ritual"
  ]).notNull(),
  
  // Process
  whatCameUp: text("what_came_up"), // Insights, memories, realizations
  physicalSensations: text("physical_sensations"),
  
  // Depth
  processingDepth: pgEnum("processing_depth", ["surface", "moderate", "deep"]),
  
  // Outcome
  feelingAfter: varchar("feeling_after", { length: 100 }),
  resolutionLevel: integer("resolution_level"), // 1-10 (how resolved does this feel?)
  
  // Integration
  insights: text("insights"),
  actionSteps: text("action_steps"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const emotionalWins = pgTable("emotional_wins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  winDate: timestamp("win_date").notNull(),
  
  winType: pgEnum("win_type", [
    "regulated_successfully",
    "felt_emotion_fully",
    "set_boundary",
    "expressed_emotion_healthily",
    "processed_trauma",
    "resilience_moment",
    "emotional_breakthrough",
    "pattern_broken"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Significance
  significance: text("significance"),
  howYouGrew: text("how_you_grew"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const emotionalEngineAnalytics = pgTable("emotional_engine_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Strategy Effectiveness (aggregated)
  strategyType: varchar("strategy_type", { length: 100 }).notNull(),
  emotionType: varchar("emotion_type", { length: 100 }).notNull(),
  
  // Effectiveness Metrics
  avgIntensityReduction: decimal("avg_intensity_reduction", { precision: 5, scale: 2 }),
  avgEffectivenessRating: decimal("avg_effectiveness_rating", { precision: 5, scale: 2 }),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // % of times it helped
  
  // Optimal Parameters
  optimalDuration: integer("optimal_duration"), // minutes
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different emotional profiles
  
  // Sample Size
  useCount: integer("use_count"),
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From financialSchema.ts
export const financialProfiles = pgTable("financial_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current Financial Situation
  employmentStatus: pgEnum("employment_status", ["employed", "self_employed", "unemployed", "underemployed", "student", "retired"]),
  monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }),
  incomeStability: pgEnum("income_stability", ["stable", "variable", "unstable"]),
  
  // Debt Situation
  totalDebt: decimal("total_debt", { precision: 10, scale: 2 }),
  debtTypes: text("debt_types"), // JSON array: credit_card, student_loan, medical, personal, etc.
  
  // Financial Health
  hasEmergencyFund: boolean("has_emergency_fund").default(false),
  emergencyFundMonths: integer("emergency_fund_months"), // How many months of expenses covered
  hasBudget: boolean("has_budget").default(false),
  tracksSpending: boolean("tracks_spending").default(false),
  
  // Financial Stress Level
  financialStressLevel: integer("financial_stress_level"), // 1-10
  
  // Primary Financial Goal
  primaryGoal: pgEnum("primary_goal", [
    "get_out_of_debt",
    "build_emergency_fund",
    "increase_income",
    "stop_overspending",
    "save_for_goal",
    "invest_for_future",
    "improve_credit_score",
    "financial_literacy"
  ]).notNull(),
  
  specificGoals: text("specific_goals"), // JSON array
  
  // Money Mindset (psychological factors)
  moneyScripts: text("money_scripts"), // JSON array: beliefs about money from childhood
  financialTrauma: text("financial_trauma"), // Past financial hardships
  
  // Behavioral Patterns
  impulseBuyingTriggers: text("impulse_buying_triggers"), // JSON array
  emotionalSpendingTriggers: text("emotional_spending_triggers"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const debtAccounts = pgTable("debt_accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  debtType: pgEnum("debt_type", [
    "credit_card",
    "student_loan",
    "car_loan",
    "personal_loan",
    "medical_debt",
    "payday_loan",
    "mortgage",
    "other"
  ]).notNull(),
  
  creditorName: varchar("creditor_name", { length: 255 }).notNull(),
  
  // Debt Details
  originalBalance: decimal("original_balance", { precision: 10, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }), // APR
  minimumPayment: decimal("minimum_payment", { precision: 10, scale: 2 }),
  
  // Payoff Strategy
  payoffMethod: pgEnum("payoff_method", ["snowball", "avalanche", "custom"]), // Snowball = smallest first, Avalanche = highest interest first
  payoffPriority: integer("payoff_priority"), // 1 = pay off first
  
  // Tracking
  lastPaymentDate: timestamp("last_payment_date"),
  lastPaymentAmount: decimal("last_payment_amount", { precision: 10, scale: 2 }),
  
  // Projections
  projectedPayoffDate: timestamp("projected_payoff_date"),
  totalInterestPaid: decimal("total_interest_paid", { precision: 10, scale: 2 }).default("0"),
  
  // Status
  status: pgEnum("status", ["active", "in_collections", "paid_off", "settled"]),
  paidOffDate: timestamp("paid_off_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const debtPayments = pgTable("debt_payments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  debtAccountId: varchar("debt_account_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  paymentDate: timestamp("payment_date").notNull(),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  
  principalPaid: decimal("principal_paid", { precision: 10, scale: 2 }),
  interestPaid: decimal("interest_paid", { precision: 10, scale: 2 }),
  
  balanceAfterPayment: decimal("balance_after_payment", { precision: 10, scale: 2 }),
  
  // Emotional Impact (behavioral economics)
  emotionalImpact: integer("emotional_impact"), // 1-10 (how good did it feel?)
  motivationBoost: integer("motivation_boost"), // 1-10
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgetCategories = pgTable("budget_categories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  categoryType: pgEnum("category_type", [
    "housing",
    "utilities",
    "food",
    "transportation",
    "insurance",
    "debt_payments",
    "savings",
    "personal",
    "entertainment",
    "giving",
    "other"
  ]).notNull(),
  
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  
  // Budget Amounts
  plannedAmount: decimal("planned_amount", { precision: 10, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 10, scale: 2 }).default("0"),
  
  // Tracking
  isEssential: boolean("is_essential").default(true), // Can't cut this
  isVariable: boolean("is_variable").default(false), // Amount changes monthly
  
  // Month
  budgetMonth: varchar("budget_month", { length: 7 }), // YYYY-MM format
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  expenseDate: timestamp("expense_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  categoryId: varchar("category_id", { length: 255 }),
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  
  description: varchar("description", { length: 255 }),
  merchant: varchar("merchant", { length: 255 }),
  
  // Behavioral Tracking
  wasPlanned: boolean("was_planned"), // Was this in the budget?
  wasNecessary: boolean("was_necessary"), // Did you really need this?
  wasImpulse: boolean("was_impulse"), // Impulse purchase?
  
  emotionalState: varchar("emotional_state", { length: 100 }), // What were you feeling when you bought this?
  trigger: varchar("trigger", { length: 255 }), // What triggered this purchase?
  
  // Regret/Satisfaction
  satisfactionLevel: integer("satisfaction_level"), // 1-10
  regretLevel: integer("regret_level"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const incomeEntries = pgTable("income_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  incomeDate: timestamp("income_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  incomeType: pgEnum("income_type", [
    "salary",
    "hourly_wages",
    "freelance",
    "side_hustle",
    "passive_income",
    "bonus",
    "gift",
    "refund",
    "other"
  ]).notNull(),
  
  source: varchar("source", { length: 255 }),
  description: text("description"),
  
  isRecurring: boolean("is_recurring").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const savingsGoals = pgTable("savings_goals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  goalType: pgEnum("goal_type", [
    "emergency_fund",
    "down_payment",
    "vacation",
    "car",
    "education",
    "retirement",
    "wedding",
    "other"
  ]).notNull(),
  
  goalName: varchar("goal_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Goal Details
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  
  // Timeline
  startDate: timestamp("start_date"),
  targetDate: timestamp("target_date"),
  
  // Contribution Plan
  monthlyContribution: decimal("monthly_contribution", { precision: 10, scale: 2 }),
  
  // Progress
  percentComplete: integer("percent_complete").default(0),
  
  // Motivation
  whyItMatters: text("why_it_matters"),
  visualReminder: varchar("visual_reminder", { length: 255 }), // Image URL
  
  status: pgEnum("status", ["active", "paused", "completed", "abandoned"]),
  completedDate: timestamp("completed_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const financialWins = pgTable("financial_wins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  winDate: timestamp("win_date").notNull(),
  
  winType: pgEnum("win_type", [
    "debt_paid_off",
    "emergency_fund_milestone",
    "savings_goal_reached",
    "budget_followed",
    "no_impulse_buys",
    "income_increased",
    "credit_score_improved",
    "financial_habit_built"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Impact
  amountInvolved: decimal("amount_involved", { precision: 10, scale: 2 }),
  emotionalImpact: integer("emotional_impact"), // 1-10
  
  // Reflection
  whatYouLearned: text("what_you_learned"),
  whoYouBecame: text("who_you_became"), // Identity shift
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const moneyMindsetReflections = pgTable("money_mindset_reflections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  reflectionDate: timestamp("reflection_date").notNull(),
  
  // Reflection Prompts
  promptType: pgEnum("prompt_type", [
    "money_scripts", // What did you learn about money growing up?
    "scarcity_vs_abundance", // Do you operate from scarcity or abundance?
    "self_worth", // How is your self-worth tied to money?
    "comparison", // How does comparing yourself to others affect your spending?
    "emotional_spending", // What emotions trigger spending?
    "financial_fears", // What are you afraid of financially?
    "financial_dreams" // What would financial freedom look like?
  ]).notNull(),
  
  reflection: text("reflection").notNull(),
  
  // Insights
  insights: text("insights"),
  limitingBeliefs: text("limiting_beliefs"), // JSON array
  empoweringBeliefs: text("empowering_beliefs"), // JSON array
  
  actionSteps: text("action_steps"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const financialEducation = pgTable("financial_education", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  topic: pgEnum("topic", [
    "budgeting_basics",
    "debt_payoff_strategies",
    "emergency_fund",
    "investing_101",
    "retirement_planning",
    "credit_scores",
    "tax_basics",
    "insurance",
    "real_estate",
    "behavioral_finance"
  ]).notNull(),
  
  resourceType: pgEnum("resource_type", ["article", "video", "course", "book", "podcast"]),
  resourceName: varchar("resource_name", { length: 255 }),
  resourceUrl: text("resource_url"),
  
  completedDate: timestamp("completed_date"),
  
  // Application
  keyTakeaways: text("key_takeaways"), // JSON array
  appliedLearning: text("applied_learning"), // How did you use this?
  
  status: pgEnum("status", ["not_started", "in_progress", "completed"]),
  
  createdAt: timestamp("created_at").defaultNow(),
});


// From gamificationSchema.ts
export const gamificationProfiles = pgTable("gamification_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Overall Progress
  totalExperiencePoints: integer("total_experience_points").default(0),
  currentLevel: integer("current_level").default(1),
  experienceToNextLevel: integer("experience_to_next_level").default(100),
  
  // Engagement
  currentStreak: integer("current_streak").default(0), // Days
  longestStreak: integer("longest_streak").default(0),
  totalDaysActive: integer("total_days_active").default(0),
  
  // Achievements
  totalAchievements: integer("total_achievements").default(0),
  totalBadges: integer("total_badges").default(0),
  totalMilestones: integer("total_milestones").default(0),
  
  // Motivation Type (Self-Determination Theory)
  motivationType: pgEnum("motivation_type", [
    "autonomy_driven", // Wants control & choice
    "competence_driven", // Wants mastery & skill
    "relatedness_driven", // Wants connection & belonging
    "mixed"
  ]),
  
  // Gamification Preferences
  likesCompetition: boolean("likes_competition").default(false),
  likesCollaboration: boolean("likes_collaboration").default(true),
  likesChallenges: boolean("likes_challenges").default(true),
  likesRewards: boolean("likes_rewards").default(true),
  
  // Self-Learning Data
  mostMotivatingRewards: text("most_motivating_rewards"), // JSON: which rewards drive action
  optimalChallengeDifficulty: integer("optimal_challenge_difficulty"), // 1-10
  motivationPatterns: text("motivation_patterns"), // JSON: when motivation dips/peaks
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const experiencePointsLog = pgTable("experience_points_log", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Source
  source: pgEnum("source", [
    "habit_completion",
    "daily_check_in",
    "goal_achievement",
    "milestone_reached",
    "challenge_completed",
    "helping_others",
    "consistency_bonus",
    "level_up"
  ]).notNull(),
  
  sourceId: varchar("source_id", { length: 255 }), // ID of the habit, goal, etc.
  
  // Points
  pointsEarned: integer("points_earned").notNull(),
  
  // Context
  description: varchar("description", { length: 255 }),
  
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Achievement Details
  achievementName: varchar("achievement_name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  
  // Category
  category: pgEnum("category", [
    "habits",
    "goals",
    "streaks",
    "community",
    "learning",
    "health",
    "transformation"
  ]).notNull(),
  
  // Difficulty
  difficulty: pgEnum("difficulty", ["bronze", "silver", "gold", "platinum", "legendary"]),
  
  // Requirements
  requirements: text("requirements"), // JSON: what needs to be done
  
  // Rewards
  experiencePoints: integer("experience_points").notNull(),
  
  // Rarity
  rarity: pgEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]),
  
  // Stats
  totalUnlocked: integer("total_unlocked").default(0), // How many users have this?
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  achievementId: varchar("achievement_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Progress
  progress: integer("progress").default(0), // % or count
  completed: boolean("completed").default(false),
  
  // Unlock
  unlockedAt: timestamp("unlocked_at"),
  
  // Visibility
  displayOnProfile: boolean("display_on_profile").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Challenge Details
  challengeName: varchar("challenge_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Type
  challengeType: pgEnum("challenge_type", [
    "daily", // Complete today
    "weekly", // Complete this week
    "one_time", // Complete once
    "recurring" // Repeats
  ]).notNull(),
  
  // Difficulty
  difficulty: integer("difficulty"), // 1-10
  
  // Requirements
  requirements: text("requirements"), // JSON: what needs to be done
  
  // Rewards
  experiencePoints: integer("experience_points"),
  badgeId: varchar("badge_id", { length: 255 }),
  
  // Availability
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Stats
  totalAttempts: integer("total_attempts").default(0),
  totalCompletions: integer("total_completions").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userChallenges = pgTable("user_challenges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  challengeId: varchar("challenge_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Progress
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  
  // Dates
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  
  // Attempts
  attempts: integer("attempts").default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Badge Details
  badgeName: varchar("badge_name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  
  // Category
  category: varchar("category", { length: 100 }),
  
  // Rarity
  rarity: pgEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]),
  
  // How to Earn
  howToEarn: text("how_to_earn"),
  
  // Stats
  totalAwarded: integer("total_awarded").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  badgeId: varchar("badge_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Award Details
  awardedFor: text("awarded_for"), // What did they do to earn this?
  
  // Display
  displayOnProfile: boolean("display_on_profile").default(true),
  
  awardedAt: timestamp("awarded_at").defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Milestone Details
  milestoneType: pgEnum("milestone_type", [
    "first_day",
    "first_week",
    "first_month",
    "100_days",
    "1_year",
    "first_goal",
    "10_goals",
    "first_habit_mastered",
    "level_milestone",
    "transformation_milestone"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Rewards
  experiencePoints: integer("experience_points"),
  
  // Context
  relatedTo: varchar("related_to", { length: 255 }), // What module/feature?
  
  achievedAt: timestamp("achieved_at").defaultNow(),
});

export const leaderboards = pgTable("leaderboards", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Leaderboard Details
  leaderboardName: varchar("leaderboard_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Type
  leaderboardType: pgEnum("leaderboard_type", [
    "overall_xp", // Total experience points
    "current_streak", // Longest current streak
    "goals_achieved", // Most goals completed
    "habits_mastered", // Most habits mastered
    "community_support", // Most helpful to others
    "transformation" // Biggest transformation
  ]).notNull(),
  
  // Time Period
  timePeriod: pgEnum("time_period", ["all_time", "monthly", "weekly"]),
  
  // Privacy
  optInOnly: boolean("opt_in_only").default(true), // Users must opt-in to appear
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  leaderboardId: varchar("leaderboard_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Ranking
  rank: integer("rank"),
  score: integer("score"), // The metric being measured
  
  // Opt-In
  optedIn: boolean("opted_in").default(false),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyRewards = pgTable("daily_rewards", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  rewardDate: timestamp("reward_date").notNull(),
  
  // Streak Bonus
  consecutiveDays: integer("consecutive_days"),
  streakBonus: integer("streak_bonus"), // Extra XP for streak
  
  // Completion Bonus
  tasksCompleted: integer("tasks_completed"),
  completionBonus: integer("completion_bonus"),
  
  // Total
  totalExperiencePoints: integer("total_experience_points"),
  
  // Claimed
  claimed: boolean("claimed").default(false),
  claimedAt: timestamp("claimed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const motivationBoosts = pgTable("motivation_boosts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Trigger
  triggerType: pgEnum("trigger_type", [
    "streak_at_risk", // About to lose streak
    "low_engagement", // Haven't logged in for days
    "goal_stalled", // No progress on goal
    "achievement_close", // Almost unlocked achievement
    "milestone_approaching" // Close to milestone
  ]).notNull(),
  
  // Boost Type
  boostType: pgEnum("boost_type", [
    "encouragement", // Motivational message
    "reminder", // Gentle nudge
    "challenge", // New challenge offered
    "reward_preview", // Show what they're close to earning
    "social_proof" // Others are succeeding
  ]).notNull(),
  
  // Content
  message: text("message"),
  actionSuggested: varchar("action_suggested", { length: 255 }),
  
  // Effectiveness
  opened: boolean("opened").default(false),
  actionTaken: boolean("action_taken").default(false),
  
  sentAt: timestamp("sent_at").defaultNow(),
});

export const gamificationAnalytics = pgTable("gamification_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Element Type
  elementType: varchar("element_type", { length: 100 }).notNull(), // achievement, challenge, reward, etc.
  
  // Effectiveness Metrics
  avgEngagementIncrease: decimal("avg_engagement_increase", { precision: 5, scale: 2 }), // %
  avgRetentionImpact: decimal("avg_retention_impact", { precision: 5, scale: 2 }), // %
  avgGoalCompletionImpact: decimal("avg_goal_completion_impact", { precision: 5, scale: 2 }), // %
  
  // Optimal Parameters
  optimalDifficulty: integer("optimal_difficulty"), // 1-10
  optimalRewardTiming: varchar("optimal_reward_timing", { length: 100 }),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From goalsSchema.ts
export const goalProfiles = pgTable("goal_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Achievement Stats
  totalGoalsSet: integer("total_goals_set").default(0),
  totalGoalsAchieved: integer("total_goals_achieved").default(0),
  totalGoalsAbandoned: integer("total_goals_abandoned").default(0),
  achievementRate: decimal("achievement_rate", { precision: 5, scale: 2 }), // %
  
  // Goal-Setting Style
  preferredFramework: pgEnum("preferred_framework", [
    "smart",
    "okr",
    "woop",
    "habit_based",
    "identity_based"
  ]),
  
  // Optimal Parameters (Self-Learning)
  optimalGoalDifficulty: integer("optimal_goal_difficulty"), // 1-10
  optimalTimeframe: varchar("optimal_timeframe", { length: 100 }), // "30 days", "90 days", etc.
  optimalGoalCount: integer("optimal_goal_count"), // How many concurrent goals?
  
  // Motivation Type
  motivationType: pgEnum("motivation_type", [
    "outcome_focused", // Wants the result
    "process_focused", // Enjoys the journey
    "identity_focused", // Wants to become someone
    "mixed"
  ]),
  
  // Accountability Preferences
  needsAccountability: boolean("needs_accountability").default(false),
  preferredAccountabilityType: pgEnum("preferred_accountability_type", [
    "self",
    "partner",
    "group",
    "public",
    "coach"
  ]),
  
  // Success Patterns
  successPatterns: text("success_patterns"), // JSON: what leads to success for this user
  failurePatterns: text("failure_patterns"), // JSON: what leads to failure
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Goal Details
  goalName: varchar("goal_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Goal Type
  goalType: pgEnum("goal_type", [
    "outcome", // Achieve a specific result
    "process", // Follow a specific process
    "performance", // Meet a standard
    "learning", // Acquire a skill
    "avoidance", // Stop doing something
    "identity" // Become a type of person
  ]).notNull(),
  
  // Framework
  framework: pgEnum("framework", ["smart", "okr", "woop", "habit_based", "identity_based"]),
  
  // SMART Criteria
  specific: boolean("specific").default(false), // Is it specific?
  measurable: boolean("measurable").default(false), // Can it be measured?
  achievable: boolean("achievable").default(false), // Is it realistic?
  relevant: boolean("relevant").default(false), // Does it matter?
  timeBound: boolean("time_bound").default(false), // Does it have a deadline?
  
  // Category
  category: pgEnum("category", [
    "health",
    "fitness",
    "career",
    "financial",
    "relationships",
    "personal_growth",
    "learning",
    "creative",
    "spiritual",
    "other"
  ]),
  
  // Difficulty
  difficulty: integer("difficulty"), // 1-10
  
  // Timeline
  startDate: timestamp("start_date"),
  targetDate: timestamp("target_date"),
  
  // Measurement
  metricType: pgEnum("metric_type", ["number", "percentage", "boolean", "custom"]),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }), // kg, %, hours, etc.
  
  // Progress
  progressPercent: decimal("progress_percent", { precision: 5, scale: 2 }), // 0-100
  
  // Status
  status: pgEnum("status", [
    "not_started",
    "in_progress",
    "on_track",
    "at_risk",
    "behind",
    "achieved",
    "abandoned"
  ]).default("not_started"),
  
  // Priority
  priority: pgEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  
  // Visibility
  isPublic: boolean("is_public").default(false), // Share with community?
  
  // Related
  relatedHabitId: varchar("related_habit_id", { length: 255 }), // Link to habit
  relatedGoalId: varchar("related_goal_id", { length: 255 }), // Parent/child goals
  
  // Completion
  completedAt: timestamp("completed_at"),
  abandonedAt: timestamp("abandoned_at"),
  abandonReason: text("abandon_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const okrs = pgTable("okrs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Objective (the goal)
  objective: text("objective").notNull(),
  
  // Time Period
  timePeriod: pgEnum("time_period", ["quarterly", "annual", "custom"]),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Overall Progress
  overallProgress: decimal("overall_progress", { precision: 5, scale: 2 }), // 0-100
  
  // Status
  status: pgEnum("status", ["not_started", "in_progress", "achieved", "abandoned"]).default("not_started"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const keyResults = pgTable("key_results", {
  id: varchar("id", { length: 255 }).primaryKey(),
  okrId: varchar("okr_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Key Result Details
  keyResult: text("key_result").notNull(),
  
  // Measurement
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  
  // Progress
  progressPercent: decimal("progress_percent", { precision: 5, scale: 2 }), // 0-100
  
  // Status
  status: pgEnum("status", ["not_started", "in_progress", "achieved"]).default("not_started"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const woopPlans = pgTable("woop_plans", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Wish
  wish: text("wish").notNull(), // What do you want?
  
  // Outcome
  outcome: text("outcome").notNull(), // What's the best outcome?
  outcomeVisualization: text("outcome_visualization"), // Detailed visualization
  
  // Obstacle
  obstacle: text("obstacle").notNull(), // What will get in the way?
  obstacleAnticipation: text("obstacle_anticipation"), // How likely is this obstacle?
  
  // Plan
  plan: text("plan").notNull(), // If obstacle occurs, then I will...
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const implementationIntentions = pgTable("implementation_intentions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // If-Then Statement
  ifCondition: text("if_condition").notNull(), // If [situation]...
  thenAction: text("then_action").notNull(), // Then I will [action]...
  
  // Type
  intentionType: pgEnum("intention_type", [
    "initiation", // When to start
    "execution", // How to do it
    "obstacle_management", // How to handle obstacles
    "recovery" // How to get back on track
  ]),
  
  // Effectiveness
  timesTriggered: integer("times_triggered").default(0),
  timesExecuted: integer("times_executed").default(0),
  executionRate: decimal("execution_rate", { precision: 5, scale: 2 }), // %
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goalMilestones = pgTable("goal_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Milestone Details
  milestoneName: varchar("milestone_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Target
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  targetDate: timestamp("target_date"),
  
  // Progress
  achieved: boolean("achieved").default(false),
  achievedAt: timestamp("achieved_at"),
  
  // Order
  sequenceOrder: integer("sequence_order"), // 1st milestone, 2nd, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const goalProgressLogs = pgTable("goal_progress_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Progress Update
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull(),
  progressPercent: decimal("progress_percent", { precision: 5, scale: 2 }),
  
  // Context
  notes: text("notes"),
  
  // Momentum
  momentum: pgEnum("momentum", ["accelerating", "steady", "slowing", "stalled"]),
  
  logDate: timestamp("log_date").defaultNow(),
});

export const goalObstacles = pgTable("goal_obstacles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Obstacle Details
  obstacleName: varchar("obstacle_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Type
  obstacleType: pgEnum("obstacle_type", [
    "internal", // Motivation, fear, habits
    "external", // Time, money, resources
    "skill", // Lack of knowledge/ability
    "environmental", // Circumstances
    "social" // Other people
  ]),
  
  // Severity
  severity: integer("severity"), // 1-10
  
  // Frequency
  occurrenceCount: integer("occurrence_count").default(0),
  lastOccurrence: timestamp("last_occurrence"),
  
  // Solution
  solution: text("solution"), // How to overcome this
  solutionEffective: boolean("solution_effective"),
  
  // Status
  overcome: boolean("overcome").default(false),
  overcameAt: timestamp("overcame_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goalAccountability = pgTable("goal_accountability", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Accountability Type
  accountabilityType: pgEnum("accountability_type", [
    "self_tracking",
    "accountability_partner",
    "group",
    "public_commitment",
    "coach",
    "financial_stake" // Put money on the line
  ]).notNull(),
  
  // Partner (if applicable)
  partnerId: varchar("partner_id", { length: 255 }),
  
  // Check-In Frequency
  checkInFrequency: pgEnum("check_in_frequency", ["daily", "weekly", "biweekly", "monthly"]),
  
  // Last Check-In
  lastCheckIn: timestamp("last_check_in"),
  nextCheckIn: timestamp("next_check_in"),
  
  // Effectiveness
  adherenceRate: decimal("adherence_rate", { precision: 5, scale: 2 }), // % of check-ins completed
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goalReflections = pgTable("goal_reflections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Reflection Type
  reflectionType: pgEnum("reflection_type", [
    "weekly_review",
    "monthly_review",
    "achievement_reflection",
    "obstacle_reflection",
    "abandonment_reflection"
  ]).notNull(),
  
  // Reflection Questions
  whatWorked: text("what_worked"),
  whatDidntWork: text("what_didnt_work"),
  lessonsLearned: text("lessons_learned"),
  adjustmentsNeeded: text("adjustments_needed"),
  
  // Mood
  confidenceLevel: integer("confidence_level"), // 1-10
  motivationLevel: integer("motivation_level"), // 1-10
  
  reflectionDate: timestamp("reflection_date").defaultNow(),
});

export const goalPredictions = pgTable("goal_predictions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Prediction Type
  predictionType: pgEnum("prediction_type", [
    "success_probability", // Will you achieve this goal?
    "completion_date", // When will you achieve it?
    "obstacle_likelihood", // What obstacles will you face?
    "optimal_adjustment" // What should you change?
  ]).notNull(),
  
  // Prediction
  prediction: text("prediction"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // %
  
  // Contributing Factors
  factors: text("factors"), // JSON: what influences this prediction
  
  // Recommendation
  recommendation: text("recommendation"),
  
  // Validation
  actualOutcome: text("actual_outcome"),
  predictionAccurate: boolean("prediction_accurate"),
  
  createdAt: timestamp("created_at").defaultNow(),
  validatedAt: timestamp("validated_at"),
});

export const goalAnalytics = pgTable("goal_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Goal Type
  goalType: varchar("goal_type", { length: 100 }).notNull(),
  
  // Success Metrics
  avgAchievementRate: decimal("avg_achievement_rate", { precision: 5, scale: 2 }), // %
  avgTimeToCompletion: integer("avg_time_to_completion"), // days
  avgAbandonmentRate: decimal("avg_abandonment_rate", { precision: 5, scale: 2 }), // %
  
  // Optimal Parameters
  optimalDifficulty: integer("optimal_difficulty"), // 1-10
  optimalTimeframe: integer("optimal_timeframe"), // days
  optimalAccountabilityType: varchar("optimal_accountability_type", { length: 100 }),
  
  // Success Factors
  successFactors: text("success_factors"), // JSON: what predicts success
  failureFactors: text("failure_factors"), // JSON: what predicts failure
  
  // Sample Size
  userCount: integer("user_count"),
  totalGoals: integer("total_goals"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From habitFormationSchema.ts
export const habitProfiles = pgTable("habit_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current State
  totalActiveHabits: integer("total_active_habits").default(0),
  totalMasteredHabits: integer("total_mastered_habits").default(0),
  longestStreak: integer("longest_streak").default(0),
  
  // Preferences
  preferredHabitTime: pgEnum("preferred_habit_time", ["morning", "midday", "evening", "night", "flexible"]),
  
  // Self-Learning Data
  mostSuccessfulCues: text("most_successful_cues"), // JSON: which cues lead to habit completion
  optimalHabitStackSequence: text("optimal_habit_stack_sequence"), // JSON: best order for habits
  personalSuccessFactors: text("personal_success_factors"), // JSON: what makes habits stick for this user
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const habits = pgTable("habits", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Habit Details
  habitName: varchar("habit_name", { length: 255 }).notNull(),
  habitDescription: text("habit_description"),
  
  // Identity Connection (James Clear)
  identityStatement: varchar("identity_statement", { length: 255 }), // "I am a person who..."
  
  // Habit Type
  habitType: pgEnum("habit_type", [
    "build", // Building a new habit
    "break", // Breaking a bad habit
    "replace" // Replacing bad habit with good one
  ]).notNull(),
  
  // Category
  category: pgEnum("category", [
    "health",
    "fitness",
    "nutrition",
    "sleep",
    "mental_health",
    "relationships",
    "career",
    "finance",
    "learning",
    "spiritual",
    "productivity",
    "other"
  ]).notNull(),
  
  // Tiny Habits Method (BJ Fogg)
  tinyVersion: varchar("tiny_version", { length: 255 }), // Ridiculously small version
  fullVersion: varchar("full_version", { length: 255 }), // Full habit once established
  
  // Habit Loop (Charles Duhigg)
  cue: varchar("cue", { length: 255 }).notNull(), // What triggers the habit?
  cueType: pgEnum("cue_type", ["time", "location", "preceding_action", "emotional_state", "other_people"]),
  routine: varchar("routine", { length: 255 }).notNull(), // The habit itself
  reward: varchar("reward", { length: 255 }), // What you get from it
  
  // Habit Stacking (James Clear)
  anchorHabit: varchar("anchor_habit", { length: 255 }), // Existing habit to stack onto
  stackingFormula: varchar("stacking_formula", { length: 255 }), // "After [anchor], I will [new habit]"
  
  // Implementation Intention (Peter Gollwitzer)
  implementationIntention: varchar("implementation_intention", { length: 255 }), // "If [situation], then I will [action]"
  
  // Environment Design
  environmentChanges: text("environment_changes"), // JSON: how to make it obvious/easy
  
  // Frequency
  targetFrequency: pgEnum("target_frequency", [
    "daily",
    "weekdays",
    "weekends",
    "weekly",
    "custom"
  ]).notNull(),
  customFrequency: text("custom_frequency"), // JSON: specific days
  
  // Duration
  targetDuration: integer("target_duration"), // minutes (if applicable)
  
  // Difficulty
  difficulty: integer("difficulty"), // 1-10
  
  // Progress
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalCompletions: integer("total_completions").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // %
  
  // Automaticity (Wendy Wood)
  automaticityLevel: integer("automaticity_level"), // 1-10: How automatic is this habit?
  
  // Status
  status: pgEnum("status", ["active", "paused", "mastered", "abandoned"]).default("active"),
  
  // Dates
  startDate: timestamp("start_date").notNull(),
  masteredDate: timestamp("mastered_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const habitTracking = pgTable("habit_tracking", {
  id: varchar("id", { length: 255 }).primaryKey(),
  habitId: varchar("habit_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  trackingDate: timestamp("tracking_date").notNull(),
  
  // Completion
  completed: boolean("completed").notNull(),
  
  // Details
  duration: integer("duration"), // minutes (if applicable)
  intensity: integer("intensity"), // 1-10 (if applicable)
  
  // Context
  timeOfDay: varchar("time_of_day", { length: 50 }),
  location: varchar("location", { length: 255 }),
  
  // Cue Recognition
  cuePresent: boolean("cue_present"), // Was the cue there?
  cueEffectiveness: integer("cue_effectiveness"), // 1-10: How well did the cue work?
  
  // Resistance & Ease
  resistanceLevel: integer("resistance_level"), // 1-10: How hard was it to start?
  easeOfCompletion: integer("ease_of_completion"), // 1-10: How easy once started?
  
  // Reward
  rewardExperienced: boolean("reward_experienced"),
  rewardSatisfaction: integer("reward_satisfaction"), // 1-10
  
  // Automaticity
  feltAutomatic: boolean("felt_automatic"), // Did it feel automatic?
  
  // Mood & Energy
  moodBefore: varchar("mood_before", { length: 100 }),
  moodAfter: varchar("mood_after", { length: 100 }),
  energyBefore: integer("energy_before"), // 1-10
  energyAfter: integer("energy_after"), // 1-10
  
  // Notes
  notes: text("notes"),
  challenges: text("challenges"),
  wins: text("wins"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const languagePatterns = pgTable("language_patterns", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Pattern Type
  patternType: pgEnum("pattern_type", [
    "limiting_belief",
    "empowering_belief",
    "fixed_mindset",
    "growth_mindset",
    "victim_language",
    "ownership_language",
    "obligation_language", // "I have to"
    "choice_language" // "I choose to"
  ]).notNull(),
  
  // The Language
  originalStatement: text("original_statement"), // What you used to say
  reframedStatement: text("reframed_statement"), // New empowering version
  
  // Context
  context: varchar("context", { length: 255 }), // When does this come up?
  relatedHabit: varchar("related_habit_id", { length: 255 }), // Which habit is this about?
  
  // Belief Level
  beliefInOld: integer("belief_in_old"), // 1-10: How much do you still believe the old statement?
  beliefInNew: integer("belief_in_new"), // 1-10: How much do you believe the new statement?
  
  // Impact
  impactOnBehavior: integer("impact_on_behavior"), // 1-10
  
  // Status
  status: pgEnum("status", ["working_on", "integrated", "mastered"]).default("working_on"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const languagePatternPractice = pgTable("language_pattern_practice", {
  id: varchar("id", { length: 255 }).primaryKey(),
  patternId: varchar("pattern_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // What Happened
  situation: text("situation"), // When did the old pattern show up?
  
  // Caught Yourself?
  caughtOldPattern: boolean("caught_old_pattern"), // Did you notice yourself using limiting language?
  
  // Reframed?
  usedNewPattern: boolean("used_new_pattern"), // Did you use the empowering language?
  
  // Impact
  impactOnMood: integer("impact_on_mood"), // 1-10
  impactOnAction: integer("impact_on_action"), // 1-10
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitObstacles = pgTable("habit_obstacles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  habitId: varchar("habit_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Obstacle
  obstacleDescription: text("obstacle_description").notNull(),
  obstacleType: pgEnum("obstacle_type", [
    "time",
    "energy",
    "motivation",
    "environment",
    "other_people",
    "self_doubt",
    "competing_priority",
    "physical_limitation",
    "lack_of_skill"
  ]),
  
  // Frequency
  frequency: pgEnum("frequency", ["rare", "occasional", "frequent", "constant"]),
  
  // Solution (Implementation Intention)
  ifThenPlan: text("if_then_plan"), // "If [obstacle], then I will [solution]"
  
  // Effectiveness
  solutionEffectiveness: integer("solution_effectiveness"), // 1-10
  
  // Status
  resolved: boolean("resolved").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const habitMilestones = pgTable("habit_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  habitId: varchar("habit_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  milestoneType: pgEnum("milestone_type", [
    "first_completion",
    "streak_milestone", // 7, 30, 60, 90, 365 days
    "automaticity_achieved", // Habit feels automatic
    "identity_shift", // "I am" statement feels true
    "mastery" // Habit is fully integrated
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  achievedDate: timestamp("achieved_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitStacks = pgTable("habit_stacks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  stackName: varchar("stack_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // When
  timeOfDay: pgEnum("time_of_day", ["morning", "midday", "evening", "night"]),
  
  // Habits in Stack (ordered)
  habitSequence: text("habit_sequence"), // JSON array: ordered habit IDs
  
  // Total Duration
  estimatedDuration: integer("estimated_duration"), // minutes
  
  // Performance
  totalCompletions: integer("total_completions").default(0),
  currentStreak: integer("current_streak").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const weeklyHabitReviews = pgTable("weekly_habit_reviews", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  weekStartDate: timestamp("week_start_date").notNull(),
  
  // Overall Performance
  overallSuccessRate: decimal("overall_success_rate", { precision: 5, scale: 2 }),
  totalHabitsCompleted: integer("total_habits_completed"),
  
  // Wins
  biggestWins: text("biggest_wins"), // JSON array
  habitsGettingEasier: text("habits_getting_easier"), // JSON: habit IDs
  
  // Challenges
  biggestChallenges: text("biggest_challenges"), // JSON array
  habitsStrugglingWith: text("habits_struggling_with"), // JSON: habit IDs
  
  // Language Patterns
  limitingLanguageCaught: integer("limiting_language_caught"), // How many times caught yourself
  empoweringLanguageUsed: integer("empowering_language_used"), // How many times used new patterns
  
  // Insights
  keyInsights: text("key_insights"),
  lessonsLearned: text("lessons_learned"),
  
  // Next Week
  adjustmentsPlanned: text("adjustments_planned"), // JSON array
  newHabitsToStart: text("new_habits_to_start"), // JSON array
  habitsToModify: text("habits_to_modify"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitFormationAnalytics = pgTable("habit_formation_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Strategy Effectiveness (aggregated)
  strategy: varchar("strategy", { length: 100 }).notNull(), // tiny_habits, stacking, implementation_intention, etc.
  habitCategory: varchar("habit_category", { length: 100 }),
  
  // Success Metrics
  avgSuccessRate: decimal("avg_success_rate", { precision: 5, scale: 2 }),
  avgTimeToAutomaticity: integer("avg_time_to_automaticity"), // days
  avgStreakLength: integer("avg_streak_length"),
  
  // Optimal Parameters
  optimalCueType: varchar("optimal_cue_type", { length: 100 }),
  optimalTimeOfDay: varchar("optimal_time_of_day", { length: 50 }),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  habitCount: integer("habit_count"),
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From healthOptimizationSchema.ts
export const healthOptimizationProfiles = pgTable("health_optimization_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current Health Status
  overallHealth: integer("overall_health"), // 1-10 self-assessment
  
  // Age & Biological Age
  chronologicalAge: integer("chronological_age"),
  estimatedBiologicalAge: integer("estimated_biological_age"), // Based on biomarkers
  
  // Health Goals
  primaryGoal: pgEnum("primary_goal", [
    "longevity",
    "disease_prevention",
    "optimize_biomarkers",
    "increase_healthspan",
    "reverse_aging",
    "peak_performance",
    "disease_management"
  ]).notNull(),
  
  // Risk Factors
  familyHistory: text("family_history"), // JSON: diseases in family
  currentConditions: text("current_conditions"), // JSON array
  riskFactors: text("risk_factors"), // JSON: smoking, sedentary, etc.
  
  // Medications
  currentMedications: text("current_medications"), // JSON array
  
  // Lifestyle
  smokingStatus: pgEnum("smoking_status", ["never", "former", "current"]),
  alcoholConsumption: pgEnum("alcohol_consumption", ["none", "light", "moderate", "heavy"]),
  
  // Health Optimization Protocols
  activeProtocols: text("active_protocols"), // JSON: protocols currently following
  
  // Self-Learning Data
  mostEffectiveInterventions: text("most_effective_interventions"), // JSON
  biomarkerTrends: text("biomarker_trends"), // JSON: improving, stable, declining
  healthTrajectory: pgEnum("health_trajectory", ["improving", "stable", "declining"]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const biomarkers = pgTable("biomarkers", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  testDate: timestamp("test_date").notNull(),
  
  // Metabolic Health
  fastingGlucose: decimal("fasting_glucose", { precision: 5, scale: 2 }), // mg/dL
  hbA1c: decimal("hba1c", { precision: 4, scale: 2 }), // % (diabetes marker)
  fastingInsulin: decimal("fasting_insulin", { precision: 5, scale: 2 }), // μIU/mL
  homaIR: decimal("homa_ir", { precision: 5, scale: 2 }), // Insulin resistance
  
  // Lipid Panel
  totalCholesterol: integer("total_cholesterol"), // mg/dL
  ldlCholesterol: integer("ldl_cholesterol"), // mg/dL
  hdlCholesterol: integer("hdl_cholesterol"), // mg/dL
  triglycerides: integer("triglycerides"), // mg/dL
  apoB: integer("apo_b"), // mg/dL (best predictor of cardiovascular risk)
  lpA: integer("lp_a"), // mg/dL (genetic risk factor)
  
  // Inflammation
  hsCRP: decimal("hs_crp", { precision: 5, scale: 2 }), // mg/L (high-sensitivity C-reactive protein)
  
  // Liver Function
  alt: integer("alt"), // U/L
  ast: integer("ast"), // U/L
  ggt: integer("ggt"), // U/L
  
  // Kidney Function
  creatinine: decimal("creatinine", { precision: 4, scale: 2 }), // mg/dL
  eGFR: integer("egfr"), // mL/min/1.73m² (kidney filtration rate)
  bun: integer("bun"), // mg/dL
  
  // Thyroid
  tsh: decimal("tsh", { precision: 5, scale: 3 }), // mIU/L
  freeT3: decimal("free_t3", { precision: 4, scale: 2 }), // pg/mL
  freeT4: decimal("free_t4", { precision: 4, scale: 2 }), // ng/dL
  
  // Hormones
  testosterone: integer("testosterone"), // ng/dL
  estradiol: integer("estradiol"), // pg/mL
  cortisol: decimal("cortisol", { precision: 5, scale: 2 }), // μg/dL
  dhea: integer("dhea"), // μg/dL
  
  // Vitamins & Minerals
  vitaminD: decimal("vitamin_d", { precision: 5, scale: 2 }), // ng/mL
  vitaminB12: integer("vitamin_b12"), // pg/mL
  folate: decimal("folate", { precision: 5, scale: 2 }), // ng/mL
  iron: integer("iron"), // μg/dL
  ferritin: integer("ferritin"), // ng/mL
  magnesium: decimal("magnesium", { precision: 4, scale: 2 }), // mg/dL
  
  // Complete Blood Count
  wbc: decimal("wbc", { precision: 4, scale: 2 }), // K/μL (white blood cells)
  rbc: decimal("rbc", { precision: 4, scale: 2 }), // M/μL (red blood cells)
  hemoglobin: decimal("hemoglobin", { precision: 4, scale: 1 }), // g/dL
  hematocrit: decimal("hematocrit", { precision: 4, scale: 1 }), // %
  platelets: integer("platelets"), // K/μL
  
  // Advanced Longevity Markers
  homocysteine: decimal("homocysteine", { precision: 5, scale: 2 }), // μmol/L (cardiovascular & cognitive risk)
  uricAcid: decimal("uric_acid", { precision: 4, scale: 2 }), // mg/dL
  
  // Source
  testSource: varchar("test_source", { length: 255 }), // Lab name
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthProtocols = pgTable("health_protocols", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  protocolName: varchar("protocol_name", { length: 255 }).notNull(),
  
  // Protocol Type
  protocolType: pgEnum("protocol_type", [
    "supplement_stack",
    "dietary_intervention",
    "exercise_protocol",
    "sleep_optimization",
    "stress_management",
    "cold_exposure",
    "heat_exposure", // Sauna
    "fasting",
    "red_light_therapy",
    "breathwork",
    "other"
  ]).notNull(),
  
  // Details
  description: text("description"),
  protocol: text("protocol"), // Specific steps
  
  // Target
  targetBiomarker: varchar("target_biomarker", { length: 255 }), // What are you trying to improve?
  targetCondition: varchar("target_condition", { length: 255 }),
  
  // Duration
  startDate: timestamp("start_date"),
  plannedDuration: integer("planned_duration"), // days
  endDate: timestamp("end_date"),
  
  // Baseline
  baselineMeasurement: text("baseline_measurement"), // JSON: relevant biomarkers before
  
  // Results
  endMeasurement: text("end_measurement"), // JSON: biomarkers after
  
  // Effectiveness
  effectiveness: integer("effectiveness"), // 1-10
  sideEffects: text("side_effects"),
  
  // Decision
  willContinue: boolean("will_continue"),
  
  // Status
  status: pgEnum("status", ["active", "completed", "discontinued"]).default("active"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyHealthMetrics = pgTable("daily_health_metrics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  metricDate: timestamp("metric_date").notNull(),
  
  // Vitals
  restingHeartRate: integer("resting_heart_rate"), // bpm
  hrv: integer("hrv"), // ms (Heart Rate Variability - autonomic nervous system health)
  bloodPressureSystolic: integer("blood_pressure_systolic"), // mmHg
  bloodPressureDiastolic: integer("blood_pressure_diastolic"), // mmHg
  oxygenSaturation: integer("oxygen_saturation"), // % (SpO2)
  bodyTemperature: decimal("body_temperature", { precision: 4, scale: 2 }), // °C
  
  // Weight & Composition
  weight: decimal("weight", { precision: 5, scale: 2 }), // kg
  bodyFat: decimal("body_fat", { precision: 4, scale: 1 }), // %
  
  // Sleep
  sleepDuration: decimal("sleep_duration", { precision: 3, scale: 1 }), // hours
  sleepQuality: integer("sleep_quality"), // 1-10
  deepSleepMinutes: integer("deep_sleep_minutes"),
  remSleepMinutes: integer("rem_sleep_minutes"),
  
  // Energy & Performance
  energyLevel: integer("energy_level"), // 1-10
  mentalClarity: integer("mental_clarity"), // 1-10
  physicalPerformance: integer("physical_performance"), // 1-10
  
  // Stress & Recovery
  stressLevel: integer("stress_level"), // 1-10
  recoveryScore: integer("recovery_score"), // 1-10
  
  // Symptoms
  symptoms: text("symptoms"), // JSON array: headache, fatigue, pain, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const sleepSessions = pgTable("sleep_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sleepDate: timestamp("sleep_date").notNull(),
  
  // Duration
  bedTime: timestamp("bed_time"),
  wakeTime: timestamp("wake_time"),
  totalTimeInBed: integer("total_time_in_bed"), // minutes
  totalSleepTime: integer("total_sleep_time"), // minutes
  sleepEfficiency: integer("sleep_efficiency"), // % (sleep time / time in bed)
  
  // Sleep Stages
  awakeDuration: integer("awake_duration"), // minutes
  lightSleepDuration: integer("light_sleep_duration"), // minutes
  deepSleepDuration: integer("deep_sleep_duration"), // minutes
  remSleepDuration: integer("rem_sleep_duration"), // minutes
  
  // Quality
  sleepQuality: integer("sleep_quality"), // 1-10
  timesToWake: integer("times_to_wake"),
  timeToFallAsleep: integer("time_to_fall_asleep"), // minutes (sleep latency)
  
  // Factors
  caffeineAfter2pm: boolean("caffeine_after_2pm"),
  alcoholBeforeBed: boolean("alcohol_before_bed"),
  screenTimeBeforeBed: integer("screen_time_before_bed"), // minutes
  exerciseToday: boolean("exercise_today"),
  stressLevel: integer("stress_level"), // 1-10
  
  // Environment
  roomTemperature: integer("room_temperature"), // °C
  noiseLevel: pgEnum("noise_level", ["silent", "quiet", "moderate", "loud"]),
  lightLevel: pgEnum("light_level", ["dark", "dim", "moderate", "bright"]),
  
  // Morning Metrics
  morningEnergy: integer("morning_energy"), // 1-10
  morningMood: varchar("morning_mood", { length: 100 }),
  
  // Source
  dataSource: varchar("data_source", { length: 255 }), // Oura, Whoop, Apple Watch, manual, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const stressRecoveryLogs = pgTable("stress_recovery_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  logDate: timestamp("log_date").notNull(),
  
  // Stress Metrics
  perceivedStress: integer("perceived_stress"), // 1-10
  stressSources: text("stress_sources"), // JSON array
  
  // HRV (Heart Rate Variability - stress indicator)
  morningHRV: integer("morning_hrv"), // ms
  
  // Recovery Metrics
  recoveryScore: integer("recovery_score"), // 1-10
  restingHeartRate: integer("resting_heart_rate"), // bpm
  
  // Strain (if tracking like Whoop)
  dailyStrain: decimal("daily_strain", { precision: 4, scale: 1 }), // Cardiovascular load
  
  // Recovery Strategies Used
  recoveryStrategies: text("recovery_strategies"), // JSON: meditation, sauna, massage, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthScreenings = pgTable("health_screenings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  screeningDate: timestamp("screening_date").notNull(),
  
  // Screening Type
  screeningType: pgEnum("screening_type", [
    "blood_work",
    "DEXA_scan", // Body composition
    "VO2_max", // Cardio fitness
    "coronary_calcium_score", // Heart disease risk
    "colonoscopy",
    "mammogram",
    "skin_check",
    "eye_exam",
    "dental_checkup",
    "genetic_testing",
    "microbiome_test",
    "other"
  ]).notNull(),
  
  screeningName: varchar("screening_name", { length: 255 }),
  
  // Results
  results: text("results"), // JSON or text
  abnormalFindings: text("abnormal_findings"),
  
  // Follow-up
  followUpNeeded: boolean("follow_up_needed"),
  followUpDate: timestamp("follow_up_date"),
  
  // Provider
  provider: varchar("provider", { length: 255 }),
  
  // Files
  resultsFile: varchar("results_file", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const longevityPractices = pgTable("longevity_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // Practice Type (evidence-based longevity interventions)
  practiceType: pgEnum("practice_type", [
    "time_restricted_eating", // Intermittent fasting
    "caloric_restriction",
    "cold_exposure", // Cold showers, ice baths
    "heat_exposure", // Sauna
    "zone_2_cardio", // Low-intensity cardio for mitochondrial health
    "strength_training", // Muscle mass = longevity
    "VO2_max_training", // High-intensity intervals
    "red_light_therapy",
    "breathwork",
    "meditation",
    "social_connection",
    "purpose_work"
  ]).notNull(),
  
  // Details
  duration: integer("duration"), // minutes
  intensity: pgEnum("intensity", ["low", "moderate", "high"]),
  
  // Specific Metrics
  specificMetrics: text("specific_metrics"), // JSON: temperature, heart rate, etc.
  
  // How It Felt
  howItFelt: text("how_it_felt"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthMilestones = pgTable("health_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  milestoneType: pgEnum("milestone_type", [
    "biomarker_optimized",
    "disease_reversed",
    "medication_reduced",
    "biological_age_decreased",
    "fitness_milestone",
    "health_goal_achieved"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  achievedDate: timestamp("achieved_date"),
  
  // Significance
  significance: text("significance"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthOptimizationAnalytics = pgTable("health_optimization_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Intervention Effectiveness (aggregated)
  interventionType: varchar("intervention_type", { length: 100 }).notNull(),
  targetBiomarker: varchar("target_biomarker", { length: 100 }),
  
  // Effectiveness Metrics
  avgBiomarkerImprovement: decimal("avg_biomarker_improvement", { precision: 6, scale: 2 }), // % change
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // % of users who improved
  
  // Optimal Parameters
  optimalDuration: integer("optimal_duration"), // days
  optimalDosage: varchar("optimal_dosage", { length: 255 }),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different health profiles
  
  // Sample Size
  protocolCount: integer("protocol_count"),
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From identitySchema.ts
export const identityProfiles = pgTable("identityProfiles", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id),
  
  // Current identity markers
  currentIdentity: text("currentIdentity"), // JSON: ["disciplined", "resilient", etc.]
  targetIdentity: text("targetIdentity"), // JSON: ["unstoppable", "mission-driven", etc.]
  identityGaps: text("identityGaps"), // JSON: What's missing between current and target
  
  // Core values and mission
  coreValues: text("coreValues"), // JSON array
  lifeMission: text("lifeMission"),
  longTermVision: text("longTermVision"),
  
  // Identity reinforcement tracking
  identityWins: text("identityWins"), // JSON: Recent actions that reinforced identity
  identityContradictions: text("identityContradictions"), // JSON: Actions that contradicted identity
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type IdentityProfile = typeof identityProfiles.$inferSelect;
export type InsertIdentityProfile = typeof identityProfiles.$inferInsert;
export const dailyCheckins = pgTable("dailyCheckins", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id),
  checkinDate: timestamp("checkinDate").defaultNow().notNull(),
  
  // Physical health (minimal questions)
  sleptWell: pgEnum("sleptWell", ["yes", "no"]).notNull(),
  ateWell: pgEnum("ateWell", ["yes", "no"]).notNull(),
  movedBody: pgEnum("movedBody", ["yes", "no"]).notNull(),
  
  // Emotional state (single rating)
  emotionalState: integer("emotionalState").notNull(), // 1-10 scale
  
  // Discipline tracking
  followedPlan: pgEnum("followedPlan", ["yes", "no"]).notNull(),
  controlledImpulses: pgEnum("controlledImpulses", ["yes", "no"]).notNull(),
  
  // Identity reinforcement
  actedLikeTargetIdentity: pgEnum("actedLikeTargetIdentity", ["yes", "no"]).notNull(),
  
  // Optional notes (not required)
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type InsertDailyCheckin = typeof dailyCheckins.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;
export const habitCompletions = pgTable("habitCompletions", {
  id: serial("id").primaryKey(),
  habitId: integer("habitId").notNull().references(() => habits.id),
  completionDate: timestamp("completionDate").defaultNow().notNull(),
  completed: pgEnum("completed", ["yes", "no"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = typeof habitCompletions.$inferInsert;
export const disciplineEvents = pgTable("disciplineEvents", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id),
  eventDate: timestamp("eventDate").defaultNow().notNull(),
  
  // Event details
  eventType: pgEnum("eventType", ["impulse_controlled", "impulse_failed", "discipline_win", "discipline_fail"]).notNull(),
  situation: text("situation"), // What happened
  response: text("response"), // How they responded
  outcome: text("outcome"), // Result
  
  // Identity impact
  reinforcedIdentity: pgEnum("reinforcedIdentity", ["yes", "no"]).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DisciplineEvent = typeof disciplineEvents.$inferSelect;
export type InsertDisciplineEvent = typeof disciplineEvents.$inferInsert;
export const microHabits = pgTable("microHabits", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id),
  
  // Micro-habit definition (must be < 2 minutes)
  microHabitName: varchar("microHabitName", { length: 255 }).notNull(),
  trigger: varchar("trigger", { length: 255 }).notNull(), // "After I [existing habit]"
  action: varchar("action", { length: 255 }).notNull(), // "I will [micro-habit]"
  
  // Identity connection
  identityReinforcement: text("identityReinforcement"), // "This makes me [identity]"
  
  // Status
  isActive: pgEnum("isActive", ["true", "false"]).default("true").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MicroHabit = typeof microHabits.$inferSelect;
export type InsertMicroHabit = typeof microHabits.$inferInsert;

// From integrationsSchema.ts
export const integrationProfiles = pgTable("integration_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Integration Preferences
  autoSyncEnabled: boolean("auto_sync_enabled").default(true),
  syncFrequency: pgEnum("sync_frequency", ["realtime", "hourly", "daily", "manual"]).default("daily"),
  
  // Privacy
  dataSharing: pgEnum("data_sharing", ["minimal", "standard", "full"]).default("standard"),
  
  // Stats
  totalIntegrations: integer("total_integrations").default(0),
  activeIntegrations: integer("active_integrations").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const availableIntegrations = pgTable("available_integrations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Integration Details
  integrationName: varchar("integration_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Provider
  provider: varchar("provider", { length: 255 }).notNull(), // Oura, Whoop, etc.
  
  // Category
  category: pgEnum("category", [
    "wearable",
    "sleep_tracking",
    "fitness",
    "meditation",
    "productivity",
    "health",
    "nutrition",
    "mental_health",
    "finance",
    "communication",
    "other"
  ]).notNull(),
  
  // Authentication
  authType: pgEnum("auth_type", ["oauth2", "api_key", "webhook", "manual"]).notNull(),
  
  // Capabilities
  capabilities: text("capabilities"), // JSON: what data can be imported/exported
  
  // Data Types
  dataTypesSupported: text("data_types_supported"), // JSON: sleep, hrv, activity, etc.
  
  // Sync
  supportsRealtime: boolean("supports_realtime").default(false),
  supportsBidirectional: boolean("supports_bidirectional").default(false),
  
  // API Details
  apiEndpoint: varchar("api_endpoint", { length: 500 }),
  apiDocumentation: varchar("api_documentation", { length: 500 }),
  rateLimitPerHour: integer("rate_limit_per_hour"),
  
  // Status
  active: boolean("active").default(true),
  beta: boolean("beta").default(false),
  
  // Popularity
  totalUsers: integer("total_users").default(0),
  avgSatisfactionRating: decimal("avg_satisfaction_rating", { precision: 4, scale: 2 }), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userIntegrations = pgTable("user_integrations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  integrationId: varchar("integration_id", { length: 255 }).notNull(),
  
  // Connection Status
  status: pgEnum("status", [
    "connected",
    "disconnected",
    "error",
    "pending_auth",
    "expired"
  ]).default("pending_auth"),
  
  // Authentication
  accessToken: varchar("access_token", { length: 500 }), // Encrypted
  refreshToken: varchar("refresh_token", { length: 500 }), // Encrypted
  tokenExpiresAt: timestamp("token_expires_at"),
  
  // API Key (if applicable)
  apiKey: varchar("api_key", { length: 500 }), // Encrypted
  
  // Sync Settings
  syncEnabled: boolean("sync_enabled").default(true),
  syncFrequency: pgEnum("sync_frequency", ["realtime", "hourly", "daily", "manual"]).default("daily"),
  lastSyncAt: timestamp("last_sync_at"),
  nextSyncAt: timestamp("next_sync_at"),
  
  // Data Filters
  dataTypesToSync: text("data_types_to_sync"), // JSON: which data types to import
  
  // Stats
  totalSyncs: integer("total_syncs").default(0),
  totalRecordsImported: integer("total_records_imported").default(0),
  totalRecordsExported: integer("total_records_exported").default(0),
  
  // Errors
  lastError: text("last_error"),
  errorCount: integer("error_count").default(0),
  
  // User Satisfaction
  satisfactionRating: integer("satisfaction_rating"), // 1-10
  
  connectedAt: timestamp("connected_at").defaultNow(),
  disconnectedAt: timestamp("disconnected_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const syncLogs = pgTable("sync_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userIntegrationId: varchar("user_integration_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Sync Details
  syncType: pgEnum("sync_type", ["import", "export", "bidirectional"]).notNull(),
  
  // Status
  status: pgEnum("status", ["started", "in_progress", "completed", "failed"]).default("started"),
  
  // Data
  recordsProcessed: integer("records_processed").default(0),
  recordsSuccessful: integer("records_successful").default(0),
  recordsFailed: integer("records_failed").default(0),
  
  // Duration
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  durationSeconds: integer("duration_seconds"),
  
  // Errors
  errorMessage: text("error_message"),
  errorDetails: text("error_details"), // JSON: detailed error info
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const importedData = pgTable("imported_data", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userIntegrationId: varchar("user_integration_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Data Type
  dataType: pgEnum("data_type", [
    "sleep",
    "hrv",
    "heart_rate",
    "activity",
    "steps",
    "calories",
    "workout",
    "nutrition",
    "weight",
    "mood",
    "meditation",
    "task",
    "calendar_event",
    "transaction",
    "other"
  ]).notNull(),
  
  // Source
  sourceId: varchar("source_id", { length: 255 }), // ID in source system
  
  // Data
  dataPayload: text("data_payload"), // JSON: the actual data
  
  // Timestamp
  dataTimestamp: timestamp("data_timestamp").notNull(), // When did this data occur?
  
  // Mapping
  mappedToId: varchar("mapped_to_id", { length: 255 }), // ID in our system (sleep log, workout, etc.)
  mappedToType: varchar("mapped_to_type", { length: 100 }), // Which table?
  
  // Quality
  dataQuality: pgEnum("data_quality", ["high", "medium", "low"]),
  validationErrors: text("validation_errors"), // JSON: any validation issues
  
  importedAt: timestamp("imported_at").defaultNow(),
});

export const exportedData = pgTable("exported_data", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userIntegrationId: varchar("user_integration_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Data Type
  dataType: varchar("data_type", { length: 100 }).notNull(),
  
  // Source (in our system)
  sourceId: varchar("source_id", { length: 255 }).notNull(),
  sourceType: varchar("source_type", { length: 100 }).notNull(),
  
  // Data
  dataPayload: text("data_payload"), // JSON: the data we sent
  
  // Destination
  destinationId: varchar("destination_id", { length: 255 }), // ID in destination system
  
  // Status
  status: pgEnum("status", ["pending", "sent", "confirmed", "failed"]).default("pending"),
  
  // Error
  errorMessage: text("error_message"),
  
  exportedAt: timestamp("exported_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const webhooks = pgTable("webhooks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userIntegrationId: varchar("user_integration_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Webhook Details
  webhookUrl: varchar("webhook_url", { length: 500 }).notNull(),
  webhookSecret: varchar("webhook_secret", { length: 255 }), // For verification
  
  // Events
  eventTypes: text("event_types"), // JSON: which events to listen for
  
  // Status
  active: boolean("active").default(true),
  
  // Stats
  totalReceived: integer("total_received").default(0),
  lastReceivedAt: timestamp("last_received_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  webhookId: varchar("webhook_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Event Details
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventPayload: text("event_payload"), // JSON: the webhook payload
  
  // Processing
  processed: boolean("processed").default(false),
  processedAt: timestamp("processed_at"),
  
  // Error
  processingError: text("processing_error"),
  
  receivedAt: timestamp("received_at").defaultNow(),
});

export const apiRateLimits = pgTable("api_rate_limits", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userIntegrationId: varchar("user_integration_id", { length: 255 }).notNull(),
  
  // Rate Limit Details
  requestsPerHour: integer("requests_per_hour"),
  requestsPerDay: integer("requests_per_day"),
  
  // Current Usage
  requestsThisHour: integer("requests_this_hour").default(0),
  requestsToday: integer("requests_today").default(0),
  
  // Reset Times
  hourResetAt: timestamp("hour_reset_at"),
  dayResetAt: timestamp("day_reset_at"),
  
  // Throttling
  throttled: boolean("throttled").default(false),
  throttledUntil: timestamp("throttled_until"),
  
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataMappingRules = pgTable("data_mapping_rules", {
  id: varchar("id", { length: 255 }).primaryKey(),
  integrationId: varchar("integration_id", { length: 255 }).notNull(),
  
  // Source Field
  sourceField: varchar("source_field", { length: 255 }).notNull(),
  sourceDataType: varchar("source_data_type", { length: 100 }),
  
  // Destination Field
  destinationTable: varchar("destination_table", { length: 255 }).notNull(),
  destinationField: varchar("destination_field", { length: 255 }).notNull(),
  
  // Transformation
  transformationRule: text("transformation_rule"), // JSON: how to transform the data
  
  // Validation
  validationRule: text("validation_rule"), // JSON: how to validate the data
  
  // Required
  required: boolean("required").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const integrationAnalytics = pgTable("integration_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  integrationId: varchar("integration_id", { length: 255 }).notNull(),
  
  // Usage Stats
  totalUsers: integer("total_users").default(0),
  activeUsers: integer("active_users").default(0),
  
  // Sync Stats
  avgSyncsPerDay: decimal("avg_syncs_per_day", { precision: 6, scale: 2 }),
  avgRecordsPerSync: decimal("avg_records_per_sync", { precision: 8, scale: 2 }),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // %
  
  // Data Quality
  avgDataQuality: decimal("avg_data_quality", { precision: 4, scale: 2 }), // 1-10
  
  // User Satisfaction
  avgSatisfactionRating: decimal("avg_satisfaction_rating", { precision: 4, scale: 2 }), // 1-10
  
  // Value
  avgBehaviorImpact: decimal("avg_behavior_impact", { precision: 5, scale: 2 }), // % improvement
  
  // Optimal Parameters
  optimalSyncFrequency: varchar("optimal_sync_frequency", { length: 100 }),
  
  // Issues
  commonErrors: text("common_errors"), // JSON: most frequent errors
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const integrationRecommendations = pgTable("integration_recommendations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  integrationId: varchar("integration_id", { length: 255 }).notNull(),
  
  // Recommendation Reason
  reason: text("reason"), // Why is this integration recommended?
  
  // Potential Value
  potentialValue: text("potential_value"), // What could user gain?
  
  // Confidence
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // %
  
  // Status
  status: pgEnum("status", ["pending", "accepted", "declined", "deferred"]).default("pending"),
  
  // User Response
  userFeedback: text("user_feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const exportRequests = pgTable("export_requests", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Export Type
  exportType: pgEnum("export_type", [
    "full_data_export", // All user data
    "module_export", // Specific module data
    "date_range_export", // Data from date range
    "custom_export" // Custom query
  ]).notNull(),
  
  // Format
  exportFormat: pgEnum("export_format", ["json", "csv", "pdf", "xlsx"]).notNull(),
  
  // Filters
  filters: text("filters"), // JSON: what to include
  
  // Status
  status: pgEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  
  // File
  filePath: varchar("file_path", { length: 500 }),
  fileSize: integer("file_size"), // bytes
  
  // Download
  downloadUrl: varchar("download_url", { length: 500 }),
  expiresAt: timestamp("expires_at"), // Download link expiry
  
  // Error
  errorMessage: text("error_message"),
  
  requestedAt: timestamp("requested_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});


// From journalSchema.ts
export const journalProfiles = pgTable("journal_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Journaling Stats
  totalEntries: integer("total_entries").default(0),
  currentStreak: integer("current_streak").default(0), // Days
  longestStreak: integer("longest_streak").default(0),
  
  // Preferences
  preferredJournalType: pgEnum("preferred_journal_type", [
    "free_form",
    "gratitude",
    "reflective",
    "expressive",
    "goal_focused",
    "mixed"
  ]),
  
  preferredTime: pgEnum("preferred_time", ["morning", "afternoon", "evening", "night", "flexible"]),
  
  // Privacy
  defaultPrivacy: pgEnum("default_privacy", ["private", "shared_with_coach", "shared_with_community"]).default("private"),
  
  // AI Features
  enableAIInsights: boolean("enable_ai_insights").default(true),
  enableEmotionDetection: boolean("enable_emotion_detection").default(true),
  enablePatternRecognition: boolean("enable_pattern_recognition").default(true),
  
  // Self-Learning Data
  mostBeneficialPrompts: text("most_beneficial_prompts"), // JSON: which prompts led to insights
  emotionalPatterns: text("emotional_patterns"), // JSON: recurring themes
  growthAreas: text("growth_areas"), // JSON: areas of development
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


export const journalPrompts = pgTable("journal_prompts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Prompt Details
  promptText: text("prompt_text").notNull(),
  description: text("description"),
  
  // Category
  category: pgEnum("category", [
    "gratitude",
    "reflection",
    "goal_setting",
    "emotional_processing",
    "relationships",
    "career",
    "health",
    "personal_growth",
    "creativity",
    "spirituality",
    "crisis_support"
  ]).notNull(),
  
  // Research-Backed
  researchBacked: boolean("research_backed").default(false),
  researchSource: text("research_source"), // Citation
  
  // When to Use
  bestFor: text("best_for"), // JSON: situations, emotions, goals
  
  // Difficulty
  difficulty: pgEnum("difficulty", ["beginner", "intermediate", "advanced"]),
  
  // Effectiveness
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  totalUses: integer("total_uses").default(0),
  
  // Active
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gratitudeEntries = pgTable("gratitude_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  journalEntryId: varchar("journal_entry_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Three Good Things (Seligman's exercise)
  goodThing1: text("good_thing_1").notNull(),
  whyItHappened1: text("why_it_happened_1"), // Causal attribution
  
  goodThing2: text("good_thing_2"),
  whyItHappened2: text("why_it_happened_2"),
  
  goodThing3: text("good_thing_3"),
  whyItHappened3: text("why_it_happened_3"),
  
  // Overall Gratitude Level
  gratitudeLevel: integer("gratitude_level"), // 1-10
  
  entryDate: timestamp("entry_date").defaultNow(),
});

export const bestPossibleSelfEntries = pgTable("best_possible_self_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  journalEntryId: varchar("journal_entry_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Timeframe
  timeframe: pgEnum("timeframe", ["1_year", "5_years", "10_years", "end_of_life"]).notNull(),
  
  // Life Areas
  personalLife: text("personal_life"), // What does your personal life look like?
  relationships: text("relationships"), // Who are you with?
  career: text("career"), // What are you doing professionally?
  health: text("health"), // How is your health?
  contributions: text("contributions"), // What impact are you making?
  
  // Identity
  whoYouAre: text("who_you_are"), // Who have you become?
  
  // Emotions
  howYouFeel: text("how_you_feel"), // How does this future self feel?
  
  entryDate: timestamp("entry_date").defaultNow(),
});

export const dailyReviews = pgTable("daily_reviews", {
  id: varchar("id", { length: 255 }).primaryKey(),
  journalEntryId: varchar("journal_entry_id", { length: 255 }),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  reviewDate: timestamp("review_date").notNull(),
  
  // What Went Well
  wentWell: text("went_well"),
  whyItWentWell: text("why_it_went_well"),
  
  // What Didn't Go Well
  didntGoWell: text("didnt_go_well"),
  whyItDidntGoWell: text("why_it_didnt_go_well"),
  
  // Lessons Learned
  lessonsLearned: text("lessons_learned"),
  
  // Tomorrow's Focus
  tomorrowFocus: text("tomorrow_focus"),
  
  // Overall Day Rating
  dayRating: integer("day_rating"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const emotionalPatterns = pgTable("emotional_patterns", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Pattern Type
  patternType: pgEnum("pattern_type", [
    "recurring_emotion", // Same emotion keeps appearing
    "trigger_pattern", // Specific triggers → specific emotions
    "time_pattern", // Emotions vary by time of day/week
    "context_pattern", // Emotions vary by context (work, home, etc.)
    "cycle_pattern" // Emotional cycles
  ]).notNull(),
  
  // Pattern Details
  patternName: varchar("pattern_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Frequency
  occurrenceCount: integer("occurrence_count").default(0),
  firstDetected: timestamp("first_detected"),
  lastDetected: timestamp("last_detected"),
  
  // Associated Data
  associatedEmotions: text("associated_emotions"), // JSON
  associatedTriggers: text("associated_triggers"), // JSON
  associatedContexts: text("associated_contexts"), // JSON
  
  // Insight
  insight: text("insight"), // What does this pattern mean?
  actionable: boolean("actionable").default(false),
  suggestedAction: text("suggested_action"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const journalInsights = pgTable("journal_insights", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Insight Type
  insightType: pgEnum("insight_type", [
    "emotional_trend", // Your emotions are improving/declining
    "growth_detected", // You're making progress in X area
    "pattern_identified", // Recurring theme detected
    "cognitive_distortion", // You're engaging in X thinking pattern
    "strength_recognized", // You demonstrated X strength
    "value_clarified", // X seems important to you
    "goal_alignment" // Your entries align/misalign with your goals
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Supporting Evidence
  supportingEntries: text("supporting_entries"), // JSON: entry IDs that support this insight
  
  // Actionability
  actionable: boolean("actionable").default(false),
  suggestedAction: text("suggested_action"),
  
  // User Response
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewed_at"),
  helpful: boolean("helpful"), // User feedback
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const writingStreaks = pgTable("writing_streaks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Streak Details
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  
  // Length
  streakLength: integer("streak_length"), // Days
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalReflections = pgTable("journal_reflections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Reflection Period
  periodType: pgEnum("period_type", ["weekly", "monthly", "quarterly", "yearly"]).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Reflection Content
  overallThemes: text("overall_themes"), // What themes emerged?
  emotionalJourney: text("emotional_journey"), // How did emotions evolve?
  growthAreas: text("growth_areas"), // Where did you grow?
  challengeAreas: text("challenge_areas"), // Where did you struggle?
  surprises: text("surprises"), // What surprised you?
  gratitudes: text("gratitudes"), // What are you grateful for?
  
  // Forward Looking
  intentionsForward: text("intentions_forward"), // What do you want to focus on next?
  
  reflectionDate: timestamp("reflection_date").defaultNow(),
});

export const promptEffectiveness = pgTable("prompt_effectiveness", {
  id: varchar("id", { length: 255 }).primaryKey(),
  promptId: varchar("prompt_id", { length: 255 }).notNull(),
  
  // Usage Stats
  totalUses: integer("total_uses").default(0),
  
  // Effectiveness Metrics
  avgWordCount: decimal("avg_word_count", { precision: 8, scale: 2 }),
  avgWritingDuration: decimal("avg_writing_duration", { precision: 6, scale: 2 }), // minutes
  avgMoodImprovement: decimal("avg_mood_improvement", { precision: 4, scale: 2 }), // change in mood
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  
  // Insight Generation
  avgInsightsGenerated: decimal("avg_insights_generated", { precision: 4, scale: 2 }),
  
  // Best For
  mostEffectiveForEmotions: text("most_effective_for_emotions"), // JSON
  mostEffectiveForSituations: text("most_effective_for_situations"), // JSON
  
  // Sample Size
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const journalAnalytics = pgTable("journal_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Entry Type
  entryType: varchar("entry_type", { length: 100 }).notNull(),
  
  // Effectiveness Metrics
  avgMoodImprovement: decimal("avg_mood_improvement", { precision: 4, scale: 2 }),
  avgInsightsGenerated: decimal("avg_insights_generated", { precision: 4, scale: 2 }),
  avgBehaviorChange: decimal("avg_behavior_change", { precision: 5, scale: 2 }), // % who took action
  
  // Optimal Parameters
  optimalWordCount: integer("optimal_word_count"),
  optimalDuration: integer("optimal_duration"), // minutes
  optimalTimeOfDay: varchar("optimal_time_of_day", { length: 100 }),
  
  // Best For
  mostEffectiveFor: text("most_effective_for"), // JSON: user types, situations
  
  // Sample Size
  userCount: integer("user_count"),
  totalEntries: integer("total_entries"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From memoryMasterySchema.ts
export const memoryMasteryProfiles = pgTable("memory_mastery_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current Memory Assessment
  selfAssessedMemory: integer("self_assessed_memory"), // 1-10
  
  // Goals
  primaryGoal: pgEnum("primary_goal", [
    "improve_retention",
    "learn_faster",
    "remember_names",
    "study_efficiency",
    "professional_knowledge",
    "language_learning",
    "prevent_decline",
    "peak_performance"
  ]).notNull(),
  
  // Preferred Techniques
  preferredTechniques: text("preferred_techniques"), // JSON array
  
  // Learning Style
  learningStyle: pgEnum("learning_style", ["visual", "auditory", "kinesthetic", "reading_writing", "mixed"]),
  
  // Practice Schedule
  dailyReviewTime: varchar("daily_review_time", { length: 10 }), // HH:MM
  weeklyGoalMinutes: integer("weekly_goal_minutes"),
  
  // Self-Learning Data
  optimalReviewTime: varchar("optimal_review_time", { length: 100 }), // When retention is highest
  personalForgettingCurve: text("personal_forgetting_curve"), // JSON: decay rate over time
  mostEffectiveTechniques: text("most_effective_techniques"), // JSON: ranked by retention
  optimalReviewIntervals: text("optimal_review_intervals"), // JSON: personalized spaced repetition schedule
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const memoryItems = pgTable("memory_items", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Content
  itemType: pgEnum("item_type", [
    "fact",
    "concept",
    "name_face",
    "vocabulary", // Foreign language
    "number",
    "date",
    "formula",
    "procedure", // How to do something
    "quote",
    "list",
    "other"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"), // What to remember
  
  // Context
  category: varchar("category", { length: 255 }), // Work, personal, study, etc.
  tags: text("tags"), // JSON array
  
  // Encoding Technique Used
  encodingTechnique: pgEnum("encoding_technique", [
    "rote_repetition",
    "spaced_repetition",
    "memory_palace",
    "chunking",
    "elaboration", // Connect to existing knowledge
    "dual_coding", // Visual + verbal
    "mnemonic",
    "story",
    "acronym",
    "rhyme",
    "visualization"
  ]),
  
  // Memory Palace Location (if using method of loci)
  palaceLocation: varchar("palace_location", { length: 255 }),
  
  // Visual/Mnemonic
  visualImage: text("visual_image"), // Description of mental image
  mnemonicDevice: text("mnemonic_device"),
  
  // Connections
  relatedItems: text("related_items"), // JSON: IDs of related memory items
  existingKnowledge: text("existing_knowledge"), // What you already know that this connects to
  
  // Importance
  importance: integer("importance"), // 1-10
  
  // Spaced Repetition Data
  easeFactor: decimal("ease_factor", { precision: 4, scale: 2 }).default("2.5"), // SuperMemo algorithm
  interval: integer("interval").default(1), // Days until next review
  repetitions: integer("repetitions").default(0),
  nextReviewDate: timestamp("next_review_date"),
  
  // Performance
  totalReviews: integer("total_reviews").default(0),
  successfulRecalls: integer("successful_recalls").default(0),
  retentionRate: decimal("retention_rate", { precision: 5, scale: 2 }), // %
  
  // Status
  mastered: boolean("mastered").default(false),
  masteredDate: timestamp("mastered_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const memoryReviews = pgTable("memory_reviews", {
  id: varchar("id", { length: 255 }).primaryKey(),
  itemId: varchar("item_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  reviewDate: timestamp("review_date").notNull(),
  
  // Review Type
  reviewType: pgEnum("review_type", [
    "scheduled", // Spaced repetition
    "cramming", // Last-minute review
    "reinforcement", // Extra practice
    "test" // Self-testing
  ]).notNull(),
  
  // Performance
  recalled: boolean("recalled").notNull(), // Did you remember it?
  recallSpeed: pgEnum("recall_speed", ["instant", "quick", "slow", "failed"]),
  confidence: integer("confidence"), // 1-10: How confident in your recall?
  
  // Difficulty Rating (for spaced repetition algorithm)
  difficultyRating: pgEnum("difficulty_rating", [
    "again", // Didn't remember (0)
    "hard", // Remembered with difficulty (3)
    "good", // Remembered (4)
    "easy" // Remembered easily (5)
  ]).notNull(),
  
  // Time
  timeToRecall: integer("time_to_recall"), // seconds
  
  // Context
  reviewContext: varchar("review_context", { length: 255 }), // Where/when reviewed
  distractions: boolean("distractions"),
  
  // Next Review Scheduled
  nextInterval: integer("next_interval"), // days
  nextReviewDate: timestamp("next_review_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const memoryPalaces = pgTable("memory_palaces", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  palaceName: varchar("palace_name", { length: 255 }).notNull(),
  description: text("description"), // What place is this? (your home, a route, etc.)
  
  // Locations within palace
  locations: text("locations"), // JSON array: ordered list of locations
  
  // Usage
  purpose: varchar("purpose", { length: 255 }), // What is this palace for?
  
  // Items Stored
  itemCount: integer("item_count").default(0),
  
  // Effectiveness
  avgRecallRate: decimal("avg_recall_rate", { precision: 5, scale: 2 }),
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const learningSessions = pgTable("learning_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sessionDate: timestamp("session_date").notNull(),
  
  // Session Details
  topic: varchar("topic", { length: 255 }).notNull(),
  sessionType: pgEnum("session_type", [
    "new_learning", // Learning new material
    "review", // Reviewing old material
    "practice", // Active practice
    "testing" // Self-testing
  ]).notNull(),
  
  // Duration
  duration: integer("duration"), // minutes
  
  // Techniques Used
  techniquesUsed: text("techniques_used"), // JSON array
  
  // Materials
  materialsStudied: text("materials_studied"), // JSON array
  newItemsCreated: integer("new_items_created"),
  itemsReviewed: integer("items_reviewed"),
  
  // Performance
  focusLevel: integer("focus_level"), // 1-10
  comprehensionLevel: integer("comprehension_level"), // 1-10
  retentionConfidence: integer("retention_confidence"), // 1-10
  
  // Environment
  location: varchar("location", { length: 255 }),
  distractions: text("distractions"), // JSON array
  
  // State
  energyBefore: integer("energy_before"), // 1-10
  energyAfter: integer("energy_after"), // 1-10
  
  // Notes
  notes: text("notes"),
  insights: text("insights"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const memoryTechniquePractice = pgTable("memory_technique_practice", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // Technique
  technique: pgEnum("technique", [
    "memory_palace",
    "chunking",
    "peg_system",
    "major_system", // Number memory
    "link_method", // Linking items in a story
    "acronym",
    "visualization",
    "dual_coding",
    "elaboration",
    "active_recall"
  ]).notNull(),
  
  // Practice Details
  practiceType: varchar("practice_type", { length: 255 }), // What were you practicing?
  duration: integer("duration"), // minutes
  
  // Performance
  itemsAttempted: integer("items_attempted"),
  itemsRecalled: integer("items_recalled"),
  accuracyRate: decimal("accuracy_rate", { precision: 5, scale: 2 }), // %
  
  // Difficulty
  difficulty: integer("difficulty"), // 1-10
  
  // Improvement
  improvementFromLast: decimal("improvement_from_last", { precision: 6, scale: 2 }), // % change
  
  // Notes
  notes: text("notes"),
  challengesFaced: text("challenges_faced"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const memoryChallenges = pgTable("memory_challenges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  challengeName: varchar("challenge_name", { length: 255 }).notNull(),
  
  // Challenge Type
  challengeType: pgEnum("challenge_type", [
    "number_memorization", // Memorize long numbers
    "name_recall", // Remember names
    "card_memorization", // Deck of cards
    "word_list", // List of words
    "dates_events", // Historical dates
    "vocabulary", // Foreign language
    "custom"
  ]).notNull(),
  
  // Challenge Details
  itemCount: integer("item_count"), // How many items to memorize
  timeLimit: integer("time_limit"), // seconds
  
  // Performance
  itemsRecalled: integer("items_recalled"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // %
  timeUsed: integer("time_used"), // seconds
  
  // Score
  score: integer("score"),
  personalBest: boolean("personal_best"),
  
  attemptDate: timestamp("attempt_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const memoryMilestones = pgTable("memory_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  milestoneType: pgEnum("milestone_type", [
    "items_mastered", // Mastered X items
    "retention_rate", // Achieved X% retention
    "streak", // X day streak
    "technique_mastered", // Mastered a technique
    "challenge_completed", // Completed a challenge
    "palace_created", // Built a memory palace
    "personal_record"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  achievedDate: timestamp("achieved_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const sleepMemoryTracking = pgTable("sleep_memory_tracking", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  trackingDate: timestamp("tracking_date").notNull(),
  
  // Learning Before Sleep
  studiedBeforeSleep: boolean("studied_before_sleep"),
  studyTopics: text("study_topics"), // JSON array
  studyDuration: integer("study_duration"), // minutes
  
  // Sleep Quality
  sleepQuality: integer("sleep_quality"), // 1-10
  sleepDuration: decimal("sleep_duration", { precision: 3, scale: 1 }), // hours
  deepSleepMinutes: integer("deep_sleep_minutes"),
  
  // Morning Recall
  morningRecallTest: boolean("morning_recall_test"),
  morningRecallAccuracy: decimal("morning_recall_accuracy", { precision: 5, scale: 2 }), // %
  
  // Consolidation Effect
  consolidationEffect: decimal("consolidation_effect", { precision: 6, scale: 2 }), // % improvement from sleep
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const memoryMasteryAnalytics = pgTable("memory_mastery_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Technique Effectiveness (aggregated)
  technique: varchar("technique", { length: 100 }).notNull(),
  itemType: varchar("item_type", { length: 100 }),
  
  // Effectiveness Metrics
  avgRetentionRate: decimal("avg_retention_rate", { precision: 5, scale: 2 }), // %
  avgRecallSpeed: decimal("avg_recall_speed", { precision: 6, scale: 2 }), // seconds
  
  // Optimal Parameters
  optimalReviewInterval: integer("optimal_review_interval"), // days
  optimalSessionDuration: integer("optimal_session_duration"), // minutes
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different learning styles
  
  // Sample Size
  reviewCount: integer("review_count"),
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nameFaceMemory = pgTable("name_face_memory", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Person Details
  personName: varchar("person_name", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  
  // Face Photo
  facePhoto: varchar("face_photo", { length: 255 }),
  
  // Harry LorayneTechnique: Outstanding Feature
  outstandingFeature: text("outstanding_feature"), // Most memorable facial feature
  
  // Harry LorayneTechnique: Name Association
  nameAssociation: text("name_association"), // Mental image/story for the name
  substituteWord: varchar("substitute_word", { length: 255 }), // If name is abstract
  
  // Harry LorayneTechnique: Link Feature to Name
  mentalLink: text("mental_link"), // Absurd image linking feature to name
  
  // Context
  whereMet: varchar("where_met", { length: 255 }),
  whenMet: timestamp("when_met"),
  relationship: varchar("relationship", { length: 255 }), // Colleague, friend, client, etc.
  
  // Additional Info (helps with recall)
  occupation: varchar("occupation", { length: 255 }),
  interests: text("interests"), // JSON array
  mutualConnections: text("mutual_connections"), // JSON array
  conversationTopics: text("conversation_topics"), // What you talked about
  
  // Memory Performance
  totalEncounters: integer("total_encounters").default(1),
  successfulRecalls: integer("successful_recalls").default(0),
  lastEncounter: timestamp("last_encounter"),
  
  // Importance
  importance: integer("importance"), // 1-10
  
  // Status
  mastered: boolean("mastered").default(false), // Can recall instantly
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nameRecallPractice = pgTable("name_recall_practice", {
  id: varchar("id", { length: 255 }).primaryKey(),
  nameFaceId: varchar("name_face_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // Practice Type
  practiceType: pgEnum("practice_type", [
    "face_to_name", // See face, recall name
    "name_to_face", // Hear name, visualize face
    "feature_identification", // Identify outstanding feature
    "association_review" // Review mental associations
  ]).notNull(),
  
  // Performance
  recalled: boolean("recalled"),
  recallSpeed: pgEnum("recall_speed", ["instant", "quick", "slow", "failed"]),
  confidence: integer("confidence"), // 1-10
  
  // Time
  timeToRecall: integer("time_to_recall"), // seconds
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const numberMemory = pgTable("number_memory", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Number to Remember
  number: varchar("number", { length: 255 }).notNull(),
  numberType: pgEnum("number_type", [
    "phone",
    "pin",
    "date",
    "address",
    "credit_card",
    "id_number",
    "mathematical_constant",
    "other"
  ]).notNull(),
  
  label: varchar("label", { length: 255 }), // What is this number?
  
  // Harry Lorayne Phonetic System
  phoneticWords: text("phonetic_words"), // Words that encode the number
  visualStory: text("visual_story"), // Story using the phonetic words
  
  // Alternative: Chunking
  chunks: text("chunks"), // JSON array: break into memorable chunks
  
  // Performance
  totalRecalls: integer("total_recalls").default(0),
  successfulRecalls: integer("successful_recalls").default(0),
  
  // Status
  mastered: boolean("mastered").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From mentalEngineSchema.ts
export const mentalProfiles = pgTable("mental_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current Mental State
  mentalClarity: integer("mental_clarity"), // 1-10 baseline
  focusAbility: integer("focus_ability"), // 1-10
  memoryQuality: integer("memory_quality"), // 1-10
  cognitiveEnergy: integer("cognitive_energy"), // 1-10
  
  // Challenges
  primaryChallenges: text("primary_challenges"), // JSON: brain_fog, poor_focus, memory_issues, overwhelm, etc.
  
  // Goals
  primaryGoal: pgEnum("primary_goal", [
    "improve_focus",
    "enhance_memory",
    "increase_clarity",
    "learn_faster",
    "reduce_brain_fog",
    "boost_creativity",
    "improve_decision_making",
    "mental_performance"
  ]).notNull(),
  
  // Learning Style (evidence-based)
  learningStyle: text("learning_style"), // JSON: visual, auditory, kinesthetic, reading/writing
  bestLearningTime: varchar("best_learning_time", { length: 50 }), // morning, afternoon, evening
  
  // Current Habits
  sleepQuality: integer("sleep_quality"), // 1-10 (affects cognition)
  exerciseFrequency: pgEnum("exercise_frequency", ["none", "1-2x_week", "3-4x_week", "5+x_week"]),
  screenTimeHours: integer("screen_time_hours"), // daily
  
  // Medications/Supplements affecting cognition
  cognitiveSupplements: text("cognitive_supplements"), // JSON array
  medications: text("medications"), // JSON array
  
  // Self-Learning Data
  peakFocusHours: text("peak_focus_hours"), // JSON: hours of day when focus is best
  optimalWorkDuration: integer("optimal_work_duration"), // minutes before break needed
  mostEffectiveTechniques: text("most_effective_techniques"), // JSON: techniques that work for this user
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const focusSessions = pgTable("focus_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sessionDate: timestamp("session_date").notNull(),
  
  // Session Details
  sessionType: pgEnum("session_type", [
    "deep_work", // Cal Newport
    "pomodoro", // 25/5 technique
    "flow_session", // Extended focus
    "time_blocking",
    "focused_learning",
    "creative_work",
    "problem_solving"
  ]).notNull(),
  
  task: varchar("task", { length: 255 }).notNull(),
  taskType: pgEnum("task_type", ["learning", "creating", "analyzing", "writing", "coding", "planning"]),
  
  // Duration
  plannedDuration: integer("planned_duration"), // minutes
  actualDuration: integer("actual_duration"), // minutes
  
  // Environment
  location: varchar("location", { length: 255 }),
  noiseLevel: pgEnum("noise_level", ["silent", "quiet", "moderate", "noisy"]),
  usedNoiseBlocking: boolean("used_noise_blocking"), // Headphones, white noise, etc.
  
  // Pre-Session State
  energyBefore: integer("energy_before"), // 1-10
  focusBefore: integer("focus_before"), // 1-10
  stressBefore: integer("stress_before"), // 1-10
  
  // Session Quality
  focusQuality: integer("focus_quality"), // 1-10
  flowState: boolean("flow_state"), // Did you achieve flow?
  distractionCount: integer("distraction_count"),
  distractionTypes: text("distraction_types"), // JSON: phone, people, thoughts, etc.
  
  // Post-Session State
  energyAfter: integer("energy_after"), // 1-10
  focusAfter: integer("focus_after"), // 1-10
  satisfactionLevel: integer("satisfaction_level"), // 1-10 with output
  
  // Output
  productivityRating: integer("productivity_rating"), // 1-10
  outputQuality: integer("output_quality"), // 1-10
  
  // What Worked / Didn't Work
  whatHelped: text("what_helped"), // JSON array
  whatHindered: text("what_hindered"), // JSON array
  
  // Self-Learning Data
  effectiveness: integer("effectiveness"), // Calculated score
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const memoryPractices = pgTable("memory_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // Practice Type (evidence-based memory techniques)
  practiceType: pgEnum("practice_type", [
    "spaced_repetition", // Anki, flashcards
    "memory_palace", // Method of loci
    "chunking", // Breaking info into chunks
    "mnemonics", // Memory aids
    "visualization", // Mental imagery
    "association", // Linking new to known
    "active_recall", // Testing yourself
    "elaboration", // Explaining in your own words
    "interleaving" // Mixing topics
  ]).notNull(),
  
  // What You're Memorizing
  contentType: pgEnum("content_type", ["facts", "concepts", "skills", "names", "numbers", "language", "other"]),
  topic: varchar("topic", { length: 255 }),
  
  // Practice Details
  duration: integer("duration"), // minutes
  itemsReviewed: integer("items_reviewed"),
  itemsRecalled: integer("items_recalled"),
  
  // Performance
  recallAccuracy: integer("recall_accuracy"), // 0-100%
  confidenceLevel: integer("confidence_level"), // 1-10
  
  // Difficulty
  difficulty: pgEnum("difficulty", ["easy", "moderate", "hard"]),
  
  // Next Review (spaced repetition)
  nextReviewDate: timestamp("next_review_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});


export const cognitivePerformance = pgTable("cognitive_performance", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  assessmentDate: timestamp("assessment_date").notNull(),
  
  // Daily Cognitive Metrics
  mentalClarity: integer("mental_clarity"), // 1-10
  focusAbility: integer("focus_ability"), // 1-10
  memorySharpness: integer("memory_sharpness"), // 1-10
  processingSpeed: integer("processing_speed"), // 1-10 (how quickly can you think?)
  decisionQuality: integer("decision_quality"), // 1-10
  creativity: integer("creativity"), // 1-10
  
  // Brain Fog
  brainFog: integer("brain_fog"), // 1-10 (higher = worse)
  mentalFatigue: integer("mental_fatigue"), // 1-10
  
  // Contributing Factors
  sleepQuality: integer("sleep_quality"), // 1-10
  sleepHours: decimal("sleep_hours", { precision: 3, scale: 1 }),
  exerciseToday: boolean("exercise_today"),
  stressLevel: integer("stress_level"), // 1-10
  hydration: pgEnum("hydration", ["poor", "moderate", "good"]),
  nutrition: pgEnum("nutrition", ["poor", "moderate", "good"]),
  
  // Substances
  caffeineIntake: integer("caffeine_intake"), // mg
  alcoholYesterday: boolean("alcohol_yesterday"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const brainTrainingExercises = pgTable("brain_training_exercises", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  exerciseDate: timestamp("exercise_date").notNull(),
  
  // Exercise Type
  exerciseType: pgEnum("exercise_type", [
    "working_memory", // N-back tasks
    "attention", // Focus exercises
    "processing_speed", // Reaction time
    "cognitive_flexibility", // Task switching
    "problem_solving", // Puzzles
    "pattern_recognition",
    "spatial_reasoning",
    "verbal_fluency"
  ]).notNull(),
  
  exerciseName: varchar("exercise_name", { length: 255 }),
  
  // Performance
  score: integer("score"),
  accuracy: integer("accuracy"), // 0-100%
  speed: integer("speed"), // milliseconds or custom metric
  
  // Difficulty
  difficultyLevel: integer("difficulty_level"), // 1-10
  
  // Duration
  duration: integer("duration"), // minutes
  
  // Progress
  personalBest: boolean("personal_best"),
  improvementFromLast: integer("improvement_from_last"), // percentage
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const readingSessions = pgTable("reading_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sessionDate: timestamp("session_date").notNull(),
  
  // What You Read
  contentType: pgEnum("content_type", ["book", "article", "research_paper", "documentation", "news"]),
  title: varchar("title", { length: 255 }),
  author: varchar("author", { length: 255 }),
  
  // Reading Details
  pagesRead: integer("pages_read"),
  duration: integer("duration"), // minutes
  
  // Reading Speed
  wordsPerMinute: integer("words_per_minute"),
  
  // Comprehension
  comprehensionLevel: integer("comprehension_level"), // 1-10
  retentionLevel: integer("retention_level"), // 1-10 (how much will you remember?)
  
  // Techniques Used
  activeReading: boolean("active_reading"), // Highlighting, notes, questions
  speedReading: boolean("speed_reading"),
  skimming: boolean("skimming"),
  
  // Output
  notesTaken: boolean("notes_taken"),
  summaryWritten: boolean("summary_written"),
  
  // Value
  valueRating: integer("value_rating"), // 1-10 (how valuable was this?)
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentalBreaks = pgTable("mental_breaks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  breakDate: timestamp("break_date").notNull(),
  
  // Break Type
  breakType: pgEnum("break_type", [
    "micro_break", // 1-5 min
    "short_break", // 5-15 min
    "long_break", // 15-30 min
    "walk_break",
    "meditation_break",
    "nap", // Power nap
    "nature_break",
    "social_break"
  ]).notNull(),
  
  duration: integer("duration"), // minutes
  
  // Activity
  activity: varchar("activity", { length: 255 }),
  
  // State Before/After
  mentalFatigueBefore: integer("mental_fatigue_before"), // 1-10
  mentalFatigueAfter: integer("mental_fatigue_after"), // 1-10
  
  // Effectiveness
  restorationLevel: integer("restoration_level"), // 1-10 (how restored do you feel?)
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentalEngineAnalytics = pgTable("mental_engine_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Focus Patterns (aggregated)
  techniqueType: varchar("technique_type", { length: 100 }).notNull(),
  
  // Effectiveness Metrics
  avgFocusImprovement: decimal("avg_focus_improvement", { precision: 5, scale: 2 }),
  avgProductivityScore: decimal("avg_productivity_score", { precision: 5, scale: 2 }),
  avgFlowStateRate: decimal("avg_flow_state_rate", { precision: 5, scale: 2 }), // % of sessions achieving flow
  
  // Optimal Parameters
  optimalDuration: integer("optimal_duration"), // minutes
  optimalTimeOfDay: varchar("optimal_time_of_day", { length: 50 }),
  optimalBreakFrequency: integer("optimal_break_frequency"), // minutes between breaks
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  sessionCount: integer("session_count"),
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From mentalHealthSchema.ts
export const mentalHealthProfiles = pgTable("mental_health_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Diagnosis & History
  primaryDiagnosis: varchar("primary_diagnosis", { length: 255 }),
  secondaryDiagnoses: text("secondary_diagnoses"), // JSON array
  diagnosisDate: timestamp("diagnosis_date"),
  treatmentHistory: text("treatment_history"), // JSON array of past treatments
  
  // Current Status
  currentSeverity: pgEnum("current_severity", ["mild", "moderate", "severe", "crisis"]),
  inTreatment: boolean("in_treatment").default(false),
  medicationList: text("medication_list"), // JSON array
  therapyType: varchar("therapy_type", { length: 255 }), // CBT, DBT, EMDR, etc.
  
  // Risk Assessment
  suicidalIdeation: boolean("suicidal_ideation").default(false),
  selfHarmRisk: pgEnum("self_harm_risk", ["none", "low", "moderate", "high"]),
  crisisContactInfo: text("crisis_contact_info"), // JSON
  
  // Goals & Progress
  recoveryGoals: text("recovery_goals"), // JSON array
  currentPhase: pgEnum("current_phase", ["crisis_stabilization", "active_treatment", "maintenance", "recovery"]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moodLogs = pgTable("mood_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  logDate: timestamp("log_date").notNull(),
  
  // Mood Ratings (1-10 scale, evidence-based)
  overallMood: integer("overall_mood"), // 1=worst, 10=best
  anxiety: integer("anxiety"), // 1=none, 10=severe
  depression: integer("depression"),
  irritability: integer("irritability"),
  energy: integer("energy"),
  sleep_quality: integer("sleep_quality"),
  
  // Symptom Checklist (based on DSM-5 criteria)
  symptoms: text("symptoms"), // JSON array: ["racing_thoughts", "loss_of_interest", etc.]
  
  // Behavioral Markers
  selfCareCompleted: boolean("self_care_completed"),
  socialInteraction: boolean("social_interaction"),
  physicalActivity: boolean("physical_activity"),
  substanceUse: boolean("substance_use"),
  
  // Triggers & Coping
  triggers: text("triggers"), // JSON array
  copingStrategiesUsed: text("coping_strategies_used"), // JSON array
  copingEffectiveness: integer("coping_effectiveness"), // 1-10
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const thoughtRecords = pgTable("thought_records", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  recordDate: timestamp("record_date").notNull(),
  
  // Situation
  situation: text("situation").notNull(),
  
  // Automatic Thoughts
  automaticThought: text("automatic_thought").notNull(),
  emotionsBefore: text("emotions_before"), // JSON: [{emotion: "anxiety", intensity: 8}]
  
  // Evidence & Analysis
  evidenceFor: text("evidence_for"),
  evidenceAgainst: text("evidence_against"),
  cognitiveDistortions: text("cognitive_distortions"), // JSON array: ["catastrophizing", "black_and_white", etc.]
  
  // Balanced Thought
  balancedThought: text("balanced_thought"),
  emotionsAfter: text("emotions_after"), // JSON: [{emotion: "anxiety", intensity: 4}]
  
  // Outcome
  behavioralResponse: text("behavioral_response"),
  effectiveness: integer("effectiveness"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});


export const safetyPlans = pgTable("safety_plans", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Warning Signs
  warningSigns: text("warning_signs"), // JSON array
  
  // Coping Strategies (ordered by escalation)
  internalCopingStrategies: text("internal_coping_strategies"), // JSON array
  socialDistractions: text("social_distractions"), // JSON array
  
  // Support Contacts
  supportContacts: text("support_contacts"), // JSON: [{name, phone, relationship}]
  professionalContacts: text("professional_contacts"), // JSON: [{name, phone, role}]
  
  // Crisis Resources
  crisisHotlines: text("crisis_hotlines"), // JSON array
  emergencyServices: text("emergency_services"), // JSON
  
  // Environment Safety
  meansRestriction: text("means_restriction"), // Steps taken to reduce access to lethal means
  
  // Reasons for Living
  reasonsForLiving: text("reasons_for_living"), // JSON array
  
  lastReviewed: timestamp("last_reviewed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recoveryMilestones = pgTable("recovery_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  milestoneType: pgEnum("milestone_type", [
    "symptom_free_days",
    "therapy_completion",
    "medication_stabilization",
    "return_to_work",
    "social_reconnection",
    "self_care_consistency",
    "crisis_management",
    "skill_mastery"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetDate: timestamp("target_date"),
  achievedDate: timestamp("achieved_date"),
  
  progress: integer("progress"), // 0-100%
  status: pgEnum("status", ["not_started", "in_progress", "achieved", "on_hold"]),
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From notificationsSchema.ts
export const notificationProfiles = pgTable("notification_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Global Settings
  notificationsEnabled: boolean("notifications_enabled").default(true),
  
  // Quiet Hours
  quietHoursEnabled: boolean("quiet_hours_enabled").default(true),
  quietHoursStart: varchar("quiet_hours_start", { length: 10 }), // "22:00"
  quietHoursEnd: varchar("quiet_hours_end", { length: 10 }), // "08:00"
  
  // Channel Preferences
  emailEnabled: boolean("email_enabled").default(true),
  pushEnabled: boolean("push_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  inAppEnabled: boolean("in_app_enabled").default(true),
  
  // Batching
  batchingEnabled: boolean("batching_enabled").default(true),
  batchingWindow: integer("batching_window").default(60), // minutes
  
  // Frequency
  maxNotificationsPerDay: integer("max_notifications_per_day").default(10),
  
  // Self-Learning Data
  optimalTimes: text("optimal_times"), // JSON: best times to send notifications
  effectiveChannels: text("effective_channels"), // JSON: which channels drive action
  notificationFatigueRisk: integer("notification_fatigue_risk"), // 0-100
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Notification Type
  notificationType: pgEnum("notification_type", [
    "habit_reminder",
    "goal_reminder",
    "task_reminder",
    "encouragement",
    "celebration",
    "insight",
    "alert",
    "social",
    "system"
  ]).notNull(),
  
  // Enabled
  enabled: boolean("enabled").default(true),
  
  // Channels
  emailEnabled: boolean("email_enabled").default(true),
  pushEnabled: boolean("push_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  inAppEnabled: boolean("in_app_enabled").default(true),
  
  // Frequency
  frequency: pgEnum("frequency", ["realtime", "daily_digest", "weekly_digest", "never"]).default("realtime"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Notification Details
  notificationType: pgEnum("notification_type", [
    "habit_reminder",
    "goal_reminder",
    "task_reminder",
    "encouragement",
    "celebration",
    "insight",
    "alert",
    "social",
    "system"
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  
  // Action
  actionUrl: varchar("action_url", { length: 500 }), // Where to go when clicked
  actionText: varchar("action_text", { length: 100 }), // Button text
  
  // Priority
  priority: pgEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Delivery
  channels: text("channels"), // JSON: which channels to use
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for"),
  
  // Status
  status: pgEnum("status", [
    "pending",
    "scheduled",
    "sent",
    "delivered",
    "failed",
    "cancelled"
  ]).default("pending"),
  
  // Delivery Tracking
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  
  // User Interaction
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewed_at"),
  clicked: boolean("clicked").default(false),
  clickedAt: timestamp("clicked_at"),
  dismissed: boolean("dismissed").default(false),
  dismissedAt: timestamp("dismissed_at"),
  
  // Effectiveness
  actionTaken: boolean("action_taken").default(false), // Did user do what notification suggested?
  
  // Related Entity
  relatedId: varchar("related_id", { length: 255 }),
  relatedType: varchar("related_type", { length: 100 }),
  
  // Batching
  batchId: varchar("batch_id", { length: 255 }), // If part of a batch
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Reminder Details
  reminderType: pgEnum("reminder_type", [
    "habit",
    "goal",
    "task",
    "medication",
    "appointment",
    "custom"
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Related Entity
  relatedId: varchar("related_id", { length: 255 }),
  relatedType: varchar("related_type", { length: 100 }),
  
  // Schedule
  scheduleType: pgEnum("schedule_type", [
    "once", // One-time reminder
    "daily", // Every day
    "weekly", // Specific days of week
    "monthly", // Specific day of month
    "custom" // Custom recurrence
  ]).notNull(),
  
  // Timing
  reminderTime: varchar("reminder_time", { length: 10 }), // "14:30"
  daysOfWeek: text("days_of_week"), // JSON: [1,3,5] for Mon, Wed, Fri
  dayOfMonth: integer("day_of_month"), // 1-31
  
  // Custom Recurrence
  customRecurrence: text("custom_recurrence"), // JSON: complex recurrence rules
  
  // Lead Time
  leadTimeMinutes: integer("lead_time_minutes"), // Remind X minutes before
  
  // Snooze
  snoozeEnabled: boolean("snooze_enabled").default(true),
  snoozeDurationMinutes: integer("snooze_duration_minutes").default(10),
  
  // Status
  active: boolean("active").default(true),
  
  // Next Occurrence
  nextOccurrence: timestamp("next_occurrence"),
  
  // Stats
  totalSent: integer("total_sent").default(0),
  totalCompleted: integer("total_completed").default(0),
  totalSnoozed: integer("total_snoozed").default(0),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // %
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reminderOccurrences = pgTable("reminder_occurrences", {
  id: varchar("id", { length: 255 }).primaryKey(),
  reminderId: varchar("reminder_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Occurrence Details
  scheduledFor: timestamp("scheduled_for").notNull(),
  
  // Status
  status: pgEnum("status", [
    "pending",
    "sent",
    "completed",
    "snoozed",
    "missed",
    "cancelled"
  ]).default("pending"),
  
  // Snooze
  snoozedUntil: timestamp("snoozed_until"),
  snoozeCount: integer("snooze_count").default(0),
  
  // Completion
  completedAt: timestamp("completed_at"),
  
  // Notification
  notificationId: varchar("notification_id", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationBatches = pgTable("notification_batches", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Batch Details
  batchType: pgEnum("batch_type", ["daily_digest", "weekly_digest", "smart_batch"]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  
  // Notifications
  notificationCount: integer("notification_count").default(0),
  
  // Delivery
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  
  // Status
  status: pgEnum("status", ["pending", "sent", "failed"]).default("pending"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const pushTokens = pgTable("push_tokens", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Token Details
  token: varchar("token", { length: 500 }).notNull(),
  platform: pgEnum("platform", ["ios", "android", "web"]).notNull(),
  
  // Device Info
  deviceId: varchar("device_id", { length: 255 }),
  deviceName: varchar("device_name", { length: 255 }),
  
  // Status
  active: boolean("active").default(true),
  
  // Last Used
  lastUsedAt: timestamp("last_used_at"),
  
  registeredAt: timestamp("registered_at").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailQueue = pgTable("email_queue", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  notificationId: varchar("notification_id", { length: 255 }),
  
  // Email Details
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  bodyHtml: text("body_html"),
  
  // Priority
  priority: pgEnum("priority", ["low", "medium", "high"]).default("medium"),
  
  // Status
  status: pgEnum("status", ["pending", "sending", "sent", "failed"]).default("pending"),
  
  // Delivery
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  
  // Tracking
  opened: boolean("opened").default(false),
  openedAt: timestamp("opened_at"),
  clicked: boolean("clicked").default(false),
  clickedAt: timestamp("clicked_at"),
  
  // Error
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const smsQueue = pgTable("sms_queue", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  notificationId: varchar("notification_id", { length: 255 }),
  
  // SMS Details
  toPhone: varchar("to_phone", { length: 50 }).notNull(),
  message: text("message").notNull(),
  
  // Status
  status: pgEnum("status", ["pending", "sending", "sent", "failed"]).default("pending"),
  
  // Delivery
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  
  // Error
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationAnalytics = pgTable("notification_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Notification Type
  notificationType: varchar("notification_type", { length: 100 }).notNull(),
  
  // Engagement Metrics
  avgViewRate: decimal("avg_view_rate", { precision: 5, scale: 2 }), // %
  avgClickRate: decimal("avg_click_rate", { precision: 5, scale: 2 }), // %
  avgActionRate: decimal("avg_action_rate", { precision: 5, scale: 2 }), // %
  avgDismissRate: decimal("avg_dismiss_rate", { precision: 5, scale: 2 }), // %
  
  // Timing
  optimalTimeOfDay: varchar("optimal_time_of_day", { length: 100 }), // "14:00-15:00"
  optimalDayOfWeek: varchar("optimal_day_of_week", { length: 100 }), // "Tuesday"
  
  // Channel Effectiveness
  bestChannel: varchar("best_channel", { length: 100 }),
  channelPerformance: text("channel_performance"), // JSON: performance by channel
  
  // Behavioral Impact
  avgBehaviorChange: decimal("avg_behavior_change", { precision: 5, scale: 2 }), // %
  
  // Fatigue
  fatigueThreshold: integer("fatigue_threshold"), // Max per day before fatigue
  
  // Sample Size
  userCount: integer("user_count"),
  totalSent: integer("total_sent"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userNotificationFeedback = pgTable("user_notification_feedback", {
  id: varchar("id", { length: 255 }).primaryKey(),
  notificationId: varchar("notification_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Feedback Type
  feedbackType: pgEnum("feedback_type", [
    "helpful",
    "not_helpful",
    "too_frequent",
    "wrong_time",
    "irrelevant",
    "perfect"
  ]).notNull(),
  
  // Details
  feedbackText: text("feedback_text"),
  
  createdAt: timestamp("created_at").defaultNow(),
});


// From nutritionEngineSchema.ts
export const nutritionProfiles = pgTable("nutrition_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current State
  currentWeight: decimal("current_weight", { precision: 5, scale: 2 }), // kg
  targetWeight: decimal("target_weight", { precision: 5, scale: 2 }), // kg
  height: integer("height"), // cm
  
  // Goals
  primaryGoal: pgEnum("primary_goal", [
    "lose_fat",
    "build_muscle",
    "maintain_weight",
    "improve_health",
    "increase_energy",
    "gut_health",
    "athletic_performance",
    "disease_management"
  ]).notNull(),
  
  // Dietary Approach
  dietaryApproach: pgEnum("dietary_approach", [
    "balanced",
    "low_carb",
    "keto",
    "paleo",
    "vegan",
    "vegetarian",
    "mediterranean",
    "intermittent_fasting",
    "carnivore",
    "whole30",
    "flexible_dieting"
  ]),
  
  // Restrictions & Allergies
  allergies: text("allergies"), // JSON array
  intolerances: text("intolerances"), // JSON: lactose, gluten, etc.
  restrictions: text("restrictions"), // JSON: religious, ethical, etc.
  
  // Health Conditions
  healthConditions: text("health_conditions"), // JSON: diabetes, IBS, PCOS, etc.
  medications: text("medications"), // JSON array
  
  // Targets (calculated or custom)
  targetCalories: integer("target_calories"),
  targetProtein: integer("target_protein"), // grams
  targetCarbs: integer("target_carbs"), // grams
  targetFat: integer("target_fat"), // grams
  targetFiber: integer("target_fiber"), // grams
  
  // Eating Patterns
  mealsPerDay: integer("meals_per_day"),
  fastingWindow: integer("fasting_window"), // hours (if IF)
  eatingWindow: integer("eating_window"), // hours
  
  // Self-Learning Data
  optimalMacroRatio: text("optimal_macro_ratio"), // JSON: {protein: 30, carbs: 40, fat: 30}
  energyOptimalFoods: text("energy_optimal_foods"), // JSON: foods that boost energy
  triggerFoods: text("trigger_foods"), // JSON: foods that cause issues
  bestMealTiming: text("best_meal_timing"), // JSON: when to eat for best performance
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const meals = pgTable("meals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  mealDate: timestamp("meal_date").notNull(),
  
  // Meal Type
  mealType: pgEnum("meal_type", [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "pre_workout",
    "post_workout"
  ]).notNull(),
  
  // Foods
  foods: text("foods"), // JSON array: [{name, quantity, unit, calories, protein, carbs, fat}]
  
  // Macros (calculated from foods)
  totalCalories: integer("total_calories"),
  totalProtein: decimal("total_protein", { precision: 5, scale: 1 }), // grams
  totalCarbs: decimal("total_carbs", { precision: 5, scale: 1 }), // grams
  totalFat: decimal("total_fat", { precision: 5, scale: 1 }), // grams
  totalFiber: decimal("total_fiber", { precision: 5, scale: 1 }), // grams
  totalSugar: decimal("total_sugar", { precision: 5, scale: 1 }), // grams
  
  // Context
  location: varchar("location", { length: 255 }), // Home, restaurant, work, etc.
  socialContext: pgEnum("social_context", ["alone", "family", "friends", "work"]),
  
  // Eating Behavior
  eatingSpeed: pgEnum("eating_speed", ["slow", "moderate", "fast"]),
  mindfulEating: boolean("mindful_eating"), // Were you present while eating?
  distractions: text("distractions"), // JSON: TV, phone, work, etc.
  
  // Hunger & Satisfaction
  hungerBefore: integer("hunger_before"), // 1-10
  hungerAfter: integer("hunger_after"), // 1-10
  satisfactionLevel: integer("satisfaction_level"), // 1-10
  
  // Emotional State
  emotionBefore: varchar("emotion_before", { length: 100 }),
  emotionalEating: boolean("emotional_eating"), // Was this emotion-driven?
  
  // Post-Meal Effects (tracked later)
  energyAfter: integer("energy_after"), // 1-10 (30-60 min post-meal)
  digestionQuality: integer("digestion_quality"), // 1-10
  bloating: integer("bloating"), // 1-10
  
  // Photos
  mealPhoto: varchar("meal_photo", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyNutritionSummary = pgTable("daily_nutrition_summary", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  summaryDate: timestamp("summary_date").notNull(),
  
  // Total Macros
  totalCalories: integer("total_calories"),
  totalProtein: decimal("total_protein", { precision: 6, scale: 1 }),
  totalCarbs: decimal("total_carbs", { precision: 6, scale: 1 }),
  totalFat: decimal("total_fat", { precision: 6, scale: 1 }),
  totalFiber: decimal("total_fiber", { precision: 5, scale: 1 }),
  
  // Hydration
  waterIntake: decimal("water_intake", { precision: 4, scale: 1 }), // liters
  
  // Adherence
  calorieAdherence: integer("calorie_adherence"), // % of target
  proteinAdherence: integer("protein_adherence"), // % of target
  
  // Quality
  vegetableServings: integer("vegetable_servings"),
  fruitServings: integer("fruit_servings"),
  processedFoodServings: integer("processed_food_servings"),
  
  // Overall Ratings
  nutritionQuality: integer("nutrition_quality"), // 1-10
  adherenceRating: integer("adherence_rating"), // 1-10
  
  // Energy & Performance
  avgEnergyLevel: integer("avg_energy_level"), // 1-10
  sleepQuality: integer("sleep_quality"), // 1-10 (that night)
  workoutPerformance: integer("workout_performance"), // 1-10 (if workout that day)
  
  // Digestive Health
  bowelMovements: integer("bowel_movements"),
  digestiveComfort: integer("digestive_comfort"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const supplements = pgTable("supplements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Supplement Details
  supplementName: varchar("supplement_name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  
  // Purpose
  purpose: pgEnum("purpose", [
    "vitamin_mineral", // General health
    "protein", // Muscle building
    "performance", // Pre-workout, creatine, etc.
    "recovery", // Post-workout, sleep
    "gut_health", // Probiotics, fiber
    "cognitive", // Nootropics
    "immune", // Vitamin C, zinc, etc.
    "joint_health",
    "other"
  ]).notNull(),
  
  // Dosage
  dosage: varchar("dosage", { length: 255 }),
  unit: varchar("unit", { length: 50 }),
  frequency: pgEnum("frequency", ["daily", "twice_daily", "as_needed", "weekly"]),
  
  // Timing
  timing: pgEnum("timing", ["morning", "afternoon", "evening", "with_meal", "before_bed", "pre_workout", "post_workout"]),
  
  // Active
  active: boolean("active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Effectiveness (self-learning)
  perceivedEffectiveness: integer("perceived_effectiveness"), // 1-10
  sideEffects: text("side_effects"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supplementLogs = pgTable("supplement_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  supplementId: varchar("supplement_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  logDate: timestamp("log_date").notNull(),
  
  taken: boolean("taken").default(true),
  dosage: varchar("dosage", { length: 255 }),
  
  // Context
  timing: varchar("timing", { length: 100 }),
  withFood: boolean("with_food"),
  
  // Effects
  perceivedEffect: integer("perceived_effect"), // 1-10
  sideEffects: text("side_effects"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const foodReactions = pgTable("food_reactions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  reactionDate: timestamp("reaction_date").notNull(),
  
  // Food
  suspectedFood: varchar("suspected_food", { length: 255 }).notNull(),
  
  // Reaction Type
  reactionType: pgEnum("reaction_type", [
    "digestive", // Bloating, gas, diarrhea, constipation
    "skin", // Rash, hives, eczema
    "respiratory", // Congestion, asthma
    "energy", // Fatigue, brain fog
    "mood", // Anxiety, irritability
    "headache",
    "other"
  ]).notNull(),
  
  // Symptoms
  symptoms: text("symptoms"), // JSON array
  severity: pgEnum("severity", ["mild", "moderate", "severe"]),
  
  // Timing
  onsetTime: integer("onset_time"), // minutes after eating
  duration: integer("duration"), // hours
  
  // Pattern
  consistentReaction: boolean("consistent_reaction"), // Does this food always cause this?
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const hydrationLogs = pgTable("hydration_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  logDate: timestamp("log_date").notNull(),
  
  // Intake
  waterIntake: decimal("water_intake", { precision: 4, scale: 2 }), // liters
  
  // Other Beverages
  coffee: integer("coffee"), // cups
  tea: integer("tea"), // cups
  alcohol: integer("alcohol"), // standard drinks
  
  // Hydration Status
  urineColor: pgEnum("urine_color", ["clear", "pale_yellow", "yellow", "dark_yellow", "amber"]), // Hydration indicator
  
  // Symptoms
  headache: boolean("headache"),
  fatigue: boolean("fatigue"),
  dryMouth: boolean("dry_mouth"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const mealPlans = pgTable("meal_plans", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  planName: varchar("plan_name", { length: 255 }).notNull(),
  
  // Duration
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Meals
  meals: text("meals"), // JSON: {monday: {breakfast: [], lunch: [], dinner: []}, ...}
  
  // Shopping List
  shoppingList: text("shopping_list"), // JSON array
  
  // Prep Notes
  prepNotes: text("prep_notes"),
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nutritionExperiments = pgTable("nutrition_experiments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  experimentName: varchar("experiment_name", { length: 255 }).notNull(),
  
  // Type
  experimentType: pgEnum("experiment_type", [
    "elimination_diet", // Remove suspected trigger foods
    "macro_cycling", // Vary macros by day
    "meal_timing", // Change when you eat
    "supplement_trial", // Test a new supplement
    "food_introduction", // Reintroduce eliminated food
    "calorie_cycling", // Vary calories by day
    "other"
  ]).notNull(),
  
  // Hypothesis
  hypothesis: text("hypothesis"), // What do you expect to happen?
  
  // Duration
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Protocol
  protocol: text("protocol"), // What exactly are you doing?
  
  // Baseline Metrics
  baselineWeight: decimal("baseline_weight", { precision: 5, scale: 2 }),
  baselineEnergy: integer("baseline_energy"), // 1-10
  baselineDigestion: integer("baseline_digestion"), // 1-10
  
  // Results
  endWeight: decimal("end_weight", { precision: 5, scale: 2 }),
  endEnergy: integer("end_energy"), // 1-10
  endDigestion: integer("end_digestion"), // 1-10
  
  // Findings
  findings: text("findings"),
  conclusion: text("conclusion"),
  
  // Decision
  willContinue: boolean("will_continue"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nutritionEngineAnalytics = pgTable("nutrition_engine_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Food-Effect Correlations (aggregated)
  foodCategory: varchar("food_category", { length: 100 }).notNull(),
  
  // Energy Correlation
  avgEnergyImpact: decimal("avg_energy_impact", { precision: 5, scale: 2 }), // Change in energy level
  
  // Digestive Impact
  avgDigestiveImpact: decimal("avg_digestive_impact", { precision: 5, scale: 2 }),
  
  // Performance Impact
  avgWorkoutImpact: decimal("avg_workout_impact", { precision: 5, scale: 2 }),
  
  // Optimal Timing
  optimalMealTiming: varchar("optimal_meal_timing", { length: 100 }),
  
  // User Segments
  mostBeneficialFor: text("most_beneficial_for"), // JSON: different user types
  
  // Sample Size
  mealCount: integer("meal_count"),
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From physicalEngineSchema.ts
export const physicalProfiles = pgTable("physical_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current State
  fitnessLevel: pgEnum("fitness_level", ["sedentary", "beginner", "intermediate", "advanced", "athlete"]),
  
  // Measurements
  height: integer("height"), // cm
  weight: decimal("weight", { precision: 5, scale: 2 }), // kg
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 4, scale: 1 }),
  
  // Goals
  primaryGoal: pgEnum("primary_goal", [
    "lose_weight",
    "build_muscle",
    "increase_strength",
    "improve_endurance",
    "enhance_mobility",
    "athletic_performance",
    "general_health",
    "injury_recovery",
    "longevity"
  ]).notNull(),
  
  specificGoals: text("specific_goals"), // JSON array
  
  // Limitations
  injuries: text("injuries"), // JSON array: current injuries
  injuryHistory: text("injury_history"), // JSON array: past injuries
  limitations: text("limitations"), // JSON: mobility restrictions, pain, etc.
  
  // Experience
  experienceLevel: text("experience_level"), // JSON: {strength_training: "intermediate", cardio: "advanced", etc.}
  
  // Preferences
  preferredExerciseTypes: text("preferred_exercise_types"), // JSON array
  availableEquipment: text("available_equipment"), // JSON array
  timeAvailable: integer("time_available"), // minutes per session
  
  // Self-Learning Data
  optimalTrainingFrequency: integer("optimal_training_frequency"), // days per week
  optimalSessionDuration: integer("optimal_session_duration"), // minutes
  bestRecoveryStrategies: text("best_recovery_strategies"), // JSON
  injuryRiskFactors: text("injury_risk_factors"), // JSON: patterns that lead to injury
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  workoutDate: timestamp("workout_date").notNull(),
  
  // Workout Type
  workoutType: pgEnum("workout_type", [
    "strength_training",
    "cardio",
    "HIIT",
    "yoga",
    "mobility",
    "sports",
    "walking",
    "running",
    "cycling",
    "swimming",
    "martial_arts",
    "dance",
    "other"
  ]).notNull(),
  
  // Focus
  primaryFocus: pgEnum("primary_focus", [
    "upper_body",
    "lower_body",
    "full_body",
    "core",
    "push",
    "pull",
    "legs",
    "cardio",
    "flexibility",
    "balance"
  ]),
  
  // Duration & Intensity
  duration: integer("duration"), // minutes
  intensity: pgEnum("intensity", ["low", "moderate", "high", "max"]),
  perceivedExertion: integer("perceived_exertion"), // 1-10 (RPE)
  
  // State Before
  energyBefore: integer("energy_before"), // 1-10
  sorenessBefore: integer("soreness_before"), // 1-10
  motivationBefore: integer("motivation_before"), // 1-10
  
  // Performance
  performanceRating: integer("performance_rating"), // 1-10
  personalRecords: text("personal_records"), // JSON: any PRs achieved
  
  // State After
  energyAfter: integer("energy_after"), // 1-10
  sorenessAfter: integer("soreness_after"), // 1-10
  satisfactionLevel: integer("satisfaction_level"), // 1-10
  
  // Environment
  location: varchar("location", { length: 255 }),
  temperature: integer("temperature"), // celsius
  
  // Notes
  notes: text("notes"),
  
  // Completion
  completed: boolean("completed").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id", { length: 255 }).primaryKey(),
  workoutId: varchar("workout_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Exercise Details
  exerciseName: varchar("exercise_name", { length: 255 }).notNull(),
  exerciseType: pgEnum("exercise_type", [
    "compound", // Multi-joint (squat, deadlift, bench)
    "isolation", // Single-joint (bicep curl, leg extension)
    "cardio",
    "plyometric",
    "isometric",
    "mobility",
    "balance"
  ]),
  
  muscleGroup: varchar("muscle_group", { length: 255 }), // Primary muscle worked
  
  // Sets & Reps
  sets: integer("sets"),
  reps: text("reps"), // JSON array (can vary per set)
  weight: text("weight"), // JSON array (kg per set)
  
  // Rest
  restBetweenSets: integer("rest_between_sets"), // seconds
  
  // Tempo (if tracked)
  tempo: varchar("tempo", { length: 50 }), // e.g., "3-1-2-0" (eccentric-pause-concentric-pause)
  
  // Range of Motion
  rangeOfMotion: pgEnum("range_of_motion", ["full", "partial", "limited"]),
  
  // Quality
  formQuality: integer("form_quality"), // 1-10
  difficulty: integer("difficulty"), // 1-10
  
  // Progression
  progressionFromLast: varchar("progression_from_last", { length: 255 }), // More weight, reps, better form, etc.
  
  // Pain/Discomfort
  painDuring: boolean("pain_during"),
  painLocation: varchar("pain_location", { length: 255 }),
  painLevel: integer("pain_level"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const cardioSessions = pgTable("cardio_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  workoutId: varchar("workout_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sessionDate: timestamp("session_date").notNull(),
  
  // Activity
  activityType: pgEnum("activity_type", [
    "running",
    "cycling",
    "swimming",
    "rowing",
    "walking",
    "hiking",
    "elliptical",
    "stair_climbing",
    "jump_rope",
    "other"
  ]).notNull(),
  
  // Duration & Distance
  duration: integer("duration"), // minutes
  distance: decimal("distance", { precision: 6, scale: 2 }), // km
  
  // Intensity
  avgHeartRate: integer("avg_heart_rate"), // bpm
  maxHeartRate: integer("max_heart_rate"), // bpm
  heartRateZones: text("heart_rate_zones"), // JSON: time in each zone
  
  avgPace: varchar("avg_pace", { length: 50 }), // min/km
  avgSpeed: decimal("avg_speed", { precision: 5, scale: 2 }), // km/h
  
  // Elevation
  elevationGain: integer("elevation_gain"), // meters
  
  // Calories
  caloriesBurned: integer("calories_burned"),
  
  // Performance
  performanceRating: integer("performance_rating"), // 1-10
  
  // Recovery
  recoveryHeartRate: integer("recovery_heart_rate"), // HR 1 min after stopping
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const mobilityWork = pgTable("mobility_work", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sessionDate: timestamp("session_date").notNull(),
  
  // Session Type
  sessionType: pgEnum("session_type", [
    "stretching",
    "foam_rolling",
    "yoga",
    "dynamic_warmup",
    "mobility_drills",
    "joint_prep"
  ]).notNull(),
  
  // Focus Areas
  areasWorked: text("areas_worked"), // JSON: hips, shoulders, ankles, etc.
  
  // Duration
  duration: integer("duration"), // minutes
  
  // Quality
  rangeOfMotionBefore: integer("range_of_motion_before"), // 1-10
  rangeOfMotionAfter: integer("range_of_motion_after"), // 1-10
  
  painBefore: integer("pain_before"), // 1-10
  painAfter: integer("pain_after"), // 1-10
  
  // Techniques Used
  techniquesUsed: text("techniques_used"), // JSON array
  
  // Effectiveness
  effectiveness: integer("effectiveness"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const recoveryTracking = pgTable("recovery_tracking", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  trackingDate: timestamp("tracking_date").notNull(),
  
  // Recovery Score (calculated or self-reported)
  recoveryScore: integer("recovery_score"), // 1-10
  
  // Metrics
  restingHeartRate: integer("resting_heart_rate"), // bpm
  hrv: integer("hrv"), // Heart Rate Variability (ms)
  
  sleepQuality: integer("sleep_quality"), // 1-10
  sleepHours: decimal("sleep_hours", { precision: 3, scale: 1 }),
  
  // Soreness
  overallSoreness: integer("overall_soreness"), // 1-10
  soreAreas: text("sore_areas"), // JSON: specific muscles/joints
  
  // Energy & Readiness
  energyLevel: integer("energy_level"), // 1-10
  readinessToTrain: integer("readiness_to_train"), // 1-10
  
  // Stress
  stressLevel: integer("stress_level"), // 1-10
  
  // Recovery Strategies Used
  recoveryStrategies: text("recovery_strategies"), // JSON: sleep, nutrition, massage, ice bath, etc.
  
  // Recommendations (self-learning)
  recommendedAction: pgEnum("recommended_action", [
    "full_training",
    "light_training",
    "active_recovery",
    "rest_day",
    "deload"
  ]),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const bodyMeasurements = pgTable("body_measurements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  measurementDate: timestamp("measurement_date").notNull(),
  
  // Weight
  weight: decimal("weight", { precision: 5, scale: 2 }), // kg
  
  // Body Composition
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 4, scale: 1 }),
  muscleMass: decimal("muscle_mass", { precision: 5, scale: 2 }), // kg
  
  // Circumferences (cm)
  neck: decimal("neck", { precision: 4, scale: 1 }),
  chest: decimal("chest", { precision: 4, scale: 1 }),
  waist: decimal("waist", { precision: 4, scale: 1 }),
  hips: decimal("hips", { precision: 4, scale: 1 }),
  bicepLeft: decimal("bicep_left", { precision: 4, scale: 1 }),
  bicepRight: decimal("bicep_right", { precision: 4, scale: 1 }),
  thighLeft: decimal("thigh_left", { precision: 4, scale: 1 }),
  thighRight: decimal("thigh_right", { precision: 4, scale: 1 }),
  calfLeft: decimal("calf_left", { precision: 4, scale: 1 }),
  calfRight: decimal("calf_right", { precision: 4, scale: 1 }),
  
  // Photos
  frontPhoto: varchar("front_photo", { length: 255 }),
  sidePhoto: varchar("side_photo", { length: 255 }),
  backPhoto: varchar("back_photo", { length: 255 }),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const strengthBenchmarks = pgTable("strength_benchmarks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  testDate: timestamp("test_date").notNull(),
  
  // Exercise
  exercise: varchar("exercise", { length: 255 }).notNull(),
  
  // Test Type
  testType: pgEnum("test_type", [
    "1RM", // One rep max
    "3RM",
    "5RM",
    "max_reps", // Max reps at bodyweight or specific weight
    "time_to_failure"
  ]).notNull(),
  
  // Result
  weight: decimal("weight", { precision: 6, scale: 2 }), // kg
  reps: integer("reps"),
  duration: integer("duration"), // seconds (for time-based tests)
  
  // Relative Strength
  bodyweightRatio: decimal("bodyweight_ratio", { precision: 4, scale: 2 }), // weight lifted / bodyweight
  
  // Comparison
  improvementFromLast: decimal("improvement_from_last", { precision: 5, scale: 2 }), // percentage
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const physicalEngineAnalytics = pgTable("physical_engine_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Training Effectiveness (aggregated)
  workoutType: varchar("workout_type", { length: 100 }).notNull(),
  
  // Effectiveness Metrics
  avgRecoveryScore: decimal("avg_recovery_score", { precision: 5, scale: 2 }),
  avgProgressionRate: decimal("avg_progression_rate", { precision: 5, scale: 2 }), // % improvement per week
  injuryRate: decimal("injury_rate", { precision: 5, scale: 2 }), // % of users who get injured
  
  // Optimal Parameters
  optimalFrequency: integer("optimal_frequency"), // sessions per week
  optimalDuration: integer("optimal_duration"), // minutes
  optimalIntensity: varchar("optimal_intensity", { length: 50 }),
  
  // Recovery
  avgRecoveryTime: integer("avg_recovery_time"), // hours needed
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different fitness levels
  
  // Sample Size
  workoutCount: integer("workout_count"),
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From relationshipSchema.ts
export const relationshipProfiles = pgTable("relationship_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Relationship Type & Status
  relationshipType: pgEnum("relationship_type", ["dating", "committed", "engaged", "married", "separated", "divorced", "post_breakup"]).notNull(),
  relationshipStatus: pgEnum("relationship_status", ["active", "on_break", "ending", "ended"]).notNull(),
  relationshipDuration: integer("relationship_duration"), // months
  
  // Partner Information (optional, for privacy)
  partnerInvolved: boolean("partner_involved").default(false), // Is partner also using platform?
  partnerUserId: varchar("partner_user_id", { length: 255 }),
  
  // Attachment Style (evidence-based assessment)
  attachmentStyle: pgEnum("attachment_style", ["secure", "anxious", "avoidant", "fearful_avoidant"]),
  partnerAttachmentStyle: pgEnum("partner_attachment_style", ["secure", "anxious", "avoidant", "fearful_avoidant", "unknown"]),
  
  // Love Languages (Gary Chapman's 5 Love Languages)
  primaryLoveLanguage: pgEnum("primary_love_language", ["words_of_affirmation", "quality_time", "receiving_gifts", "acts_of_service", "physical_touch"]),
  secondaryLoveLanguage: pgEnum("secondary_love_language", ["words_of_affirmation", "quality_time", "receiving_gifts", "acts_of_service", "physical_touch"]),
  partnerPrimaryLoveLanguage: pgEnum("partner_primary_love_language", ["words_of_affirmation", "quality_time", "receiving_gifts", "acts_of_service", "physical_touch", "unknown"]),
  partnerSecondaryLoveLanguage: pgEnum("partner_secondary_love_language", ["words_of_affirmation", "quality_time", "receiving_gifts", "acts_of_service", "physical_touch", "unknown"]),
  
  // Relationship Goals
  primaryGoal: pgEnum("primary_goal", [
    "improve_communication",
    "rebuild_trust",
    "increase_intimacy",
    "resolve_conflict",
    "heal_from_infidelity",
    "navigate_breakup",
    "co_parenting",
    "find_new_relationship"
  ]).notNull(),
  
  specificGoals: text("specific_goals"), // JSON array
  
  // Current Challenges
  mainChallenges: text("main_challenges"), // JSON array
  conflictFrequency: pgEnum("conflict_frequency", ["rare", "occasional", "frequent", "constant"]),
  
  // Gottman Four Horsemen Assessment
  criticismLevel: integer("criticism_level"), // 1-10
  contemptLevel: integer("contempt_level"),
  defensivenessLevel: integer("defensiveness_level"),
  stonewallinglevel: integer("stonewalling_level"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communicationLogs = pgTable("communication_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  logDate: timestamp("log_date").notNull(),
  
  // Conversation Type
  conversationType: pgEnum("conversation_type", ["conflict", "difficult_topic", "check_in", "quality_time", "repair_attempt"]).notNull(),
  
  // Topic & Context
  topic: varchar("topic", { length: 255 }).notNull(),
  context: text("context"),
  
  // Emotional State
  emotionBefore: varchar("emotion_before", { length: 255 }),
  intensityBefore: integer("intensity_before"), // 1-10
  
  // Communication Quality (Gottman-based)
  usedSoftStartup: boolean("used_soft_startup"), // Did you start gently?
  expressedNeeds: boolean("expressed_needs"), // Did you express your needs clearly?
  listenedActively: boolean("listened_actively"), // Did you listen to understand?
  validatedPartner: boolean("validated_partner"), // Did you validate their feelings?
  foundCompromise: boolean("found_compromise"), // Did you find a solution?
  
  // Four Horsemen Check
  usedCriticism: boolean("used_criticism"),
  usedContempt: boolean("used_contempt"),
  usedDefensiveness: boolean("used_defensiveness"),
  usedStonewalling: boolean("used_stonewalling"),
  
  // Outcome
  outcome: pgEnum("outcome", ["resolved", "partially_resolved", "unresolved", "escalated"]),
  emotionAfter: varchar("emotion_after", { length: 255 }),
  intensityAfter: integer("intensity_after"),
  
  // Reflection
  whatWorked: text("what_worked"),
  whatToImprove: text("what_to_improve"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const loveMaps = pgTable("love_maps", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Partner's Inner World
  partnerDreams: text("partner_dreams"), // JSON array
  partnerFears: text("partner_fears"),
  partnerStressors: text("partner_stressors"),
  partnerJoys: text("partner_joys"),
  
  // Daily Life
  partnerDailyRoutine: text("partner_daily_routine"),
  partnerFavorites: text("partner_favorites"), // JSON: {food, movie, activity, etc.}
  partnerPetPeeves: text("partner_pet_peeves"),
  
  // Relationship History
  howWeMet: text("how_we_met"),
  bestMemories: text("best_memories"), // JSON array
  hardestMoments: text("hardest_moments"),
  
  // Future Vision
  sharedGoals: text("shared_goals"), // JSON array
  individualGoals: text("individual_goals"),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connectionBids = pgTable("connection_bids", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  bidDate: timestamp("bid_date").notNull(),
  
  // Bid Details
  bidType: pgEnum("bid_type", ["conversation", "affection", "humor", "help", "quality_time"]).notNull(),
  bidDescription: text("bid_description"),
  
  // Response
  response: pgEnum("response", ["turned_toward", "turned_away", "turned_against"]).notNull(),
  responseDescription: text("response_description"),
  
  // Impact
  emotionalImpact: integer("emotional_impact"), // 1-10 (positive or negative)
  connectionStrength: integer("connection_strength"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const repairAttempts = pgTable("repair_attempts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  attemptDate: timestamp("attempt_date").notNull(),
  
  // What Happened
  conflictDescription: text("conflict_description"),
  
  // Repair Strategy
  repairStrategy: pgEnum("repair_strategy", [
    "apology",
    "taking_responsibility",
    "expressing_needs",
    "asking_for_break",
    "humor",
    "affection",
    "compromise_offer"
  ]).notNull(),
  
  repairDetails: text("repair_details"),
  
  // Partner Response
  partnerResponse: pgEnum("partner_response", ["accepted", "rejected", "mixed", "no_response"]),
  
  // Outcome
  conflictResolved: boolean("conflict_resolved"),
  connectionRestored: boolean("connection_restored"),
  
  // Learning
  effectiveness: integer("effectiveness"), // 1-10
  whatLearned: text("what_learned"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const relationshipRituals = pgTable("relationship_rituals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  ritualType: pgEnum("ritual_type", [
    "daily_check_in",
    "weekly_date",
    "monthly_adventure",
    "morning_routine",
    "evening_routine",
    "appreciation_practice",
    "conflict_resolution_ritual"
  ]).notNull(),
  
  ritualName: varchar("ritual_name", { length: 255 }).notNull(),
  description: text("description"),
  frequency: pgEnum("frequency", ["daily", "weekly", "monthly", "as_needed"]),
  
  // Tracking
  lastCompleted: timestamp("last_completed"),
  completionCount: integer("completion_count").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  
  // Impact
  connectionImpact: integer("connection_impact"), // 1-10 average
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const breakupRecovery = pgTable("breakup_recovery", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  breakupDate: timestamp("breakup_date"),
  relationshipDuration: integer("relationship_duration"), // months
  
  // Breakup Context
  initiator: pgEnum("initiator", ["me", "them", "mutual"]),
  reason: text("reason"),
  
  // Recovery Phase (evidence-based stages of grief)
  currentPhase: pgEnum("current_phase", ["denial", "anger", "bargaining", "depression", "acceptance", "growth"]),
  
  // No Contact
  noContactActive: boolean("no_contact_active").default(false),
  noContactStartDate: timestamp("no_contact_start_date"),
  noContactDuration: integer("no_contact_duration"), // days
  
  // Healing Activities
  healingActivities: text("healing_activities"), // JSON array
  supportSystem: text("support_system"), // JSON array
  
  // Progress Markers
  daysWithoutContact: integer("days_without_contact").default(0),
  goodDaysCount: integer("good_days_count").default(0),
  badDaysCount: integer("bad_days_count").default(0),
  
  // Growth & Lessons
  lessonsLearned: text("lessons_learned"), // JSON array
  personalGrowth: text("personal_growth"),
  futureGoals: text("future_goals"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loveLanguageActions = pgTable("love_language_actions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  actionDate: timestamp("action_date").notNull(),
  
  // Action Type
  actionType: pgEnum("action_type", ["given", "received"]).notNull(),
  
  // Love Language
  loveLanguage: pgEnum("love_language", [
    "words_of_affirmation",
    "quality_time",
    "receiving_gifts",
    "acts_of_service",
    "physical_touch"
  ]).notNull(),
  
  // Specific Action
  actionDescription: text("action_description").notNull(),
  
  // Examples by type:
  // Words: "Said 'I'm proud of you'", "Wrote a love note", "Complimented their effort"
  // QualityTime: "Had dinner without phones", "Went for a walk together", "Had deep conversation"
  // Gifts: "Brought their favorite coffee", "Surprise flowers", "Meaningful book"
  // Acts ofService: "Did the dishes", "Filled their car with gas", "Made their favorite meal"
  // PhysicalTouch: "Long hug", "Held hands during movie", "Back massage"
  
  // Impact
  emotionalImpact: integer("emotional_impact"), // 1-10
  connectionFelt: integer("connection_felt"), // 1-10
  
  // Partner Response (if given)
  partnerResponse: text("partner_response"),
  
  createdAt: timestamp("created_at").defaultNow(),
});


// From schema.ts

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type AuthSession = typeof authSessions.$inferSelect;
export type InsertAuthSession = typeof authSessions.$inferInsert;

export type Coach = typeof coaches.$inferSelect;
export type InsertCoach = typeof coaches.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;
export const emotionLogs = pgTable("emotionLogs", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id),
  journalEntryId: integer("journalEntryId").references(() => journalEntries.id),
  logDate: timestamp("logDate").defaultNow().notNull(),
  emotionType: varchar("emotionType", { length: 100 }).notNull(), // joy, sadness, anger, fear, etc.
  intensity: integer("intensity").notNull(), // 1-10 scale
  trigger: text("trigger"),
  physicalSensations: text("physicalSensations"),
  thoughts: text("thoughts"),
  behaviors: text("behaviors"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmotionLog = typeof emotionLogs.$inferSelect;
export type InsertEmotionLog = typeof emotionLogs.$inferInsert;
export const copingStrategies = pgTable("copingStrategies", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id),
  strategyName: varchar("strategyName", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // breathing, physical, social, cognitive, etc.
  timesUsed: integer("timesUsed").default(0).notNull(),
  averageEffectiveness: integer("averageEffectiveness"), // Average rating 1-10
  lastUsed: timestamp("lastUsed"),
  isRecommended: pgEnum("isRecommended", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CopingStrategy = typeof copingStrategies.$inferSelect;
export type InsertCopingStrategy = typeof copingStrategies.$inferInsert;
export const aiInsights = pgTable("aiInsights", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id),
  insightDate: timestamp("insightDate").defaultNow().notNull(),
  insightType: varchar("insightType", { length: 100 }).notNull(), // pattern, trend, recommendation, alert
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: pgEnum("severity", ["low", "medium", "high", "critical"]).default("low").notNull(),
  actionable: text("actionable"), // Suggested actions
  isRead: pgEnum("isRead", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = typeof aiInsights.$inferInsert;
export const sessionTypes = pgTable("sessionTypes", {
  id: serial("id").primaryKey(),
  coachId: integer("coachId").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(), // in cents (e.g., 7500 = $75.00)
  stripePriceId: varchar("stripePriceId", { length: 255 }), // Stripe recurring price ID for subscriptions
  oneTimePriceId: varchar("oneTimePriceId", { length: 255 }), // Stripe one-time price ID for single sessions
  subscriptionPrice: integer("subscriptionPrice"), // Monthly subscription price in cents (optional, defaults to price)
  isActive: pgEnum("isActive", ["true", "false"]).default("true").notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SessionType = typeof sessionTypes.$inferSelect;
export type InsertSessionType = typeof sessionTypes.$inferInsert;
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  coachId: integer("coachId").notNull().references(() => coaches.id),
  clientId: integer("clientId").notNull().references(() => clients.id),
  sessionTypeId: integer("sessionTypeId").references(() => sessionTypes.id),
  scheduledDate: timestamp("scheduledDate").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price"), // in cents - captured at booking time
  sessionType: varchar("sessionType", { length: 100 }), // legacy field, kept for backward compatibility
  notes: text("notes"),
  status: pgEnum("status", ["scheduled", "completed", "cancelled", "no-show"]).default("scheduled").notNull(),
  paymentStatus: pgEnum("paymentStatus", ["pending", "paid", "refunded", "failed"]).default("pending"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }), // Stripe checkout session ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  productId: varchar("productId", { length: 64 }).notNull(),
  status: pgEnum("status", ["active", "cancelled", "past_due", "unpaid"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export const coachAvailability = pgTable("coachAvailability", {
  id: serial("id").primaryKey(),
  coachId: integer("coachId").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  dayOfWeek: integer("dayOfWeek").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM format (e.g., "09:00")
  endTime: varchar("endTime", { length: 5 }).notNull(), // HH:MM format (e.g., "17:00")
  isActive: pgEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CoachAvailability = typeof coachAvailability.$inferSelect;
export type InsertCoachAvailability = typeof coachAvailability.$inferInsert;
export const availabilityExceptions = pgTable("availabilityExceptions", {
  id: serial("id").primaryKey(),
  coachId: integer("coachId").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  reason: varchar("reason", { length: 255 }), // vacation, holiday, personal, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AvailabilityException = typeof availabilityExceptions.$inferSelect;
export type InsertAvailabilityException = typeof availabilityExceptions.$inferInsert;
export const sessionReminders = pgTable("sessionReminders", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  reminderType: pgEnum("reminderType", ["24_hour", "1_hour"]).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionReminder = typeof sessionReminders.$inferSelect;
export type InsertSessionReminder = typeof sessionReminders.$inferInsert;
export const discountCodes = pgTable("discountCodes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountPercent: integer("discountPercent").notNull(), // 10 for 10%
  discountAmount: integer("discountAmount"), // Fixed amount in cents (optional)
  maxUses: integer("maxUses"), // null = unlimited
  usedCount: integer("usedCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: pgEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdBy: integer("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = typeof discountCodes.$inferInsert;
export const discountCodeUsage = pgTable("discountCodeUsage", {
  id: serial("id").primaryKey(),
  discountCodeId: integer("discountCodeId").notNull().references(() => discountCodes.id),
  userId: integer("userId").references(() => users.id),
  sessionId: integer("sessionId").references(() => sessions.id),
  usedAt: timestamp("usedAt").defaultNow().notNull(),
});

export type DiscountCodeUsage = typeof discountCodeUsage.$inferSelect;
export type InsertDiscountCodeUsage = typeof discountCodeUsage.$inferInsert;
export const aiChatConversations = pgTable("aiChatConversations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }), // Nullable for anonymous users
  sessionId: varchar("sessionId", { length: 255 }), // UUID for anonymous users (stored in localStorage)
  clientId: integer("clientId").references(() => clients.id, { onDelete: "cascade" }), // Optional link to client profile
  title: varchar("title", { length: 255 }), // Auto-generated conversation title
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AiChatConversation = typeof aiChatConversations.$inferSelect;
export type InsertAiChatConversation = typeof aiChatConversations.$inferInsert;
export const aiChatMessages = pgTable("aiChatMessages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull().references(() => aiChatConversations.id, { onDelete: "cascade" }),
  role: pgEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  emotionDetected: varchar("emotionDetected", { length: 100 }), // AI-detected emotion from user message
  crisisFlag: pgEnum("crisisFlag", ["none", "low", "medium", "high", "critical"]).default("none").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAiChatMessage = typeof aiChatMessages.$inferInsert;
export const platformSettings = pgTable("platformSettings", {
  id: serial("id").primaryKey(),
  aiCoachingEnabled: pgEnum("aiCoachingEnabled", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;
export const videoTestimonials = pgTable("videoTestimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Client name
  title: varchar("title", { length: 255 }).notNull(), // Client title/role
  company: varchar("company", { length: 255 }).notNull(), // Client company
  quote: text("quote").notNull(), // Text quote/testimonial
  metric: varchar("metric", { length: 255 }).notNull(), // Metric name (e.g., "Healthcare Cost Savings")
  metricValue: varchar("metricValue", { length: 100 }).notNull(), // Metric value (e.g., "$2.3M")
  videoUrl: text("videoUrl"), // S3 URL to video file
  videoKey: varchar("videoKey", { length: 500 }), // S3 key for video file
  thumbnailUrl: text("thumbnailUrl"), // S3 URL to thumbnail image
  thumbnailKey: varchar("thumbnailKey", { length: 500 }), // S3 key for thumbnail
  duration: integer("duration"), // Video duration in seconds
  isPublished: pgEnum("isPublished", ["true", "false"]).default("false").notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type VideoTestimonial = typeof videoTestimonials.$inferSelect;
export type InsertVideoTestimonial = typeof videoTestimonials.$inferInsert;
export const complianceFlags = pgTable("complianceFlags", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull().references(() => aiChatConversations.id, { onDelete: "cascade" }),
  messageId: integer("messageId").notNull().references(() => aiChatMessages.id, { onDelete: "cascade" }),
  flagType: pgEnum("flagType", ["medical_advice", "diagnosis", "prescription", "legal_advice", "financial_advice", "harmful_content"]).notNull(),
  severity: pgEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  flaggedContent: text("flaggedContent").notNull(), // The specific content that triggered the flag
  aiResponse: text("aiResponse"), // How the AI responded to the flagged content
  reviewStatus: pgEnum("reviewStatus", ["pending", "reviewed", "dismissed", "escalated"]).default("pending").notNull(),
  reviewedBy: integer("reviewedBy").references(() => users.id), // Coach who reviewed
  reviewNotes: text("reviewNotes"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComplianceFlag = typeof complianceFlags.$inferSelect;
export type InsertComplianceFlag = typeof complianceFlags.$inferInsert;
export const escalationQueue = pgTable("escalationQueue", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull().references(() => aiChatConversations.id, { onDelete: "cascade" }),
  userId: integer("userId").notNull().references(() => users.id),
  clientId: integer("clientId").references(() => clients.id),
  escalationType: pgEnum("escalationType", ["crisis", "client_request", "ai_uncertainty", "compliance_flag", "complex_issue"]).notNull(),
  priority: pgEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  reason: text("reason").notNull(), // Why escalation was triggered
  context: text("context"), // Recent conversation context
  status: pgEnum("status", ["pending", "assigned", "in_progress", "resolved", "closed"]).default("pending").notNull(),
  assignedTo: integer("assignedTo").references(() => coaches.id), // Which coach is handling it
  assignedAt: timestamp("assignedAt"),
  resolvedAt: timestamp("resolvedAt"),
  resolutionNotes: text("resolutionNotes"),
  notificationSent: pgEnum("notificationSent", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EscalationQueue = typeof escalationQueue.$inferSelect;
export type InsertEscalationQueue = typeof escalationQueue.$inferInsert;
export const similarCases = pgTable("similarCases", {
  id: serial("id").primaryKey(),
  caseTitle: varchar("caseTitle", { length: 255 }).notNull(),
  caseDescription: text("caseDescription").notNull(),
  clientIssues: text("clientIssues").notNull(), // JSON array of issues/symptoms
  interventions: text("interventions").notNull(), // What the coach did
  outcome: text("outcome").notNull(), // What happened
  successRating: integer("successRating").notNull(), // 1-10 scale
  timeToResolution: integer("timeToResolution"), // Days to resolution
  coachNotes: text("coachNotes"), // Coach insights and recommendations
  tags: text("tags"), // JSON array of searchable tags
  isPublic: pgEnum("isPublic", ["true", "false"]).default("false").notNull(), // Share with other coaches
  createdBy: integer("createdBy").notNull().references(() => coaches.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SimilarCase = typeof similarCases.$inferSelect;
export type InsertSimilarCase = typeof similarCases.$inferInsert;
export const coachNotifications = pgTable("coachNotifications", {
  id: serial("id").primaryKey(),
  coachId: integer("coachId").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  notificationType: pgEnum("notificationType", ["escalation", "compliance_flag", "crisis_alert", "new_client", "session_reminder"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  priority: pgEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  relatedId: integer("relatedId"), // ID of related escalation, flag, etc.
  isRead: pgEnum("isRead", ["true", "false"]).default("false").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachNotification = typeof coachNotifications.$inferSelect;
export type InsertCoachNotification = typeof coachNotifications.$inferInsert;
export const liveSessionTranscripts = pgTable("liveSessionTranscripts", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  speaker: pgEnum("speaker", ["client", "coach"]).notNull(),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const coachGuidance = pgTable("coachGuidance", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  guidanceType: pgEnum("guidanceType", ["suggest", "alert", "reference", "technique", "crisis"]).notNull(),
  priority: pgEnum("priority", ["low", "medium", "high", "urgent"]).notNull(),
  message: text("message").notNull(),
  context: text("context"),
  timestamp: timestamp("timestamp").notNull(),
  wasFollowed: pgEnum("wasFollowed", ["true", "false"]).default("false"),
});


// From securitySchema.ts
export const securityProfiles = pgTable("security_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // Multi-Factor Authentication
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaMethod: pgEnum("mfa_method", ["totp", "sms", "email", "authenticator_app"]),
  mfaSecret: varchar("mfa_secret", { length: 500 }), // Encrypted
  mfaBackupCodes: text("mfa_backup_codes"), // Encrypted JSON array
  
  // Password
  passwordHash: varchar("password_hash", { length: 500 }).notNull(),
  passwordSalt: varchar("password_salt", { length: 255 }),
  passwordLastChanged: timestamp("password_last_changed"),
  passwordExpiresAt: timestamp("password_expires_at"),
  
  // Password Policy
  requirePasswordChange: boolean("require_password_change").default(false),
  
  // Security Questions (backup recovery)
  securityQuestions: text("security_questions"), // Encrypted JSON
  
  // Account Security
  accountLocked: boolean("account_locked").default(false),
  accountLockedUntil: timestamp("account_locked_until"),
  accountLockedReason: text("account_locked_reason"),
  
  // Failed Login Attempts
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lastFailedLoginAt: timestamp("last_failed_login_at"),
  
  // Suspicious Activity
  suspiciousActivityDetected: boolean("suspicious_activity_detected").default(false),
  suspiciousActivityCount: integer("suspicious_activity_count").default(0),
  
  // IP Restrictions
  ipWhitelistEnabled: boolean("ip_whitelist_enabled").default(false),
  ipWhitelist: text("ip_whitelist"), // JSON array
  
  // Session Settings
  maxActiveSessions: integer("max_active_sessions").default(5),
  sessionTimeout: integer("session_timeout").default(3600), // seconds
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activeSessions = pgTable("active_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Session Details
  sessionToken: varchar("session_token", { length: 500 }).notNull().unique(),
  
  // Device Info
  deviceId: varchar("device_id", { length: 255 }),
  deviceName: varchar("device_name", { length: 255 }),
  deviceType: pgEnum("device_type", ["desktop", "mobile", "tablet", "other"]),
  
  // Location
  ipAddress: varchar("ip_address", { length: 50 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  
  // Browser
  userAgent: text("user_agent"),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  
  // Status
  active: boolean("active").default(true),
  
  // Activity
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  
  // Expiry
  expiresAt: timestamp("expires_at"),
  
  // Security
  mfaVerified: boolean("mfa_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  terminatedAt: timestamp("terminated_at"),
});

export const loginHistory = pgTable("login_history", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Login Details
  loginMethod: pgEnum("login_method", ["password", "oauth", "magic_link", "sso"]).notNull(),
  
  // Status
  success: boolean("success").notNull(),
  failureReason: varchar("failure_reason", { length: 255 }),
  
  // Device & Location
  ipAddress: varchar("ip_address", { length: 50 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  userAgent: text("user_agent"),
  
  // MFA
  mfaRequired: boolean("mfa_required").default(false),
  mfaCompleted: boolean("mfa_completed").default(false),
  
  // Risk Assessment
  riskScore: integer("risk_score"), // 0-100
  riskFactors: text("risk_factors"), // JSON: what made this risky
  
  loginAt: timestamp("login_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }), // Null for system events
  
  // Event Details
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventCategory: pgEnum("event_category", [
    "authentication",
    "authorization",
    "data_access",
    "data_modification",
    "settings_change",
    "security_event",
    "system_event",
    "compliance_event"
  ]).notNull(),
  
  // Action
  action: varchar("action", { length: 255 }).notNull(),
  resource: varchar("resource", { length: 255 }), // What was accessed/modified
  resourceId: varchar("resource_id", { length: 255 }),
  
  // Details
  details: text("details"), // JSON: additional context
  
  // Result
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  
  // Context
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id", { length: 255 }),
  
  // Severity
  severity: pgEnum("severity", ["info", "warning", "error", "critical"]).default("info"),
  
  eventTimestamp: timestamp("event_timestamp").defaultNow(),
});

export const securityIncidents = pgTable("security_incidents", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }), // Null for system-wide incidents
  
  // Incident Details
  incidentType: pgEnum("incident_type", [
    "unauthorized_access",
    "data_breach",
    "account_takeover",
    "brute_force_attack",
    "suspicious_activity",
    "malware_detected",
    "dos_attack",
    "other"
  ]).notNull(),
  
  // Severity
  severity: pgEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  
  // Description
  description: text("description"),
  
  // Detection
  detectedBy: varchar("detected_by", { length: 100 }), // "system", "user", "admin"
  detectionMethod: varchar("detection_method", { length: 255 }),
  
  // Status
  status: pgEnum("status", [
    "detected",
    "investigating",
    "contained",
    "resolved",
    "false_positive"
  ]).default("detected"),
  
  // Response
  responseActions: text("response_actions"), // JSON: actions taken
  
  // Impact
  impactAssessment: text("impact_assessment"),
  affectedUsers: integer("affected_users"),
  dataCompromised: boolean("data_compromised").default(false),
  
  // Resolution
  resolvedBy: varchar("resolved_by", { length: 255 }),
  resolutionNotes: text("resolution_notes"),
  
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Key Details
  keyName: varchar("key_name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 500 }).notNull(), // Hashed API key
  keyPrefix: varchar("key_prefix", { length: 20 }), // First few chars for identification
  
  // Permissions
  permissions: text("permissions"), // JSON: what this key can do
  
  // Restrictions
  ipWhitelist: text("ip_whitelist"), // JSON: allowed IPs
  rateLimit: integer("rate_limit"), // requests per hour
  
  // Status
  active: boolean("active").default(true),
  
  // Usage
  lastUsedAt: timestamp("last_used_at"),
  totalRequests: integer("total_requests").default(0),
  
  // Expiry
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

export const apiRequestLogs = pgTable("api_request_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  apiKeyId: varchar("api_key_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }),
  
  // Request Details
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, etc.
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  
  // Response
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time"), // milliseconds
  
  // Context
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  
  // Error
  errorMessage: text("error_message"),
  
  requestTimestamp: timestamp("request_timestamp").defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Identifier (user ID, IP, API key)
  identifier: varchar("identifier", { length: 255 }).notNull(),
  identifierType: pgEnum("identifier_type", ["user_id", "ip_address", "api_key"]).notNull(),
  
  // Endpoint
  endpoint: varchar("endpoint", { length: 500 }),
  
  // Limits
  requestsPerMinute: integer("requests_per_minute"),
  requestsPerHour: integer("requests_per_hour"),
  requestsPerDay: integer("requests_per_day"),
  
  // Current Usage
  requestsThisMinute: integer("requests_this_minute").default(0),
  requestsThisHour: integer("requests_this_hour").default(0),
  requestsToday: integer("requests_today").default(0),
  
  // Reset Times
  minuteResetAt: timestamp("minute_reset_at"),
  hourResetAt: timestamp("hour_reset_at"),
  dayResetAt: timestamp("day_reset_at"),
  
  // Throttling
  throttled: boolean("throttled").default(false),
  throttledUntil: timestamp("throttled_until"),
  
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataAccessLogs = pgTable("data_access_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Who accessed
  accessedBy: varchar("accessed_by", { length: 255 }).notNull(),
  accessedByType: pgEnum("accessed_by_type", ["user", "admin", "system", "api"]).notNull(),
  
  // What was accessed
  dataType: varchar("data_type", { length: 100 }).notNull(),
  dataId: varchar("data_id", { length: 255 }),
  dataOwnerId: varchar("data_owner_id", { length: 255 }), // Whose data was accessed
  
  // How
  accessMethod: varchar("access_method", { length: 100 }),
  
  // Why
  purpose: varchar("purpose", { length: 255 }),
  
  // Context
  ipAddress: varchar("ip_address", { length: 50 }),
  
  accessedAt: timestamp("accessed_at").defaultNow(),
});

export const encryptionKeys = pgTable("encryption_keys", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Key Details
  keyId: varchar("key_id", { length: 255 }).notNull().unique(),
  keyType: pgEnum("key_type", ["master", "data", "session"]).notNull(),
  algorithm: varchar("algorithm", { length: 100 }).notNull(),
  
  // Status
  active: boolean("active").default(true),
  
  // Rotation
  rotationSchedule: pgEnum("rotation_schedule", ["never", "monthly", "quarterly", "yearly"]),
  lastRotatedAt: timestamp("last_rotated_at"),
  nextRotationAt: timestamp("next_rotation_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  retiredAt: timestamp("retired_at"),
});

export const complianceReports = pgTable("compliance_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Report Details
  reportType: pgEnum("report_type", ["gdpr", "hipaa", "soc2", "iso27001", "custom"]).notNull(),
  reportPeriodStart: timestamp("report_period_start").notNull(),
  reportPeriodEnd: timestamp("report_period_end").notNull(),
  
  // Status
  status: pgEnum("status", ["generating", "completed", "failed"]).default("generating"),
  
  // Findings
  findings: text("findings"), // JSON: compliance findings
  
  // File
  filePath: varchar("file_path", { length: 500 }),
  
  generatedBy: varchar("generated_by", { length: 255 }),
  generatedAt: timestamp("generated_at").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const securityAlerts = pgTable("security_alerts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }),
  
  // Alert Details
  alertType: pgEnum("alert_type", [
    "new_login",
    "new_device",
    "password_changed",
    "mfa_disabled",
    "suspicious_activity",
    "data_export",
    "settings_changed"
  ]).notNull(),
  
  // Severity
  severity: pgEnum("severity", ["info", "warning", "critical"]).default("info"),
  
  // Message
  message: text("message"),
  
  // Action Required
  actionRequired: boolean("action_required").default(false),
  actionUrl: varchar("action_url", { length: 500 }),
  
  // Status
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const trustedDevices = pgTable("trusted_devices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Device Details
  deviceId: varchar("device_id", { length: 255 }).notNull(),
  deviceName: varchar("device_name", { length: 255 }),
  deviceType: pgEnum("device_type", ["desktop", "mobile", "tablet"]),
  
  // Fingerprint
  deviceFingerprint: varchar("device_fingerprint", { length: 500 }),
  
  // Status
  trusted: boolean("trusted").default(true),
  
  // Last Seen
  lastSeenAt: timestamp("last_seen_at"),
  lastSeenIp: varchar("last_seen_ip", { length: 50 }),
  
  trustedAt: timestamp("trusted_at").defaultNow(),
  untrustedAt: timestamp("untrusted_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});


// From settingsSchema.ts
export const userSettings = pgTable("user_settings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // Account Settings
  displayName: varchar("display_name", { length: 255 }),
  bio: text("bio"),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  
  // Contact
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  
  // Location
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  country: varchar("country", { length: 100 }),
  language: varchar("language", { length: 10 }).default("en"),
  
  // Units
  measurementSystem: pgEnum("measurement_system", ["metric", "imperial"]).default("metric"),
  temperatureUnit: pgEnum("temperature_unit", ["celsius", "fahrenheit"]).default("celsius"),
  
  // Date & Time Format
  dateFormat: varchar("date_format", { length: 50 }).default("YYYY-MM-DD"),
  timeFormat: pgEnum("time_format", ["12h", "24h"]).default("24h"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const privacySettings = pgTable("privacy_settings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // Profile Visibility
  profileVisibility: pgEnum("profile_visibility", ["private", "friends", "public"]).default("private"),
  
  // Data Sharing
  shareDataForResearch: boolean("share_data_for_research").default(false),
  shareDataForAI: boolean("share_data_for_ai").default(true),
  shareProgressWithCommunity: boolean("share_progress_with_community").default(false),
  
  // Activity Visibility
  showActivityFeed: boolean("show_activity_feed").default(false),
  showGoals: boolean("show_goals").default(false),
  showAchievements: boolean("show_achievements").default(true),
  showStats: boolean("show_stats").default(false),
  
  // Social
  allowFriendRequests: boolean("allow_friend_requests").default(true),
  allowMessages: boolean("allow_messages").default(true),
  
  // Search
  searchable: boolean("searchable").default(false),
  
  // Analytics
  allowAnalyticsCookies: boolean("allow_analytics_cookies").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appearanceSettings = pgTable("appearance_settings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // Theme
  theme: pgEnum("theme", ["light", "dark", "auto"]).default("auto"),
  accentColor: varchar("accent_color", { length: 50 }).default("#3B82F6"),
  
  // Layout
  sidebarPosition: pgEnum("sidebar_position", ["left", "right"]).default("left"),
  compactMode: boolean("compact_mode").default(false),
  
  // Typography
  fontSize: pgEnum("font_size", ["small", "medium", "large", "extra_large"]).default("medium"),
  fontFamily: varchar("font_family", { length: 100 }).default("system"),
  
  // Accessibility
  highContrast: boolean("high_contrast").default(false),
  reduceMotion: boolean("reduce_motion").default(false),
  screenReaderOptimized: boolean("screen_reader_optimized").default(false),
  
  // Dashboard
  defaultDashboard: varchar("default_dashboard", { length: 100 }).default("overview"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiSettings = pgTable("ai_settings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // AI Features
  aiCoachEnabled: boolean("ai_coach_enabled").default(true),
  aiInsightsEnabled: boolean("ai_insights_enabled").default(true),
  aiRecommendationsEnabled: boolean("ai_recommendations_enabled").default(true),
  aiPredictionsEnabled: boolean("ai_predictions_enabled").default(true),
  
  // Automation
  autoHabitTracking: boolean("auto_habit_tracking").default(false),
  autoGoalSuggestions: boolean("auto_goal_suggestions").default(true),
  autoProgressReports: boolean("auto_progress_reports").default(true),
  
  // Proactivity
  proactiveCheckIns: boolean("proactive_check_ins").default(true),
  proactiveInterventions: boolean("proactive_interventions").default(true),
  
  // AI Personality
  aiTone: pgEnum("ai_tone", ["supportive", "challenging", "balanced"]).default("balanced"),
  aiVerbosity: pgEnum("ai_verbosity", ["concise", "moderate", "detailed"]).default("moderate"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataSettings = pgTable("data_settings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // Backup
  autoBackupEnabled: boolean("auto_backup_enabled").default(true),
  backupFrequency: pgEnum("backup_frequency", ["daily", "weekly", "monthly"]).default("weekly"),
  lastBackupAt: timestamp("last_backup_at"),
  
  // Data Retention
  dataRetentionPeriod: pgEnum("data_retention_period", [
    "30_days",
    "90_days",
    "1_year",
    "forever"
  ]).default("forever"),
  
  // Export
  exportFormat: pgEnum("export_format", ["json", "csv", "pdf"]).default("json"),
  
  // Storage
  storageUsed: integer("storage_used").default(0), // bytes
  storageLimit: integer("storage_limit").default(1073741824), // 1GB default
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const modulePreferences = pgTable("module_preferences", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Module
  moduleName: varchar("module_name", { length: 100 }).notNull(),
  
  // Enabled
  enabled: boolean("enabled").default(true),
  
  // Visibility
  showInDashboard: boolean("show_in_dashboard").default(true),
  dashboardOrder: integer("dashboard_order"),
  
  // Settings
  moduleSettings: text("module_settings"), // JSON: module-specific settings
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userFeatureFlags = pgTable("user_feature_flags", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Feature
  featureName: varchar("feature_name", { length: 100 }).notNull(),
  
  // Enabled
  enabled: boolean("enabled").default(false),
  
  // Metadata
  enabledAt: timestamp("enabled_at"),
  enabledBy: varchar("enabled_by", { length: 100 }), // "user", "admin", "auto"
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const consentRecords = pgTable("consent_records", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Consent Type
  consentType: pgEnum("consent_type", [
    "terms_of_service",
    "privacy_policy",
    "data_processing",
    "marketing_emails",
    "research_participation",
    "ai_features"
  ]).notNull(),
  
  // Consent
  consented: boolean("consented").notNull(),
  
  // Version
  policyVersion: varchar("policy_version", { length: 50 }),
  
  // IP & User Agent (for audit)
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  
  consentedAt: timestamp("consented_at").defaultNow(),
});

export const sessionPreferences = pgTable("session_preferences", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  
  // Preferences
  preferences: text("preferences"), // JSON: temporary preferences
  
  // Expiry
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blockedUsers = pgTable("blocked_users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(), // Who blocked
  blockedUserId: varchar("blocked_user_id", { length: 255 }).notNull(), // Who was blocked
  
  // Reason
  reason: text("reason"),
  
  blockedAt: timestamp("blocked_at").defaultNow(),
});

export const accountDeletionRequests = pgTable("account_deletion_requests", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Reason
  reason: text("reason"),
  feedback: text("feedback"),
  
  // Status
  status: pgEnum("status", ["pending", "processing", "completed", "cancelled"]).default("pending"),
  
  // Scheduled Deletion
  scheduledFor: timestamp("scheduled_for"), // Grace period (e.g., 30 days)
  
  // Completion
  completedAt: timestamp("completed_at"),
  
  requestedAt: timestamp("requested_at").defaultNow(),
});

export const settingsChangeLog = pgTable("settings_change_log", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Change Details
  settingCategory: varchar("setting_category", { length: 100 }).notNull(),
  settingName: varchar("setting_name", { length: 100 }).notNull(),
  
  // Values
  oldValue: text("old_value"),
  newValue: text("new_value"),
  
  // Context
  changedBy: varchar("changed_by", { length: 100 }), // "user", "admin", "system"
  ipAddress: varchar("ip_address", { length: 50 }),
  
  changedAt: timestamp("changed_at").defaultNow(),
});

export const accessibilityProfiles = pgTable("accessibility_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // Visual
  screenReaderEnabled: boolean("screen_reader_enabled").default(false),
  highContrast: boolean("high_contrast").default(false),
  largeText: boolean("large_text").default(false),
  colorBlindMode: pgEnum("color_blind_mode", [
    "none",
    "protanopia",
    "deuteranopia",
    "tritanopia"
  ]).default("none"),
  
  // Motor
  reduceMotion: boolean("reduce_motion").default(false),
  keyboardNavigation: boolean("keyboard_navigation").default(false),
  stickyKeys: boolean("sticky_keys").default(false),
  
  // Cognitive
  simplifiedInterface: boolean("simplified_interface").default(false),
  reducedDistractions: boolean("reduced_distractions").default(false),
  
  // Audio
  closedCaptions: boolean("closed_captions").default(false),
  audioDescriptions: boolean("audio_descriptions").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const betaFeatures = pgTable("beta_features", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Feature Details
  featureName: varchar("feature_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Status
  status: pgEnum("status", ["development", "beta", "stable", "deprecated"]).default("development"),
  
  // Availability
  availableToAll: boolean("available_to_all").default(false),
  requiresOptIn: boolean("requires_opt_in").default(true),
  
  // Stats
  totalOptIns: integer("total_opt_ins").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userBetaOptIns = pgTable("user_beta_opt_ins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  betaFeatureId: varchar("beta_feature_id", { length: 255 }).notNull(),
  
  // Feedback
  feedback: text("feedback"),
  rating: integer("rating"), // 1-10
  
  optedInAt: timestamp("opted_in_at").defaultNow(),
  optedOutAt: timestamp("opted_out_at"),
});


// From sleepOptimizationSchema.ts
export const sleepProfiles = pgTable("sleep_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Sleep Goals
  targetSleepDuration: decimal("target_sleep_duration", { precision: 3, scale: 1 }), // hours
  targetBedtime: varchar("target_bedtime", { length: 10 }), // HH:MM
  targetWakeTime: varchar("target_wake_time", { length: 10 }), // HH:MM
  
  // Chronotype (circadian preference)
  chronotype: pgEnum("chronotype", ["early_bird", "night_owl", "intermediate", "unknown"]),
  
  // Current Issues
  sleepIssues: text("sleep_issues"), // JSON array: insomnia, apnea, restless, etc.
  
  // Tracking Method
  trackingMethod: pgEnum("tracking_method", ["manual", "wearable", "app"]),
  wearableDevice: varchar("wearable_device", { length: 100 }), // Oura, WHOOP, Apple Watch, etc.
  
  // Self-Learning Data
  personalSleepNeed: decimal("personal_sleep_need", { precision: 3, scale: 1 }), // Calculated optimal hours
  optimalBedtime: varchar("optimal_bedtime", { length: 10 }),
  optimalWakeTime: varchar("optimal_wake_time", { length: 10 }),
  sleepPerformanceCorrelations: text("sleep_performance_correlations"), // JSON: how sleep affects different areas
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sleepTracking = pgTable("sleep_tracking", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sleepDate: timestamp("sleep_date").notNull(), // Date of the night
  
  // Sleep Times
  bedtime: timestamp("bedtime"),
  wakeTime: timestamp("wake_time"),
  
  // Duration
  timeInBed: decimal("time_in_bed", { precision: 4, scale: 2 }), // hours
  actualSleepDuration: decimal("actual_sleep_duration", { precision: 4, scale: 2 }), // hours
  sleepEfficiency: decimal("sleep_efficiency", { precision: 5, scale: 2 }), // % (sleep duration / time in bed)
  
  // Sleep Stages (if available from wearable)
  lightSleepMinutes: integer("light_sleep_minutes"),
  deepSleepMinutes: integer("deep_sleep_minutes"),
  remSleepMinutes: integer("rem_sleep_minutes"),
  awakeMinutes: integer("awake_minutes"),
  
  // Quality Metrics
  sleepQuality: integer("sleep_quality"), // 1-10 subjective
  sleepScore: integer("sleep_score"), // 0-100 (if from wearable)
  
  // Disruptions
  timesToWakeUp: integer("times_to_wake_up"),
  timeToFallAsleep: integer("time_to_fall_asleep"), // minutes (sleep latency)
  
  // Recovery Metrics
  restingHeartRate: integer("resting_heart_rate"), // bpm
  hrv: integer("hrv"), // Heart Rate Variability (ms)
  respiratoryRate: decimal("respiratory_rate", { precision: 4, scale: 2 }), // breaths per minute
  bodyTemperature: decimal("body_temperature", { precision: 4, scale: 2 }), // Celsius
  
  // Recovery Score
  recoveryScore: integer("recovery_score"), // 0-100
  readinessScore: integer("readiness_score"), // 0-100 (Oura-style)
  
  // Morning State
  morningMood: varchar("morning_mood", { length: 100 }),
  morningEnergy: integer("morning_energy"), // 1-10
  morningFocus: integer("morning_focus"), // 1-10
  
  // Sleep Hygiene Compliance
  hygieneScore: integer("hygiene_score"), // 0-100
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const sleepHygienePractices = pgTable("sleep_hygiene_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sleepTrackingId: varchar("sleep_tracking_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // Evening Routine (evidence-based practices)
  noScreens1HourBefore: boolean("no_screens_1_hour_before"),
  dimLightsEvening: boolean("dim_lights_evening"),
  coolRoomTemp: boolean("cool_room_temp"), // 60-67°F optimal
  darkRoom: boolean("dark_room"),
  quietEnvironment: boolean("quiet_environment"),
  
  // Timing
  consistentBedtime: boolean("consistent_bedtime"),
  consistentWakeTime: boolean("consistent_wake_time"),
  
  // Substances
  noCaffeineAfter2pm: boolean("no_caffeine_after_2pm"),
  noAlcohol: boolean("no_alcohol"),
  noHeavyMealBefore3Hours: boolean("no_heavy_meal_before_3_hours"),
  
  // Daytime Practices
  morningLightExposure: boolean("morning_light_exposure"), // Huberman protocol
  exercisedToday: boolean("exercised_today"),
  noNapsAfter3pm: boolean("no_naps_after_3pm"),
  
  // Relaxation
  relaxationPractice: pgEnum("relaxation_practice", [
    "none",
    "meditation",
    "breathing",
    "reading",
    "stretching",
    "warm_bath",
    "journaling"
  ]),
  
  // Supplements (if any)
  supplements: text("supplements"), // JSON array: magnesium, glycine, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const sleepExperiments = pgTable("sleep_experiments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  experimentName: varchar("experiment_name", { length: 255 }).notNull(),
  hypothesis: text("hypothesis"), // What do you think will improve sleep?
  
  // What's Being Tested
  variable: varchar("variable", { length: 255 }).notNull(), // Bedtime, temperature, supplement, etc.
  
  // Duration
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  duration: integer("duration"), // days
  
  // Baseline
  baselineSleepQuality: decimal("baseline_sleep_quality", { precision: 4, scale: 2 }),
  baselineSleepDuration: decimal("baseline_sleep_duration", { precision: 4, scale: 2 }),
  
  // Results
  avgSleepQualityDuringExperiment: decimal("avg_sleep_quality_during_experiment", { precision: 4, scale: 2 }),
  avgSleepDurationDuringExperiment: decimal("avg_sleep_duration_during_experiment", { precision: 4, scale: 2 }),
  
  // Impact
  improvement: decimal("improvement", { precision: 6, scale: 2 }), // % change
  
  // Conclusion
  conclusion: text("conclusion"),
  keepPractice: boolean("keep_practice"), // Will you continue this?
  
  // Status
  status: pgEnum("status", ["planning", "active", "completed"]).default("planning"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sleepPerformanceCorrelations = pgTable("sleep_performance_correlations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Performance Area
  performanceArea: pgEnum("performance_area", [
    "cognitive",
    "physical",
    "emotional",
    "productivity",
    "creativity",
    "social"
  ]).notNull(),
  
  // Correlation Strength
  correlationCoefficient: decimal("correlation_coefficient", { precision: 4, scale: 3 }), // -1 to 1
  
  // Optimal Sleep for This Area
  optimalSleepDuration: decimal("optimal_sleep_duration", { precision: 3, scale: 1 }),
  optimalSleepQuality: integer("optimal_sleep_quality"),
  
  // Sample Size
  dataPoints: integer("data_points"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sleepInsights = pgTable("sleep_insights", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  insightType: pgEnum("insight_type", [
    "pattern_detected",
    "recommendation",
    "warning",
    "achievement",
    "correlation_found"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Supporting Data
  supportingData: text("supporting_data"), // JSON: evidence for this insight
  
  // Action Recommended
  actionRecommended: text("action_recommended"),
  
  // Priority
  priority: pgEnum("priority", ["low", "medium", "high"]).default("medium"),
  
  // User Response
  acknowledged: boolean("acknowledged").default(false),
  actionTaken: boolean("action_taken").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const sleepAnalytics = pgTable("sleep_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Hygiene Practice Effectiveness (aggregated)
  practice: varchar("practice", { length: 100 }).notNull(),
  
  // Impact Metrics
  avgSleepQualityImprovement: decimal("avg_sleep_quality_improvement", { precision: 5, scale: 2 }), // %
  avgSleepDurationImprovement: decimal("avg_sleep_duration_improvement", { precision: 5, scale: 2 }), // minutes
  
  // Optimal Parameters
  optimalImplementationTime: varchar("optimal_implementation_time", { length: 100 }), // When to do this practice
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From spiritualEngineSchema.ts
export const spiritualProfiles = pgTable("spiritual_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Spiritual Background
  spiritualBackground: pgEnum("spiritual_background", [
    "religious",
    "spiritual_not_religious",
    "secular",
    "agnostic",
    "atheist",
    "exploring",
    "prefer_not_to_say"
  ]),
  
  religiousTradition: varchar("religious_tradition", { length: 255 }), // Optional: Buddhism, Christianity, Islam, etc.
  
  // Current Practice
  hasMeditationPractice: boolean("has_meditation_practice").default(false),
  meditationExperience: pgEnum("meditation_experience", ["none", "beginner", "intermediate", "advanced"]),
  currentPractices: text("current_practices"), // JSON array
  
  // Spiritual Goals
  primaryGoal: pgEnum("primary_goal", [
    "reduce_stress",
    "find_peace",
    "discover_purpose",
    "connect_with_something_greater",
    "develop_compassion",
    "increase_awareness",
    "heal_spiritually",
    "deepen_practice"
  ]).notNull(),
  
  specificGoals: text("specific_goals"), // JSON array
  
  // Barriers
  barriers: text("barriers"), // JSON array: time, skepticism, don't know how, etc.
  
  // Preferences
  preferredPracticeTime: pgEnum("preferred_practice_time", ["morning", "afternoon", "evening", "night", "flexible"]),
  preferredDuration: integer("preferred_duration"), // minutes
  preferredStyle: text("preferred_style"), // JSON array: guided, silent, movement, etc.
  
  // Self-Learning Data
  mostEffectivePractices: text("most_effective_practices"), // JSON: practices that work best for this user
  optimalPracticeTime: integer("optimal_practice_time"), // minutes (learned from user data)
  bestTimeOfDay: varchar("best_time_of_day", { length: 50 }), // learned from completion rates
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const meditationSessions = pgTable("meditation_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  sessionDate: timestamp("session_date").notNull(),
  
  // Practice Details
  practiceType: pgEnum("practice_type", [
    "mindfulness", // MBSR-based
    "loving_kindness", // Metta meditation
    "body_scan", // Body awareness
    "breath_awareness", // Anapanasati
    "walking_meditation",
    "transcendental", // TM
    "visualization",
    "mantra",
    "open_awareness",
    "compassion", // Tonglen
    "gratitude",
    "prayer"
  ]).notNull(),
  
  guidedOrSilent: pgEnum("guided_or_silent", ["guided", "silent", "hybrid"]),
  guideSource: varchar("guide_source", { length: 255 }), // App, teacher, self, etc.
  
  // Duration
  plannedDuration: integer("planned_duration"), // minutes
  actualDuration: integer("actual_duration"), // minutes
  
  // Quality Metrics
  focusLevel: integer("focus_level"), // 1-10 (how focused were you?)
  distractionLevel: integer("distraction_level"), // 1-10
  peaceLevel: integer("peace_level"), // 1-10 (how peaceful did you feel?)
  insightLevel: integer("insight_level"), // 1-10 (any insights or realizations?)
  
  // State Before/After
  emotionBefore: varchar("emotion_before", { length: 255 }),
  stressLevelBefore: integer("stress_level_before"), // 1-10
  emotionAfter: varchar("emotion_after", { length: 255 }),
  stressLevelAfter: integer("stress_level_after"), // 1-10
  
  // Experience
  experiences: text("experiences"), // JSON array: calm, restless, sleepy, energized, etc.
  insights: text("insights"), // Any realizations or insights
  challenges: text("challenges"), // What was difficult?
  
  // Completion
  completed: boolean("completed").default(true),
  
  // Self-Learning Data
  effectiveness: integer("effectiveness"), // 1-10 (calculated from before/after metrics)
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const mindfulnessPractices = pgTable("mindfulness_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // Practice Type (informal mindfulness)
  practiceType: pgEnum("practice_type", [
    "mindful_eating",
    "mindful_walking",
    "mindful_listening",
    "mindful_breathing",
    "mindful_observation",
    "mindful_movement",
    "mindful_work",
    "mindful_conversation",
    "pause_practice", // Stop and breathe
    "gratitude_practice",
    "loving_kindness_moment"
  ]).notNull(),
  
  duration: integer("duration"), // minutes
  
  // Context
  activity: varchar("activity", { length: 255 }), // What were you doing?
  location: varchar("location", { length: 255 }),
  
  // Quality
  presenceLevel: integer("presence_level"), // 1-10 (how present were you?)
  awarenessLevel: integer("awareness_level"), // 1-10
  
  // Experience
  whatYouNoticed: text("what_you_noticed"),
  howItFelt: text("how_it_felt"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const purposeExplorations = pgTable("purpose_explorations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  explorationDate: timestamp("exploration_date").notNull(),
  
  // Exploration Type (evidence-based purpose discovery)
  explorationType: pgEnum("exploration_type", [
    "ikigai_reflection", // Japanese concept: reason for being
    "values_clarification", // ACT-based
    "life_review", // Narrative therapy
    "peak_experiences", // Maslow
    "legacy_reflection", // What do you want to leave behind?
    "suffering_meaning", // Frankl's logotherapy
    "contribution_mapping", // How do you want to serve?
    "death_meditation", // Memento mori
    "gratitude_reflection",
    "awe_experience" // Keltner's awe research
  ]).notNull(),
  
  // Reflection
  prompt: text("prompt"),
  reflection: text("reflection").notNull(),
  
  // Insights
  insights: text("insights"), // JSON array
  patterns: text("patterns"), // Recurring themes
  
  // Purpose Elements
  passions: text("passions"), // JSON array
  strengths: text("strengths"),
  values: text("values"),
  contribution: text("contribution"), // How you want to serve the world
  
  // Clarity Level
  clarityLevel: integer("clarity_level"), // 1-10 (how clear is your purpose?)
  
  createdAt: timestamp("created_at").defaultNow(),
});


export const compassionPractices = pgTable("compassion_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  practiceType: pgEnum("practice_type", [
    "loving_kindness_self", // Metta for self
    "loving_kindness_loved_one",
    "loving_kindness_neutral",
    "loving_kindness_difficult", // For someone you have conflict with
    "loving_kindness_all_beings",
    "compassion_for_suffering", // Tonglen
    "self_compassion", // Kristin Neff's research
    "forgiveness_practice",
    "acts_of_kindness" // Behavioral compassion
  ]).notNull(),
  
  duration: integer("duration"), // minutes
  
  // Target
  target: varchar("target", { length: 255 }), // Who was the practice directed toward?
  
  // Experience
  emotionBefore: varchar("emotion_before", { length: 255 }),
  emotionAfter: varchar("emotion_after", { length: 255 }),
  
  warmthLevel: integer("warmth_level"), // 1-10 (how much warmth/compassion did you feel?)
  resistanceLevel: integer("resistance_level"), // 1-10 (any resistance or difficulty?)
  
  // Insights
  insights: text("insights"),
  
  // Behavioral Follow-up (for acts of kindness)
  actionTaken: text("action_taken"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const spiritualExperiences = pgTable("spiritual_experiences", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  experienceDate: timestamp("experience_date").notNull(),
  
  experienceType: pgEnum("experience_type", [
    "peak_experience", // Maslow
    "flow_state", // Csikszentmihalyi
    "awe_experience", // Keltner
    "mystical_experience",
    "synchronicity",
    "insight",
    "connection",
    "transcendence",
    "presence",
    "oneness"
  ]).notNull(),
  
  // Context
  context: text("context"), // What were you doing when this happened?
  trigger: varchar("trigger", { length: 255 }), // What triggered it?
  
  // Description
  description: text("description").notNull(),
  
  // Qualities
  intensity: integer("intensity"), // 1-10
  duration: integer("duration"), // minutes or hours
  
  // Impact
  emotionalImpact: integer("emotional_impact"), // 1-10
  meaningfulness: integer("meaningfulness"), // 1-10
  lifeChanging: boolean("life_changing").default(false),
  
  // Integration
  insights: text("insights"),
  howItChangedYou: text("how_it_changed_you"),
  actionsTaken: text("actions_taken"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const spiritualMilestones = pgTable("spiritual_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  milestoneType: pgEnum("milestone_type", [
    "meditation_streak",
    "retreat_completed",
    "practice_deepened",
    "purpose_discovered",
    "forgiveness_achieved",
    "peace_found",
    "compassion_breakthrough",
    "spiritual_awakening",
    "habit_established"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  achievedDate: timestamp("achieved_date"),
  
  // Significance
  significance: text("significance"),
  howYouGrew: text("how_you_grew"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const spiritualEngineAnalytics = pgTable("spiritual_engine_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Practice Effectiveness (aggregated across all users)
  practiceType: varchar("practice_type", { length: 100 }).notNull(),
  
  // Effectiveness Metrics
  avgStressReduction: decimal("avg_stress_reduction", { precision: 5, scale: 2 }), // Average stress reduction
  avgPeaceIncrease: decimal("avg_peace_increase", { precision: 5, scale: 2 }),
  avgCompletionRate: decimal("avg_completion_rate", { precision: 5, scale: 2 }), // % who complete
  
  // Optimal Parameters (learned)
  optimalDuration: integer("optimal_duration"), // minutes
  optimalTimeOfDay: varchar("optimal_time_of_day", { length: 50 }),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: {beginners: 8.5, advanced: 7.2, etc.}
  
  // Sample Size
  sessionCount: integer("session_count"), // How many sessions analyzed
  userCount: integer("user_count"), // How many users
  
  // Last Updated
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From stressSchema.ts
export const stressProfiles = pgTable("stress_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Baseline Metrics
  baselineStressLevel: integer("baseline_stress_level"), // 1-10
  baselineHRV: decimal("baseline_hrv", { precision: 6, scale: 2 }), // milliseconds
  baselineRestingHR: integer("baseline_resting_hr"), // bpm
  
  // Stress Resilience
  stressResilienceScore: integer("stress_resilience_score"), // 0-100
  recoveryCapacity: integer("recovery_capacity"), // 0-100 (how quickly you bounce back)
  
  // Stress Mindset (Kelly McGonigal research)
  stressMindset: pgEnum("stress_mindset", [
    "stress_is_harmful", // Sees stress as purely negative
    "stress_is_enhancing", // Sees stress as growth opportunity
    "mixed"
  ]),
  
  // Dominant Stress Response
  dominantResponse: pgEnum("dominant_response", [
    "fight", // Anger, aggression
    "flight", // Avoidance, escape
    "freeze", // Shutdown, dissociation
    "fawn" // People-pleasing, appeasement
  ]),
  
  // Common Triggers
  commonTriggers: text("common_triggers"), // JSON array
  
  // Physical Symptoms
  commonSymptoms: text("common_symptoms"), // JSON: tension, headaches, etc.
  
  // Preferred Interventions
  preferredInterventions: text("preferred_interventions"), // JSON: what works for this user
  
  // Self-Learning Data
  stressPatterns: text("stress_patterns"), // JSON: when/why stress occurs
  optimalRecoveryTime: integer("optimal_recovery_time"), // minutes
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyStressLogs = pgTable("daily_stress_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  logDate: timestamp("log_date").notNull(),
  
  // Subjective Ratings
  avgStressLevel: integer("avg_stress_level"), // 1-10
  peakStressLevel: integer("peak_stress_level"), // 1-10
  
  // HRV Data (if available)
  morningHRV: decimal("morning_hrv", { precision: 6, scale: 2 }),
  avgHRV: decimal("avg_hrv", { precision: 6, scale: 2 }),
  hrvTrend: pgEnum("hrv_trend", ["improving", "stable", "declining"]),
  
  // Heart Rate
  avgRestingHR: integer("avg_resting_hr"),
  peakHR: integer("peak_hr"),
  
  // Cortisol Pattern (subjective or measured)
  morningCortisol: pgEnum("morning_cortisol", ["low", "normal", "high"]),
  eveningCortisol: pgEnum("evening_cortisol", ["low", "normal", "high"]),
  cortisolRhythm: pgEnum("cortisol_rhythm", ["healthy", "disrupted"]),
  
  // Physical Symptoms
  symptoms: text("symptoms"), // JSON: headache, tension, etc.
  symptomSeverity: integer("symptom_severity"), // 1-10
  
  // Sleep Impact
  sleepQuality: integer("sleep_quality"), // 1-10
  sleepDuration: decimal("sleep_duration", { precision: 4, scale: 2 }),
  
  // Behavioral Indicators
  irritability: integer("irritability"), // 1-10
  concentration: integer("concentration"), // 1-10
  appetite: pgEnum("appetite", ["low", "normal", "high", "stress_eating"]),
  
  // Interventions Used
  interventionsUsed: text("interventions_used"), // JSON array
  interventionEffectiveness: integer("intervention_effectiveness"), // 1-10
  
  // Recovery
  recoveryQuality: integer("recovery_quality"), // 1-10
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const stressEvents = pgTable("stress_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Event Details
  stressLevel: integer("stress_level").notNull(), // 1-10
  eventTimestamp: timestamp("event_timestamp").notNull(),
  
  // Trigger
  trigger: varchar("trigger", { length: 255 }), // What caused this?
  triggerCategory: pgEnum("trigger_category", [
    "work",
    "relationships",
    "financial",
    "health",
    "family",
    "traffic",
    "technology",
    "uncertainty",
    "time_pressure",
    "conflict",
    "other"
  ]),
  
  // Context
  location: varchar("location", { length: 255 }),
  activity: varchar("activity", { length: 255 }),
  socialContext: pgEnum("social_context", ["alone", "with_others", "crowd"]),
  
  // Physical Response
  heartRate: integer("heart_rate"), // if measured
  physicalSymptoms: text("physical_symptoms"), // JSON
  
  // Emotional Response
  primaryEmotion: pgEnum("primary_emotion", [
    "anxiety",
    "anger",
    "frustration",
    "overwhelm",
    "fear",
    "sadness",
    "irritation"
  ]),
  
  // Cognitive Response
  thoughts: text("thoughts"), // What were you thinking?
  cognitiveDistortions: text("cognitive_distortions"), // JSON: catastrophizing, etc.
  
  // Response Type
  responseType: pgEnum("response_type", ["fight", "flight", "freeze", "fawn"]),
  
  // Intervention Taken
  interventionUsed: varchar("intervention_used", { length: 255 }),
  interventionEffective: boolean("intervention_effective"),
  
  // Recovery
  recoveryTime: integer("recovery_time"), // minutes until stress subsided
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const stressTriggers = pgTable("stress_triggers", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Trigger Details
  triggerName: varchar("trigger_name", { length: 255 }).notNull(),
  triggerCategory: varchar("trigger_category", { length: 100 }),
  
  // Frequency
  occurrenceCount: integer("occurrence_count").default(0),
  lastOccurrence: timestamp("last_occurrence"),
  
  // Impact
  avgStressLevel: decimal("avg_stress_level", { precision: 4, scale: 2 }), // 1-10
  avgRecoveryTime: integer("avg_recovery_time"), // minutes
  
  // Patterns
  timePatterns: text("time_patterns"), // JSON: when does this trigger occur?
  contextPatterns: text("context_patterns"), // JSON: where/with whom?
  
  // Avoidability
  avoidable: boolean("avoidable"),
  
  // Coping Strategies
  effectiveStrategies: text("effective_strategies"), // JSON: what works for this trigger
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stressInterventions = pgTable("stress_interventions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Intervention Details
  interventionName: varchar("intervention_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Category
  category: pgEnum("category", [
    "breathing", // Physiological sigh, box breathing, etc.
    "movement", // Exercise, stretching, shaking
    "mindfulness", // Meditation, body scan
    "cognitive", // Reframing, CBT techniques
    "social", // Talk to friend, hug
    "sensory", // Cold water, music, nature
    "rest", // NSDR, nap, relaxation
    "creative", // Art, journaling, music
    "other"
  ]).notNull(),
  
  // Evidence Base
  researchBacked: boolean("research_backed").default(false),
  researchSources: text("research_sources"), // JSON: citations
  
  // Duration
  durationMinutes: integer("duration_minutes"),
  
  // Instructions
  instructions: text("instructions"),
  
  // When to Use
  bestFor: text("best_for"), // JSON: which stress types/levels
  
  // Effectiveness
  avgEffectivenessRating: decimal("avg_effectiveness_rating", { precision: 4, scale: 2 }), // 1-10
  totalUses: integer("total_uses").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userInterventionLogs = pgTable("user_intervention_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  interventionId: varchar("intervention_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Context
  stressEventId: varchar("stress_event_id", { length: 255 }), // Which stress event triggered this?
  stressLevelBefore: integer("stress_level_before"), // 1-10
  
  // Execution
  durationMinutes: integer("duration_minutes"),
  completedFully: boolean("completed_fully").default(true),
  
  // Outcome
  stressLevelAfter: integer("stress_level_after"), // 1-10
  effectivenessRating: integer("effectiveness_rating"), // 1-10
  
  // Side Effects
  sideEffects: text("side_effects"), // Any negative effects?
  
  // Notes
  notes: text("notes"),
  
  usedAt: timestamp("used_at").defaultNow(),
});

export const hrvMeasurements = pgTable("hrv_measurements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Measurement Details
  measurementTime: timestamp("measurement_time").notNull(),
  measurementType: pgEnum("measurement_type", ["morning", "pre_workout", "post_workout", "evening", "random"]),
  
  // HRV Metrics
  rmssd: decimal("rmssd", { precision: 6, scale: 2 }), // Root Mean Square of Successive Differences (gold standard)
  sdnn: decimal("sdnn", { precision: 6, scale: 2 }), // Standard Deviation of NN intervals
  pnn50: decimal("pnn50", { precision: 5, scale: 2 }), // % of successive intervals >50ms
  
  // Heart Rate
  avgHeartRate: integer("avg_heart_rate"),
  
  // Interpretation
  hrvScore: integer("hrv_score"), // 0-100 (normalized for age/sex)
  recoveryStatus: pgEnum("recovery_status", ["recovered", "recovering", "not_recovered"]),
  
  // Context
  sleepQualityPriorNight: integer("sleep_quality_prior_night"), // 1-10
  stressLevelPriorDay: integer("stress_level_prior_day"), // 1-10
  exerciseIntensityPriorDay: pgEnum("exercise_intensity_prior_day", ["none", "light", "moderate", "intense"]),
  
  // Device
  measurementDevice: varchar("measurement_device", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const stressRecoverySessions = pgTable("stress_recovery_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Session Details
  sessionType: pgEnum("session_type", [
    "nsdr", // Non-Sleep Deep Rest
    "yoga_nidra",
    "progressive_relaxation",
    "meditation",
    "breathwork",
    "cold_exposure",
    "sauna",
    "massage",
    "nature_walk",
    "creative_activity"
  ]).notNull(),
  
  // Duration
  durationMinutes: integer("duration_minutes"),
  
  // Pre-Session
  stressLevelBefore: integer("stress_level_before"), // 1-10
  hrvBefore: decimal("hrv_before", { precision: 6, scale: 2 }),
  
  // Post-Session
  stressLevelAfter: integer("stress_level_after"), // 1-10
  hrvAfter: decimal("hrv_after", { precision: 6, scale: 2 }),
  
  // Effectiveness
  recoveryScore: integer("recovery_score"), // 0-100
  
  // Notes
  notes: text("notes"),
  
  sessionDate: timestamp("session_date").defaultNow(),
});

export const stressPredictions = pgTable("stress_predictions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Prediction Type
  predictionType: pgEnum("prediction_type", [
    "stress_spike_risk", // You're likely to experience high stress soon
    "burnout_risk", // You're at risk of burnout
    "recovery_needed", // You need recovery time
    "optimal_intervention" // This intervention will work best
  ]).notNull(),
  
  // Prediction
  prediction: text("prediction"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // %
  
  // Timeframe
  timeframe: varchar("timeframe", { length: 100 }), // "in next 24 hours", "this week"
  
  // Contributing Factors
  factors: text("factors"), // JSON: sleep debt, HRV trend, upcoming events, etc.
  
  // Recommendation
  recommendation: text("recommendation"),
  
  // Validation
  actualOutcome: text("actual_outcome"),
  predictionAccurate: boolean("prediction_accurate"),
  
  createdAt: timestamp("created_at").defaultNow(),
  validatedAt: timestamp("validated_at"),
});

export const stressAnalytics = pgTable("stress_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Intervention Type
  interventionType: varchar("intervention_type", { length: 100 }).notNull(),
  
  // Effectiveness Metrics
  avgStressReduction: decimal("avg_stress_reduction", { precision: 5, scale: 2 }), // % reduction
  avgEffectivenessRating: decimal("avg_effectiveness_rating", { precision: 4, scale: 2 }), // 1-10
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // % of times it worked
  
  // Optimal Parameters
  optimalDuration: integer("optimal_duration"), // minutes
  optimalTiming: varchar("optimal_timing", { length: 100 }), // when to use
  
  // Best For
  mostEffectiveForStressType: text("most_effective_for_stress_type"), // JSON
  mostEffectiveForUserType: text("most_effective_for_user_type"), // JSON
  
  // Sample Size
  userCount: integer("user_count"),
  totalUses: integer("total_uses"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From transformativePrinciplesSchema.ts
export const transformativePrinciplesProfiles = pgTable("transformative_principles_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current State
  overallGrowth: integer("overall_growth"), // 1-10 self-assessment
  
  // Primary Focus
  primaryPrinciple: pgEnum("primary_principle", [
    "discipline",
    "resilience",
    "purpose",
    "presence",
    "gratitude",
    "persistence",
    "compassion",
    "courage",
    "growth",
    "authenticity",
    "connection",
    "wholeness"
  ]),
  
  // Practice Preferences
  preferredPracticeTime: pgEnum("preferred_practice_time", ["morning", "midday", "evening", "night"]),
  practiceFrequency: pgEnum("practice_frequency", ["daily", "weekdays", "custom"]),
  
  // Reminders
  remindersEnabled: boolean("reminders_enabled").default(true),
  reminderTime: varchar("reminder_time", { length: 10 }), // HH:MM format
  
  // Self-Learning Data
  mostImpactfulPrinciples: text("most_impactful_principles"), // JSON: ranked by life impact
  optimalPracticeFormat: text("optimal_practice_format"), // JSON: reading, reflection, action, etc.
  principleLifeCorrelations: text("principle_life_correlations"), // JSON: which principles improve which life areas
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const principles = pgTable("principles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  principleNumber: integer("principle_number").notNull(), // 1-12
  principleName: varchar("principle_name", { length: 255 }).notNull(),
  identityStatement: varchar("identity_statement", { length: 255 }).notNull(), // "I AM..."
  
  // Core Teaching
  coreTeaching: text("core_teaching"), // The main lesson
  whyItMatters: text("why_it_matters"), // Scientific/philosophical basis
  
  // Daily Practice
  dailyPractice: text("daily_practice"), // What to do each day
  reflectionPrompts: text("reflection_prompts"), // JSON array: questions for journaling
  
  // Habit Integration
  keyHabits: text("key_habits"), // JSON array: specific habits that embody this principle
  
  // Real-World Application
  lifeApplications: text("life_applications"), // JSON: how to apply in different life areas
  
  // Research Foundation
  researchBasis: text("research_basis"), // Scientific backing
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const principlePractices = pgTable("principle_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // Which Principle
  principleId: varchar("principle_id", { length: 255 }).notNull(),
  principleNumber: integer("principle_number").notNull(), // 1-12
  
  // Practice Type
  practiceType: pgEnum("practice_type", [
    "reading", // Read the principle
    "reflection", // Journal on prompts
    "action", // Take specific action
    "meditation", // Meditate on principle
    "affirmation", // Repeat identity statement
    "habit_practice" // Practice key habit
  ]).notNull(),
  
  // Engagement
  timeSpent: integer("time_spent"), // minutes
  completed: boolean("completed").default(true),
  
  // Reflection
  reflectionNotes: text("reflection_notes"),
  insights: text("insights"), // What did you learn?
  
  // Application
  actionsTaken: text("actions_taken"), // JSON array: specific actions
  challengesFaced: text("challenges_faced"),
  winsAchieved: text("wins_achieved"),
  
  // Impact
  impactOnDay: integer("impact_on_day"), // 1-10: How much did this principle improve your day?
  embodimentLevel: integer("embodiment_level"), // 1-10: How well did you embody this principle today?
  
  // Mood & State
  moodBefore: varchar("mood_before", { length: 100 }),
  moodAfter: varchar("mood_after", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const principleProgress = pgTable("principle_progress", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  principleId: varchar("principle_id", { length: 255 }).notNull(),
  
  // Mastery Level
  masteryLevel: integer("mastery_level"), // 1-100
  
  // Practice Stats
  totalPractices: integer("total_practices"),
  currentStreak: integer("current_streak"), // days
  longestStreak: integer("longest_streak"), // days
  
  // Embodiment
  avgEmbodimentLevel: decimal("avg_embodiment_level", { precision: 4, scale: 2 }), // Average of embodiment ratings
  
  // Life Impact
  avgLifeImpact: decimal("avg_life_impact", { precision: 4, scale: 2 }),
  
  // Specific Improvements (self-reported)
  lifeAreasImproved: text("life_areas_improved"), // JSON: relationships, career, health, etc.
  
  // Milestones
  milestones: text("milestones"), // JSON array: significant moments of growth
  
  lastPracticed: timestamp("last_practiced"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const identityTransformations = pgTable("identity_transformations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Old Identity
  oldIdentityStatement: text("old_identity_statement"), // "I used to be..."
  oldBehaviors: text("old_behaviors"), // JSON array
  oldBeliefs: text("old_beliefs"), // JSON array
  
  // New Identity (Target)
  newIdentityStatement: text("new_identity_statement"), // "I am becoming..."
  newBehaviors: text("new_behaviors"), // JSON array: behaviors that match new identity
  newBeliefs: text("new_beliefs"), // JSON array
  
  // Supporting Principles
  supportingPrinciples: text("supporting_principles"), // JSON: which principles support this transformation
  
  // Progress
  transformationProgress: integer("transformation_progress"), // 1-100
  
  // Evidence
  evidenceOfChange: text("evidence_of_change"), // JSON array: concrete examples
  
  // Timeline
  startDate: timestamp("start_date"),
  targetDate: timestamp("target_date"),
  
  // Status
  status: pgEnum("status", ["in_progress", "achieved", "evolving"]).default("in_progress"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const weeklyPrincipleReviews = pgTable("weekly_principle_reviews", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  weekStartDate: timestamp("week_start_date").notNull(),
  
  // Overall Week
  overallGrowth: integer("overall_growth"), // 1-10
  
  // Principle of the Week (which one did you focus on most?)
  focusPrinciple: varchar("focus_principle", { length: 255 }),
  
  // Wins
  biggestWins: text("biggest_wins"), // JSON array
  principlesEmbodied: text("principles_embodied"), // JSON: which principles showed up this week
  
  // Challenges
  biggestChallenges: text("biggest_challenges"), // JSON array
  principlesNeeded: text("principles_needed"), // JSON: which principles would have helped
  
  // Insights
  keyInsights: text("key_insights"),
  lessonsLearned: text("lessons_learned"),
  
  // Next Week
  focusForNextWeek: varchar("focus_for_next_week", { length: 255 }), // Which principle to emphasize
  commitments: text("commitments"), // JSON array: specific commitments
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const principleGoals = pgTable("principle_goals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  goalTitle: varchar("goal_title", { length: 255 }).notNull(),
  goalDescription: text("goal_description"),
  
  // Which Principle Does This Goal Embody?
  primaryPrinciple: varchar("primary_principle", { length: 255 }).notNull(),
  supportingPrinciples: text("supporting_principles"), // JSON array
  
  // Identity Connection
  identityStatement: text("identity_statement"), // "Achieving this goal makes me..."
  
  // Target
  targetDate: timestamp("target_date"),
  
  // Milestones
  milestones: text("milestones"), // JSON array: smaller steps
  
  // Progress
  progress: integer("progress"), // 0-100
  
  // Why This Matters
  whyItMatters: text("why_it_matters"),
  
  // Status
  status: pgEnum("status", ["active", "achieved", "abandoned"]).default("active"),
  
  achievedDate: timestamp("achieved_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyAffirmations = pgTable("daily_affirmations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  affirmationDate: timestamp("affirmation_date").notNull(),
  
  // Affirmations Practiced
  affirmations: text("affirmations"), // JSON array: "I am disciplined", "I am resilient", etc.
  
  // How Practiced
  practiceMethod: pgEnum("practice_method", [
    "spoken_aloud",
    "written",
    "visualization",
    "mirror_work",
    "meditation"
  ]),
  
  // Repetitions
  repetitions: integer("repetitions"),
  
  // Belief Level
  beliefLevel: integer("belief_level"), // 1-10: How much do you believe these statements?
  
  // Impact
  impactOnMood: integer("impact_on_mood"), // 1-10
  impactOnBehavior: integer("impact_on_behavior"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const transformativeMoments = pgTable("transformative_moments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  momentDate: timestamp("moment_date").notNull(),
  
  // What Happened
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Which Principle Was Involved
  relatedPrinciple: varchar("related_principle", { length: 255 }),
  
  // Type of Moment
  momentType: pgEnum("moment_type", [
    "breakthrough", // Major insight or realization
    "embodiment", // Fully embodied a principle
    "identity_shift", // Felt a shift in who you are
    "challenge_overcome", // Overcame significant obstacle
    "pattern_broken", // Broke old pattern
    "new_behavior", // Established new behavior
    "peak_experience" // Transcendent moment
  ]).notNull(),
  
  // Impact
  significance: integer("significance"), // 1-10
  lifeAreasAffected: text("life_areas_affected"), // JSON array
  
  // Insights
  insights: text("insights"),
  lessonsLearned: text("lessons_learned"),
  
  // Integration
  howToMaintain: text("how_to_maintain"), // How to keep this alive
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const transformativePrinciplesAnalytics = pgTable("transformative_principles_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Principle Effectiveness (aggregated)
  principleId: varchar("principle_id", { length: 255 }).notNull(),
  
  // Impact Metrics
  avgLifeImpact: decimal("avg_life_impact", { precision: 5, scale: 2 }),
  avgEmbodimentLevel: decimal("avg_embodiment_level", { precision: 5, scale: 2 }),
  
  // Correlation with Life Outcomes
  relationshipImprovement: decimal("relationship_improvement", { precision: 5, scale: 2 }), // % of users who report improvement
  careerImprovement: decimal("career_improvement", { precision: 5, scale: 2 }),
  healthImprovement: decimal("health_improvement", { precision: 5, scale: 2 }),
  mentalHealthImprovement: decimal("mental_health_improvement", { precision: 5, scale: 2 }),
  
  // Optimal Practice
  optimalPracticeFrequency: varchar("optimal_practice_frequency", { length: 100 }),
  optimalPracticeFormat: varchar("optimal_practice_format", { length: 100 }),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  practiceCount: integer("practice_count"),
  userCount: integer("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// From truthKeepersSchema.ts
export const validatedResearch = pgTable("validated_research", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Research Details
  title: varchar("title", { length: 500 }).notNull(),
  authors: text("authors").notNull(), // JSON array
  journal: varchar("journal", { length: 255 }).notNull(),
  publicationYear: integer("publication_year").notNull(),
  doi: varchar("doi", { length: 255 }), // Digital Object Identifier
  pubmedId: varchar("pubmed_id", { length: 50 }),
  url: varchar("url", { length: 500 }),
  
  // Study Type
  studyType: pgEnum("study_type", [
    "meta_analysis",
    "systematic_review",
    "randomized_controlled_trial",
    "cohort_study",
    "case_control_study",
    "cross_sectional_study",
    "case_series",
    "expert_opinion"
  ]).notNull(),
  
  // Evidence Level (Oxford CEBM)
  evidenceLevel: pgEnum("evidence_level", [
    "level_a_high",      // Systematic reviews, meta-analyses, multiple RCTs
    "level_b_moderate",  // Individual RCTs, cohort studies
    "level_c_low",       // Case-control, expert consensus
    "level_d_reject"     // Insufficient evidence - REJECTED
  ]).notNull(),
  
  // Quality Metrics
  sampleSize: integer("sample_size"),
  hasControlGroup: boolean("has_control_group"),
  isRandomized: boolean("is_randomized"),
  isBlinded: boolean("is_blinded"), // Single, double, or triple blind
  hasReplication: boolean("has_replication"), // Multiple independent studies
  effectSize: decimal("effect_size", { precision: 6, scale: 3 }), // Cohen's d, odds ratio, etc.
  pValue: decimal("p_value", { precision: 10, scale: 9 }),
  confidenceInterval: varchar("confidence_interval", { length: 100 }), // "95% CI: 1.2-2.5"
  
  // Journal Quality
  journalImpactFactor: decimal("journal_impact_factor", { precision: 6, scale: 3 }),
  isPeerReviewed: boolean("is_peer_reviewed").notNull(),
  isOpenAccess: boolean("is_open_access"),
  
  // Conflicts of Interest
  hasConflictOfInterest: boolean("has_conflict_of_interest"),
  fundingSource: text("funding_source"), // Who funded the research?
  industrySponsored: boolean("industry_sponsored"),
  
  // Research Domain
  domain: pgEnum("domain", [
    "nutrition",
    "exercise",
    "sleep",
    "mental_health",
    "behavioral_psychology",
    "neuroscience",
    "metabolism",
    "gut_health",
    "stress_management",
    "habit_formation",
    "cognitive_performance",
    "longevity",
    "relationships",
    "spirituality",
    "career_development",
    "financial_psychology"
  ]).notNull(),
  
  // Key Findings
  keyFindings: text("key_findings").notNull(), // Summary of main results
  clinicalSignificance: text("clinical_significance"), // Is it meaningful in real life?
  limitations: text("limitations"), // What are the study's limitations?
  
  // Practical Application
  practicalApplication: text("practical_application"), // How to apply this research
  targetPopulation: text("target_population"), // Who does this apply to?
  contraindications: text("contraindications"), // When NOT to apply this
  
  // Validation Status
  validationStatus: pgEnum("validation_status", [
    "pending_review",
    "approved",
    "rejected",
    "needs_replication",
    "superseded" // Newer research contradicts this
  ]).default("pending_review"),
  
  // Reviewer Info
  reviewedBy: varchar("reviewed_by", { length: 255 }), // Who validated this?
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Usage Tracking
  citationCount: integer("citation_count").default(0), // How many times cited on platform
  recommendationCount: integer("recommendation_count").default(0), // How many recommendations use this
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const platformRecommendations = pgTable("platform_recommendations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Recommendation Details
  recommendationType: pgEnum("recommendation_type", [
    "intervention",      // "Try 4-7-8 breathing for anxiety"
    "protocol",          // "Huberman sleep protocol"
    "habit",             // "Exercise 3x per week"
    "nutrition_advice",  // "Eat 1g protein per lb bodyweight"
    "supplement",        // "Consider magnesium for sleep"
    "behavior_change",   // "Use implementation intentions"
    "mindset_shift",     // "Adopt growth mindset"
    "lifestyle_change"   // "Prioritize sleep over work"
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  howToImplement: text("how_to_implement"), // Step-by-step instructions
  
  // Evidence Backing
  evidenceLevel: pgEnum("evidence_level", [
    "level_a_high",
    "level_b_moderate",
    "level_c_low"
  ]).notNull(),
  
  // Research Citations (Links to validatedResearch table)
  primaryResearchId: varchar("primary_research_id", { length: 255 }).notNull(), // Main supporting study
  supportingResearchIds: text("supporting_research_ids"), // JSON array: additional studies
  
  // Confidence
  confidenceScore: integer("confidence_score"), // 0-100: How confident are we in this recommendation?
  
  // Domain
  domain: varchar("domain", { length: 100 }).notNull(),
  
  // Target Audience
  targetAudience: text("target_audience"), // Who is this for?
  contraindications: text("contraindications"), // Who should NOT do this?
  
  // Effectiveness Tracking (Self-Learning)
  totalUses: integer("total_uses").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // % of users who found it helpful
  avgEffectivenessRating: decimal("avg_effectiveness_rating", { precision: 4, scale: 2 }), // 1-10
  
  // Status
  status: pgEnum("status", [
    "active",
    "under_review",
    "deprecated",      // No longer recommended
    "superseded"       // Replaced by better recommendation
  ]).default("active"),
  
  // Superseded Info
  supersededBy: varchar("superseded_by", { length: 255 }), // ID of newer recommendation
  supersededReason: text("superseded_reason"), // Why was this replaced?
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }),
});

export const researchMonitoring = pgTable("research_monitoring", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // What to Monitor
  topic: varchar("topic", { length: 255 }).notNull(),
  keywords: text("keywords"), // JSON array: search terms
  domain: varchar("domain", { length: 100 }),
  
  // Monitoring Config
  monitoringFrequency: pgEnum("monitoring_frequency", [
    "daily",
    "weekly",
    "monthly"
  ]).default("weekly"),
  
  // Alert Thresholds
  alertOnHighQuality: boolean("alert_on_high_quality").default(true), // Alert when Level A research found
  alertOnContradiction: boolean("alert_on_contradiction").default(true), // Alert when research contradicts current recommendations
  
  // Last Check
  lastCheckedAt: timestamp("last_checked_at"),
  newStudiesFound: integer("new_studies_found").default(0),
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pseudoscienceBlocklist = pgTable("pseudoscience_blocklist", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Blocked Claim
  claim: text("claim").notNull(),
  category: pgEnum("category", [
    "unproven_supplement",
    "debunked_theory",
    "dangerous_practice",
    "misleading_claim",
    "anecdotal_only",
    "conflict_of_interest",
    "cherry_picked_data",
    "correlation_not_causation"
  ]).notNull(),
  
  // Why Blocked
  reason: text("reason").notNull(),
  evidenceAgainst: text("evidence_against"), // Research that debunks this
  
  // Severity
  severity: pgEnum("severity", [
    "dangerous",   // Could cause harm
    "misleading",  // False but not harmful
    "unproven"     // Just lacks evidence
  ]).notNull(),
  
  // Action
  action: pgEnum("action", [
    "hard_block",  // Never allow
    "flag_review", // Flag for human review
    "show_warning" // Allow but warn user
  ]).notNull(),
  
  // Detection
  detectionCount: integer("detection_count").default(0), // How many times detected
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }),
});

export const researchQualityReviews = pgTable("research_quality_reviews", {
  id: varchar("id", { length: 255 }).primaryKey(),
  researchId: varchar("research_id", { length: 255 }).notNull(),
  
  // Reviewer
  reviewerId: varchar("reviewer_id", { length: 255 }).notNull(),
  reviewerName: varchar("reviewer_name", { length: 255 }),
  reviewerCredentials: text("reviewer_credentials"), // PhD, MD, etc.
  
  // Quality Assessment
  methodologyScore: integer("methodology_score"), // 1-10
  sampleSizeAdequate: boolean("sample_size_adequate"),
  statisticalRigor: integer("statistical_rigor"), // 1-10
  clinicalRelevance: integer("clinical_relevance"), // 1-10
  replicationStatus: pgEnum("replication_status", [
    "replicated",
    "not_replicated",
    "needs_replication",
    "unknown"
  ]),
  
  // Bias Assessment
  selectionBias: boolean("selection_bias"),
  publicationBias: boolean("publication_bias"),
  confirmationBias: boolean("confirmation_bias"),
  
  // Overall Assessment
  overallQuality: pgEnum("overall_quality", [
    "excellent",
    "good",
    "fair",
    "poor"
  ]).notNull(),
  
  // Recommendation
  recommendForPlatform: boolean("recommend_for_platform").notNull(),
  recommendedEvidenceLevel: pgEnum("recommended_evidence_level", [
    "level_a_high",
    "level_b_moderate",
    "level_c_low",
    "level_d_reject"
  ]).notNull(),
  
  // Notes
  reviewNotes: text("review_notes"),
  concerns: text("concerns"),
  
  reviewedAt: timestamp("reviewed_at").defaultNow(),
});


// From visualizationSchema.ts
export const visualizationProfiles = pgTable("visualization_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Dashboard Preferences
  defaultDashboard: pgEnum("default_dashboard", [
    "overview", // All areas at a glance
    "wellness", // Physical, mental, emotional, spiritual
    "goals", // Goal progress
    "habits", // Habit tracking
    "trends", // Long-term trends
    "custom" // User-defined
  ]).default("overview"),
  
  // Chart Preferences
  preferredChartTypes: text("preferred_chart_types"), // JSON: line, bar, heatmap, etc.
  
  // Time Range Preferences
  defaultTimeRange: pgEnum("default_time_range", [
    "week",
    "month",
    "quarter",
    "year",
    "all_time"
  ]).default("month"),
  
  // Comparison Preferences
  showComparisons: boolean("show_comparisons").default(true), // Compare to previous periods
  showTrendlines: boolean("show_trendlines").default(true),
  showGoalLines: boolean("show_goal_lines").default(true),
  
  // Self-Learning Data
  mostViewedCharts: text("most_viewed_charts"), // JSON: which charts user checks most
  mostActionableCharts: text("most_actionable_charts"), // JSON: which charts drive behavior
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dashboardConfigurations = pgTable("dashboard_configurations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Dashboard Details
  dashboardName: varchar("dashboard_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Layout
  layout: text("layout"), // JSON: grid layout configuration
  
  // Widgets
  widgets: text("widgets"), // JSON: array of widget configurations
  
  // Default
  isDefault: boolean("is_default").default(false),
  
  // Sharing
  isPublic: boolean("is_public").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const visualizationWidgets = pgTable("visualization_widgets", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Widget Details
  widgetName: varchar("widget_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Widget Type
  widgetType: pgEnum("widget_type", [
    "line_chart",
    "bar_chart",
    "area_chart",
    "pie_chart",
    "donut_chart",
    "heatmap",
    "calendar_view",
    "progress_bar",
    "radial_chart",
    "timeline",
    "scorecard",
    "table",
    "custom"
  ]).notNull(),
  
  // Data Source
  dataSource: varchar("data_source", { length: 255 }).notNull(), // habits, goals, sleep, etc.
  dataQuery: text("data_query"), // JSON: how to fetch the data
  
  // Configuration
  configuration: text("configuration"), // JSON: chart-specific settings
  
  // Refresh
  refreshInterval: integer("refresh_interval"), // seconds (null = manual refresh)
  
  // Popularity
  totalUses: integer("total_uses").default(0),
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const progressSnapshots = pgTable("progress_snapshots", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  snapshotDate: timestamp("snapshot_date").notNull(),
  
  // Overall Wellness (0-100 for each)
  overallScore: integer("overall_score"),
  physicalScore: integer("physical_score"),
  mentalScore: integer("mental_score"),
  emotionalScore: integer("emotional_score"),
  spiritualScore: integer("spiritual_score"),
  
  // Habits
  habitCompletionRate: decimal("habit_completion_rate", { precision: 5, scale: 2 }), // %
  activeHabits: integer("active_habits"),
  
  // Goals
  goalsOnTrack: integer("goals_on_track"),
  goalsAtRisk: integer("goals_at_risk"),
  goalsAchievedThisPeriod: integer("goals_achieved_this_period"),
  
  // Sleep
  avgSleepDuration: decimal("avg_sleep_duration", { precision: 4, scale: 2 }),
  avgSleepQuality: decimal("avg_sleep_quality", { precision: 4, scale: 2 }),
  
  // Stress
  avgStressLevel: decimal("avg_stress_level", { precision: 4, scale: 2 }),
  avgHRV: decimal("avg_hrv", { precision: 6, scale: 2 }),
  
  // Mood & Energy
  avgMood: decimal("avg_mood", { precision: 4, scale: 2 }),
  avgEnergy: decimal("avg_energy", { precision: 4, scale: 2 }),
  
  // Engagement
  daysActive: integer("days_active"),
  journalEntries: integer("journal_entries"),
  
  // Achievements
  achievementsUnlocked: integer("achievements_unlocked"),
  experiencePoints: integer("experience_points"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const trendData = pgTable("trend_data", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Metric
  metricName: varchar("metric_name", { length: 255 }).notNull(),
  metricCategory: varchar("metric_category", { length: 100 }), // habits, sleep, stress, etc.
  
  // Time Period
  periodType: pgEnum("period_type", ["daily", "weekly", "monthly"]).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Value
  value: decimal("value", { precision: 10, scale: 2 }),
  
  // Trend
  trendDirection: pgEnum("trend_direction", ["up", "down", "stable"]),
  changePercent: decimal("change_percent", { precision: 6, scale: 2 }), // % vs previous period
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const heatmapData = pgTable("heatmap_data", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Heatmap Type
  heatmapType: pgEnum("heatmap_type", [
    "habit_consistency", // Calendar view of habit completion
    "mood_patterns", // Mood by day of week / time of day
    "energy_patterns", // Energy by day of week / time of day
    "stress_patterns", // Stress by day of week / time of day
    "productivity_patterns" // Productivity by day of week / time of day
  ]).notNull(),
  
  // Date
  date: timestamp("date").notNull(),
  
  // Intensity (0-100)
  intensity: integer("intensity"),
  
  // Context
  dayOfWeek: integer("day_of_week"), // 0-6 (Sunday-Saturday)
  hourOfDay: integer("hour_of_day"), // 0-23
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const milestoneVisualizations = pgTable("milestone_visualizations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Timeline Type
  timelineType: pgEnum("timeline_type", [
    "goal_journey", // Path to a specific goal
    "transformation_journey", // Overall transformation
    "habit_mastery", // Journey to habit mastery
    "wellness_journey" // Wellness improvement
  ]).notNull(),
  
  // Related Entity
  relatedId: varchar("related_id", { length: 255 }), // Goal ID, habit ID, etc.
  
  // Milestones
  milestones: text("milestones"), // JSON: array of milestone objects with dates
  
  // Current Position
  currentPosition: decimal("current_position", { precision: 5, scale: 2 }), // % along timeline
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comparisonViews = pgTable("comparison_views", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Comparison Type
  comparisonType: pgEnum("comparison_type", [
    "week_over_week",
    "month_over_month",
    "quarter_over_quarter",
    "year_over_year",
    "best_vs_current",
    "baseline_vs_current"
  ]).notNull(),
  
  // Metric
  metric: varchar("metric", { length: 255 }).notNull(),
  
  // Current Period
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  
  // Comparison Period
  comparisonPeriodStart: timestamp("comparison_period_start").notNull(),
  comparisonPeriodEnd: timestamp("comparison_period_end").notNull(),
  comparisonValue: decimal("comparison_value", { precision: 10, scale: 2 }),
  
  // Change
  absoluteChange: decimal("absolute_change", { precision: 10, scale: 2 }),
  percentChange: decimal("percent_change", { precision: 6, scale: 2 }),
  
  // Interpretation
  interpretation: pgEnum("interpretation", ["improved", "stable", "declined"]),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const progressCelebrations = pgTable("progress_celebrations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Celebration Type
  celebrationType: pgEnum("celebration_type", [
    "goal_achieved",
    "milestone_reached",
    "streak_milestone",
    "level_up",
    "achievement_unlocked",
    "personal_best",
    "transformation_marker"
  ]).notNull(),
  
  // Details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Visual
  icon: varchar("icon", { length: 255 }),
  color: varchar("color", { length: 50 }),
  animation: varchar("animation", { length: 100 }),
  
  // Context
  relatedId: varchar("related_id", { length: 255 }),
  relatedType: varchar("related_type", { length: 100 }),
  
  // Display
  displayed: boolean("displayed").default(false),
  displayedAt: timestamp("displayed_at"),
  
  celebrationDate: timestamp("celebration_date").defaultNow(),
});

export const chartInteractions = pgTable("chart_interactions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  widgetId: varchar("widget_id", { length: 255 }),
  
  // Interaction Type
  interactionType: pgEnum("interaction_type", [
    "viewed",
    "clicked",
    "filtered",
    "exported",
    "shared",
    "customized"
  ]).notNull(),
  
  // Duration
  viewDuration: integer("view_duration"), // seconds
  
  // Action Taken
  actionTaken: boolean("action_taken").default(false), // Did they change behavior after viewing?
  actionType: varchar("action_type", { length: 100 }),
  
  interactionTimestamp: timestamp("interaction_timestamp").defaultNow(),
});

export const visualizationAnalytics = pgTable("visualization_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Widget Type
  widgetType: varchar("widget_type", { length: 100 }).notNull(),
  
  // Engagement Metrics
  avgViewDuration: decimal("avg_view_duration", { precision: 6, scale: 2 }), // seconds
  avgViewsPerUser: decimal("avg_views_per_user", { precision: 6, scale: 2 }),
  
  // Effectiveness Metrics
  actionRate: decimal("action_rate", { precision: 5, scale: 2 }), // % who took action after viewing
  avgBehaviorChange: decimal("avg_behavior_change", { precision: 5, scale: 2 }), // % improvement
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  
  // Optimal Parameters
  optimalTimeRange: varchar("optimal_time_range", { length: 100 }),
  optimalUpdateFrequency: varchar("optimal_update_frequency", { length: 100 }),
  
  // Best For
  mostEffectiveFor: text("most_effective_for"), // JSON: user types, metrics
  
  // Sample Size
  userCount: integer("user_count"),
  totalViews: integer("total_views"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customReports = pgTable("custom_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Report Details
  reportName: varchar("report_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Report Type
  reportType: pgEnum("report_type", [
    "progress_summary",
    "goal_review",
    "wellness_assessment",
    "habit_analysis",
    "correlation_report",
    "custom"
  ]).notNull(),
  
  // Configuration
  metrics: text("metrics"), // JSON: which metrics to include
  timeRange: text("time_range"), // JSON: date range
  visualizations: text("visualizations"), // JSON: which charts to include
  
  // Schedule
  scheduled: boolean("scheduled").default(false),
  scheduleFrequency: pgEnum("schedule_frequency", ["daily", "weekly", "monthly"]),
  
  // Export
  exportFormat: pgEnum("export_format", ["pdf", "csv", "json"]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportGenerations = pgTable("report_generations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  reportId: varchar("report_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Generation Details
  generatedAt: timestamp("generated_at").defaultNow(),
  
  // Data
  reportData: text("report_data"), // JSON: the actual report content
  
  // File
  filePath: varchar("file_path", { length: 500 }), // If exported
  
  // Status
  status: pgEnum("status", ["generating", "completed", "failed"]).default("generating"),
  
  createdAt: timestamp("created_at").defaultNow(),
});


// From youngMenSchema.ts
export const youngMenProfiles = pgTable("young_men_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  age: integer("age").notNull(),
  
  // Life Situation
  livingSituation: pgEnum("living_situation", ["with_parents", "single_parent_home", "foster_care", "independent", "homeless", "other"]),
  educationStatus: pgEnum("education_status", ["in_school", "dropped_out", "graduated_hs", "in_college", "working"]),
  employmentStatus: pgEnum("employment_status", ["student", "employed", "unemployed", "seeking_work"]),
  
  // Role Model Situation
  hasFatherFigure: boolean("has_father_figure").default(false),
  hasMotherFigure: boolean("has_mother_figure").default(false),
  hasMentor: boolean("has_mentor").default(false),
  hasMaleRoleModel: boolean("has_male_role_model").default(false),
  
  roleModelGaps: text("role_model_gaps"), // JSON array: what's missing
  
  // Primary Needs (based on 40 Developmental Assets)
  primaryNeeds: text("primary_needs"), // JSON array: ["guidance", "emotional_support", "life_skills", "career_advice", etc.]
  
  // Goals
  primaryGoal: pgEnum("primary_goal", [
    "find_direction",
    "build_confidence",
    "learn_life_skills",
    "career_guidance",
    "emotional_regulation",
    "healthy_relationships",
    "financial_independence",
    "overcome_trauma"
  ]).notNull(),
  
  specificGoals: text("specific_goals"), // JSON array
  
  // Challenges
  mainChallenges: text("main_challenges"), // JSON array
  
  // Strengths (asset-based approach)
  strengths: text("strengths"), // JSON array
  interests: text("interests"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const developmentalAssets = pgTable("developmental_assets", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // EXTERNAL ASSETS
  // Support (4 assets)
  familySupport: integer("family_support"), // 1-10
  positiveFamilyCommunication: integer("positive_family_communication"),
  otherAdultRelationships: integer("other_adult_relationships"),
  caringNeighborhood: integer("caring_neighborhood"),
  
  // Empowerment (4 assets)
  communityValuesYouth: integer("community_values_youth"),
  youthAsResources: integer("youth_as_resources"),
  serviceToOthers: integer("service_to_others"),
  safety: integer("safety"),
  
  // Boundaries & Expectations (6 assets)
  familyBoundaries: integer("family_boundaries"),
  schoolBoundaries: integer("school_boundaries"),
  neighborhoodBoundaries: integer("neighborhood_boundaries"),
  adultRoleModels: integer("adult_role_models"),
  positiveInfluence: integer("positive_peer_influence"),
  highExpectations: integer("high_expectations"),
  
  // Constructive Use of Time (4 assets)
  creativeActivities: integer("creative_activities"),
  youthPrograms: integer("youth_programs"),
  religiousCommunity: integer("religious_community"),
  timeAtHome: integer("time_at_home"),
  
  // INTERNAL ASSETS
  // Commitment to Learning (5 assets)
  achievementMotivation: integer("achievement_motivation"),
  schoolEngagement: integer("school_engagement"),
  homework: integer("homework"),
  bondingToSchool: integer("bonding_to_school"),
  readingForPleasure: integer("reading_for_pleasure"),
  
  // Positive Values (6 assets)
  caring: integer("caring"),
  equality: integer("equality"),
  socialJustice: integer("social_justice"),
  integrity: integer("integrity"),
  honesty: integer("honesty"),
  responsibility: integer("responsibility"),
  restraint: integer("restraint"),
  
  // Social Competencies (5 assets)
  planningDecisionMaking: integer("planning_decision_making"),
  interpersonalCompetence: integer("interpersonal_competence"),
  culturalCompetence: integer("cultural_competence"),
  resistanceSkills: integer("resistance_skills"),
  peacefulConflictResolution: integer("peaceful_conflict_resolution"),
  
  // Positive Identity (4 assets)
  personalPower: integer("personal_power"),
  selfEsteem: integer("self_esteem"),
  senseOfPurpose: integer("sense_of_purpose"),
  positiveViewOfFuture: integer("positive_view_of_future"),
  
  // Overall Score
  totalAssets: integer("total_assets"), // Sum of all assets
  
  assessmentDate: timestamp("assessment_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lifeSkillsDevelopment = pgTable("life_skills_development", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  skillCategory: pgEnum("skill_category", [
    "financial_literacy",
    "cooking_nutrition",
    "personal_hygiene",
    "home_maintenance",
    "car_maintenance",
    "time_management",
    "communication",
    "conflict_resolution",
    "job_skills",
    "emotional_regulation"
  ]).notNull(),
  
  skillName: varchar("skill_name", { length: 255 }).notNull(),
  
  // Current Level
  currentLevel: pgEnum("current_level", ["none", "beginner", "intermediate", "proficient"]),
  targetLevel: pgEnum("target_level", ["beginner", "intermediate", "proficient", "expert"]),
  
  // Learning Resources
  learningMethod: pgEnum("learning_method", ["video_tutorial", "mentor_teaching", "practice", "course", "reading"]),
  resources: text("resources"), // JSON array
  
  // Practice Log
  practiceCount: integer("practice_count").default(0),
  lastPracticed: timestamp("last_practiced"),
  
  // Mastery
  masteryAchieved: boolean("mastery_achieved").default(false),
  masteryDate: timestamp("mastery_date"),
  
  status: pgEnum("status", ["not_started", "learning", "practicing", "mastered"]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mentorshipConnections = pgTable("mentorship_connections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  mentorType: pgEnum("mentor_type", [
    "platform_mentor", // Matched through platform
    "real_life_mentor", // External mentor they're tracking
    "virtual_role_model", // Public figure they follow
    "peer_mentor" // Older peer
  ]).notNull(),
  
  mentorName: varchar("mentor_name", { length: 255 }),
  mentorArea: varchar("mentor_area", { length: 255 }), // What they mentor in
  
  // Connection Details
  connectionDate: timestamp("connection_date"),
  meetingFrequency: pgEnum("meeting_frequency", ["weekly", "biweekly", "monthly", "as_needed"]),
  
  // Focus Areas
  focusAreas: text("focus_areas"), // JSON array
  
  // Progress
  sessionsCompleted: integer("sessions_completed").default(0),
  lastMeeting: timestamp("last_meeting"),
  nextMeeting: timestamp("next_meeting"),
  
  // Impact
  impactRating: integer("impact_rating"), // 1-10
  keyLearnings: text("key_learnings"), // JSON array
  
  status: pgEnum("status", ["active", "on_hold", "completed"]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const masculinityReflections = pgTable("masculinity_reflections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  reflectionDate: timestamp("reflection_date").notNull(),
  
  // Reflection Prompts (evidence-based)
  promptType: pgEnum("prompt_type", [
    "what_is_a_man", // Defining healthy masculinity
    "role_models", // Who do you look up to and why?
    "emotions", // How do you handle emotions?
    "relationships", // How do you show care?
    "strength", // What does strength mean?
    "vulnerability", // When is it okay to be vulnerable?
    "responsibility", // What are you responsible for?
    "purpose" // What's your mission?
  ]).notNull(),
  
  reflection: text("reflection").notNull(),
  
  // Insights
  insights: text("insights"),
  actionSteps: text("action_steps"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeCompletions = pgTable("challenge_completions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  challengeCategory: pgEnum("challenge_category", [
    "physical", // Fitness challenge
    "mental", // Learning challenge
    "emotional", // Vulnerability challenge
    "social", // Connection challenge
    "service", // Help others challenge
    "financial", // Money management challenge
    "creative" // Create something challenge
  ]).notNull(),
  
  challengeName: varchar("challenge_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Completion
  startDate: timestamp("start_date"),
  completionDate: timestamp("completion_date"),
  
  // Reflection
  whatYouLearned: text("what_you_learned"),
  howYouGrew: text("how_you_grew"),
  
  // Recognition
  badgeEarned: varchar("badge_earned", { length: 255 }),
  
  status: pgEnum("status", ["in_progress", "completed", "abandoned"]),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const youngMenMilestones = pgTable("young_men_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  milestoneType: pgEnum("milestone_type", [
    "first_job",
    "financial_independence",
    "moved_out",
    "graduated",
    "learned_critical_skill",
    "overcame_fear",
    "helped_someone",
    "found_purpose",
    "built_discipline"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  achievedDate: timestamp("achieved_date"),
  
  // Significance
  whyItMatters: text("why_it_matters"),
  whoYouBecame: text("who_you_became"), // Identity shift
  
  createdAt: timestamp("created_at").defaultNow(),
});


