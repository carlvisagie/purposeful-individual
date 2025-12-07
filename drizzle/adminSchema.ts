/**
 * ADMIN & SUPPORT SYSTEM
 * Platform administration, user support, and operational management
 * 
 * CORE PRINCIPLES:
 * 1. Role-Based Access Control (RBAC)
 * 2. Audit Everything (complete transparency)
 * 3. User-First Support (empathy & efficiency)
 * 4. Data-Driven Decisions (metrics & insights)
 * 5. Proactive Monitoring (prevent issues)
 * 6. Continuous Improvement (learn from tickets)
 * 
 * ADMIN CAPABILITIES:
 * - User management
 * - Content moderation
 * - System monitoring
 * - Feature flags
 * - Analytics & reporting
 * - Support ticket management
 * 
 * SUPPORT FEATURES:
 * - Help desk ticketing
 * - Live chat
 * - Knowledge base
 * - User feedback
 * - Bug reporting
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Admin Users
export const adminUsers = mysqlTable("admin_users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // Role
  role: mysqlEnum("role", [
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

// Admin Actions (Audit Trail)
export const adminActions = mysqlTable("admin_actions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  adminUserId: varchar("admin_user_id", { length: 255 }).notNull(),
  
  // Action Details
  actionType: varchar("action_type", { length: 100 }).notNull(),
  actionCategory: mysqlEnum("action_category", [
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

// Support Tickets
export const supportTickets = mysqlTable("support_tickets", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Ticket Details
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  subject: varchar("subject", { length: 500 }).notNull(),
  description: text("description"),
  
  // Category
  category: mysqlEnum("category", [
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
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Status
  status: mysqlEnum("status", [
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
  satisfactionRating: int("satisfaction_rating"), // 1-5
  satisfactionFeedback: text("satisfaction_feedback"),
  
  // SLA
  firstResponseAt: timestamp("first_response_at"),
  firstResponseSLA: int("first_response_sla"), // minutes
  resolutionSLA: int("resolution_sla"), // minutes
  slaBreached: boolean("sla_breached").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

// Ticket Messages
export const ticketMessages = mysqlTable("ticket_messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  ticketId: varchar("ticket_id", { length: 255 }).notNull(),
  
  // Sender
  senderId: varchar("sender_id", { length: 255 }).notNull(),
  senderType: mysqlEnum("sender_type", ["user", "admin", "system"]).notNull(),
  
  // Message
  message: text("message").notNull(),
  
  // Attachments
  attachments: text("attachments"), // JSON: file URLs
  
  // Internal Note
  internalNote: boolean("internal_note").default(false), // Only visible to admins
  
  sentAt: timestamp("sent_at").defaultNow(),
});

// Knowledge Base Articles
export const knowledgeBaseArticles = mysqlTable("knowledge_base_articles", {
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
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  
  // Author
  authorId: varchar("author_id", { length: 255 }),
  
  // Visibility
  public: boolean("public").default(true),
  
  // Helpfulness
  helpfulCount: int("helpful_count").default(0),
  notHelpfulCount: int("not_helpful_count").default(0),
  
  // Views
  viewCount: int("view_count").default(0),
  
  publishedAt: timestamp("published_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Article Feedback
export const articleFeedback = mysqlTable("article_feedback", {
  id: varchar("id", { length: 255 }).primaryKey(),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  
  // Feedback
  helpful: boolean("helpful").notNull(),
  feedback: text("feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// User Feedback
export const userFeedback = mysqlTable("user_feedback", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Feedback Type
  feedbackType: mysqlEnum("feedback_type", [
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
  status: mysqlEnum("status", [
    "new",
    "under_review",
    "planned",
    "in_progress",
    "completed",
    "declined"
  ]).default("new"),
  
  // Votes
  upvotes: int("upvotes").default(0),
  
  // Response
  adminResponse: text("admin_response"),
  respondedAt: timestamp("responded_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bug Reports
export const bugReports = mysqlTable("bug_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }),
  
  // Bug Details
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  stepsToReproduce: text("steps_to_reproduce"),
  expectedBehavior: text("expected_behavior"),
  actualBehavior: text("actual_behavior"),
  
  // Severity
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  
  // Environment
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  deviceType: varchar("device_type", { length: 100 }),
  
  // Attachments
  screenshots: text("screenshots"), // JSON: URLs
  logs: text("logs"),
  
  // Status
  status: mysqlEnum("status", [
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

// Feature Flags (Admin-Controlled)
export const featureFlags = mysqlTable("feature_flags", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Flag Details
  flagName: varchar("flag_name", { length: 255 }).notNull().unique(),
  description: text("description"),
  
  // Status
  enabled: boolean("enabled").default(false),
  
  // Rollout
  rolloutPercentage: int("rollout_percentage").default(0), // 0-100
  
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

// System Announcements
export const systemAnnouncements = mysqlTable("system_announcements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Announcement Details
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  
  // Type
  announcementType: mysqlEnum("announcement_type", [
    "maintenance",
    "new_feature",
    "update",
    "alert",
    "info"
  ]).notNull(),
  
  // Severity
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info"),
  
  // Visibility
  targetAudience: mysqlEnum("target_audience", ["all_users", "specific_users", "admins"]).default("all_users"),
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

// User Reports (Content Moderation)
export const userReports = mysqlTable("user_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  reportedBy: varchar("reported_by", { length: 255 }).notNull(),
  
  // Reported Content
  reportedType: mysqlEnum("reported_type", [
    "user",
    "post",
    "comment",
    "message",
    "other"
  ]).notNull(),
  reportedId: varchar("reported_id", { length: 255 }).notNull(),
  
  // Reason
  reason: mysqlEnum("reason", [
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
  status: mysqlEnum("status", [
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

// Platform Metrics (Admin Dashboard)
export const platformMetrics = mysqlTable("platform_metrics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  metricDate: timestamp("metric_date").notNull(),
  
  // User Metrics
  totalUsers: int("total_users"),
  activeUsers: int("active_users"),
  newUsers: int("new_users"),
  churnedUsers: int("churned_users"),
  
  // Engagement Metrics
  avgSessionDuration: decimal("avg_session_duration", { precision: 10, scale: 2 }), // seconds
  avgDailyActiveUsers: int("avg_daily_active_users"),
  avgWeeklyActiveUsers: int("avg_weekly_active_users"),
  avgMonthlyActiveUsers: int("avg_monthly_active_users"),
  
  // Content Metrics
  totalGoals: int("total_goals"),
  totalHabits: int("total_habits"),
  totalJournalEntries: int("total_journal_entries"),
  
  // Support Metrics
  openTickets: int("open_tickets"),
  avgTicketResolutionTime: decimal("avg_ticket_resolution_time", { precision: 10, scale: 2 }), // hours
  avgSatisfactionRating: decimal("avg_satisfaction_rating", { precision: 4, scale: 2 }),
  
  // System Metrics
  apiRequests: int("api_requests"),
  avgResponseTime: decimal("avg_response_time", { precision: 8, scale: 2 }), // milliseconds
  errorRate: decimal("error_rate", { precision: 5, scale: 2 }), // %
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Notifications
export const adminNotifications = mysqlTable("admin_notifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Notification Type
  notificationType: mysqlEnum("notification_type", [
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
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Status
  read: boolean("read").default(false),
  readAt: timestamp("read_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});
