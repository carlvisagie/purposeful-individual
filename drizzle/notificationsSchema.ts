/**
 * NOTIFICATION & REMINDER SYSTEM
 * Evidence-based approach using Behavioral Nudges, Timing Optimization, and Notification Science
 * Research sources: BJ Fogg (triggers & prompts), Daniel Kahneman (attention & timing),
 * Eyal Nir (external triggers), Thaler & Sunstein (nudge theory), notification fatigue research,
 * optimal timing research, context-aware computing
 * 
 * CORE PRINCIPLES:
 * 1. Timely > Frequent (right time beats more notifications)
 * 2. Personalized > Generic (context matters)
 * 3. Actionable > Informational (enable action)
 * 4. Respectful > Intrusive (user control)
 * 5. Smart Batching (reduce notification fatigue)
 * 6. Multi-Channel (email, push, SMS, in-app)
 * 
 * NOTIFICATION TYPES:
 * - Reminders (habit, goal, task)
 * - Encouragement (motivation boost)
 * - Celebration (achievement unlocked)
 * - Insights (pattern detected)
 * - Alerts (streak at risk, goal deadline)
 * - Social (community activity, support)
 * - System (updates, maintenance)
 * 
 * TIMING OPTIMIZATION:
 * - Learn optimal times per user
 * - Respect quiet hours
 * - Batch non-urgent notifications
 * - Context-aware (don't interrupt deep work)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Identifies optimal notification times
 * - Learns which notification types drive action
 * - Predicts notification fatigue
 * - Personalizes frequency & channels
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Notification Profiles
export const notificationProfiles = mysqlTable("notification_profiles", {
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
  batchingWindow: int("batching_window").default(60), // minutes
  
  // Frequency
  maxNotificationsPerDay: int("max_notifications_per_day").default(10),
  
  // Self-Learning Data
  optimalTimes: text("optimal_times"), // JSON: best times to send notifications
  effectiveChannels: text("effective_channels"), // JSON: which channels drive action
  notificationFatigueRisk: int("notification_fatigue_risk"), // 0-100
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification Preferences (By Type)
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Notification Type
  notificationType: mysqlEnum("notification_type", [
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
  frequency: mysqlEnum("frequency", ["realtime", "daily_digest", "weekly_digest", "never"]).default("realtime"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Notification Details
  notificationType: mysqlEnum("notification_type", [
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
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Delivery
  channels: text("channels"), // JSON: which channels to use
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for"),
  
  // Status
  status: mysqlEnum("status", [
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

// Reminders
export const reminders = mysqlTable("reminders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Reminder Details
  reminderType: mysqlEnum("reminder_type", [
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
  scheduleType: mysqlEnum("schedule_type", [
    "once", // One-time reminder
    "daily", // Every day
    "weekly", // Specific days of week
    "monthly", // Specific day of month
    "custom" // Custom recurrence
  ]).notNull(),
  
  // Timing
  reminderTime: varchar("reminder_time", { length: 10 }), // "14:30"
  daysOfWeek: text("days_of_week"), // JSON: [1,3,5] for Mon, Wed, Fri
  dayOfMonth: int("day_of_month"), // 1-31
  
  // Custom Recurrence
  customRecurrence: text("custom_recurrence"), // JSON: complex recurrence rules
  
  // Lead Time
  leadTimeMinutes: int("lead_time_minutes"), // Remind X minutes before
  
  // Snooze
  snoozeEnabled: boolean("snooze_enabled").default(true),
  snoozeDurationMinutes: int("snooze_duration_minutes").default(10),
  
  // Status
  active: boolean("active").default(true),
  
  // Next Occurrence
  nextOccurrence: timestamp("next_occurrence"),
  
  // Stats
  totalSent: int("total_sent").default(0),
  totalCompleted: int("total_completed").default(0),
  totalSnoozed: int("total_snoozed").default(0),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // %
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reminder Occurrences
export const reminderOccurrences = mysqlTable("reminder_occurrences", {
  id: varchar("id", { length: 255 }).primaryKey(),
  reminderId: varchar("reminder_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Occurrence Details
  scheduledFor: timestamp("scheduled_for").notNull(),
  
  // Status
  status: mysqlEnum("status", [
    "pending",
    "sent",
    "completed",
    "snoozed",
    "missed",
    "cancelled"
  ]).default("pending"),
  
  // Snooze
  snoozedUntil: timestamp("snoozed_until"),
  snoozeCount: int("snooze_count").default(0),
  
  // Completion
  completedAt: timestamp("completed_at"),
  
  // Notification
  notificationId: varchar("notification_id", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification Batches
export const notificationBatches = mysqlTable("notification_batches", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Batch Details
  batchType: mysqlEnum("batch_type", ["daily_digest", "weekly_digest", "smart_batch"]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  
  // Notifications
  notificationCount: int("notification_count").default(0),
  
  // Delivery
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  
  // Status
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Push Tokens (for mobile push notifications)
export const pushTokens = mysqlTable("push_tokens", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Token Details
  token: varchar("token", { length: 500 }).notNull(),
  platform: mysqlEnum("platform", ["ios", "android", "web"]).notNull(),
  
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

// Email Queue
export const emailQueue = mysqlTable("email_queue", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  notificationId: varchar("notification_id", { length: 255 }),
  
  // Email Details
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  bodyHtml: text("body_html"),
  
  // Priority
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  
  // Status
  status: mysqlEnum("status", ["pending", "sending", "sent", "failed"]).default("pending"),
  
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
  retryCount: int("retry_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SMS Queue
export const smsQueue = mysqlTable("sms_queue", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  notificationId: varchar("notification_id", { length: 255 }),
  
  // SMS Details
  toPhone: varchar("to_phone", { length: 50 }).notNull(),
  message: text("message").notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "sending", "sent", "failed"]).default("pending"),
  
  // Delivery
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  
  // Error
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification Analytics (Self-Learning)
export const notificationAnalytics = mysqlTable("notification_analytics", {
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
  fatigueThreshold: int("fatigue_threshold"), // Max per day before fatigue
  
  // Sample Size
  userCount: int("user_count"),
  totalSent: int("total_sent"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Notification Feedback
export const userNotificationFeedback = mysqlTable("user_notification_feedback", {
  id: varchar("id", { length: 255 }).primaryKey(),
  notificationId: varchar("notification_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Feedback Type
  feedbackType: mysqlEnum("feedback_type", [
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
