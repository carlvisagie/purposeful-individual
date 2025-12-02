import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// Export identity schema tables
export * from "./identitySchema";

// Export adaptive learning schema tables
export * from "./adaptiveLearningSchema";

// Export autism transformation module schema tables
export * from "./autismSchema";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Physical Health Tracking - Daily logs for movement, food, sleep, hydration
 * Evidence-based: Matthew Walker (sleep), Peter Attia (health optimization)
 */
export const healthLogs = mysqlTable("health_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  logDate: date("logDate").notNull(),
  
  // Movement tracking
  steps: int("steps"),
  workoutMinutes: int("workoutMinutes"),
  workoutType: varchar("workoutType", { length: 100 }),
  
  // Nutrition tracking
  mealsLogged: int("mealsLogged"),
  waterIntakeOz: int("waterIntakeOz"),
  nutritionQuality: int("nutritionQuality"), // 1-10 scale
  
  // Sleep tracking
  sleepHours: int("sleepHours"), // stored as minutes (e.g., 480 = 8 hours)
  sleepQuality: int("sleepQuality"), // 1-10 scale
  wakeTime: varchar("wakeTime", { length: 8 }), // HH:MM:SS format
  
  // Energy and well-being
  energyLevel: int("energyLevel"), // 1-10 scale
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HealthLog = typeof healthLogs.$inferSelect;
export type InsertHealthLog = typeof healthLogs.$inferInsert;

/**
 * Coaches table - extends users with coaching-specific information
 */
export const coaches = mysqlTable("coaches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  specialization: text("specialization"),
  bio: text("bio"),
  certifications: text("certifications"),
  yearsExperience: int("yearsExperience"),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Coach = typeof coaches.$inferSelect;
export type InsertCoach = typeof coaches.$inferInsert;

/**
 * Clients table - people being coached
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull().references(() => coaches.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  dateOfBirth: timestamp("dateOfBirth"),
  goals: text("goals"),
  notes: text("notes"),
  status: mysqlEnum("status", ["active", "inactive", "completed"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Journal entries with emotional resilience tracking
 */
export const journalEntries = mysqlTable("journalEntries", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  entryDate: timestamp("entryDate").defaultNow().notNull(),
  content: text("content").notNull(),
  mood: varchar("mood", { length: 50 }),
  moodIntensity: int("moodIntensity"), // 1-10 scale
  emotions: text("emotions"), // JSON array of emotions
  triggers: text("triggers"), // What triggered the emotions
  copingStrategies: text("copingStrategies"), // What they did to cope
  copingEffectiveness: int("copingEffectiveness"), // 1-10 scale
  resilienceScore: int("resilienceScore"), // Calculated resilience score
  isPrivate: mysqlEnum("isPrivate", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * Emotion logs - detailed tracking of emotional states
 */
export const emotionLogs = mysqlTable("emotionLogs", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  journalEntryId: int("journalEntryId").references(() => journalEntries.id),
  logDate: timestamp("logDate").defaultNow().notNull(),
  emotionType: varchar("emotionType", { length: 100 }).notNull(), // joy, sadness, anger, fear, etc.
  intensity: int("intensity").notNull(), // 1-10 scale
  trigger: text("trigger"),
  physicalSensations: text("physicalSensations"),
  thoughts: text("thoughts"),
  behaviors: text("behaviors"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmotionLog = typeof emotionLogs.$inferSelect;
export type InsertEmotionLog = typeof emotionLogs.$inferInsert;

/**
 * Coping strategies library and effectiveness tracking
 */
export const copingStrategies = mysqlTable("copingStrategies", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  strategyName: varchar("strategyName", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // breathing, physical, social, cognitive, etc.
  timesUsed: int("timesUsed").default(0).notNull(),
  averageEffectiveness: int("averageEffectiveness"), // Average rating 1-10
  lastUsed: timestamp("lastUsed"),
  isRecommended: mysqlEnum("isRecommended", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CopingStrategy = typeof copingStrategies.$inferSelect;
export type InsertCopingStrategy = typeof copingStrategies.$inferInsert;

/**
 * AI insights and pattern detection results
 */
export const aiInsights = mysqlTable("aiInsights", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  insightDate: timestamp("insightDate").defaultNow().notNull(),
  insightType: varchar("insightType", { length: 100 }).notNull(), // pattern, trend, recommendation, alert
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("low").notNull(),
  actionable: text("actionable"), // Suggested actions
  isRead: mysqlEnum("isRead", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = typeof aiInsights.$inferInsert;

/**
 * Session types - configurable session offerings with pricing
 */
export const sessionTypes = mysqlTable("sessionTypes", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  duration: int("duration").notNull(), // in minutes
  price: int("price").notNull(), // in cents (e.g., 7500 = $75.00)
  stripePriceId: varchar("stripePriceId", { length: 255 }), // Stripe recurring price ID for subscriptions
  oneTimePriceId: varchar("oneTimePriceId", { length: 255 }), // Stripe one-time price ID for single sessions
  subscriptionPrice: int("subscriptionPrice"), // Monthly subscription price in cents (optional, defaults to price)
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SessionType = typeof sessionTypes.$inferSelect;
export type InsertSessionType = typeof sessionTypes.$inferInsert;

/**
 * Sessions/appointments between coach and client
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull().references(() => coaches.id),
  clientId: int("clientId").notNull().references(() => clients.id),
  sessionTypeId: int("sessionTypeId").references(() => sessionTypes.id),
  scheduledDate: timestamp("scheduledDate").notNull(),
  duration: int("duration").notNull(), // in minutes
  price: int("price"), // in cents - captured at booking time
  sessionType: varchar("sessionType", { length: 100 }), // legacy field, kept for backward compatibility
  notes: text("notes"),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no-show"]).default("scheduled").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "refunded", "failed"]).default("pending"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }), // Stripe checkout session ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Subscriptions table for tracking Stripe subscriptions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  productId: varchar("productId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "past_due", "unpaid"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
/**
 * Coach availability - recurring weekly schedule
 */
export const coachAvailability = mysqlTable("coachAvailability", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  dayOfWeek: int("dayOfWeek").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM format (e.g., "09:00")
  endTime: varchar("endTime", { length: 5 }).notNull(), // HH:MM format (e.g., "17:00")
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachAvailability = typeof coachAvailability.$inferSelect;
export type InsertCoachAvailability = typeof coachAvailability.$inferInsert;

/**
 * Availability exceptions - time off, holidays, blocked dates
 */
export const availabilityExceptions = mysqlTable("availabilityExceptions", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  reason: varchar("reason", { length: 255 }), // vacation, holiday, personal, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AvailabilityException = typeof availabilityExceptions.$inferSelect;
export type InsertAvailabilityException = typeof availabilityExceptions.$inferInsert;

/**
 * Session reminders - track sent reminder emails
 */
export const sessionReminders = mysqlTable("sessionReminders", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  reminderType: mysqlEnum("reminderType", ["24_hour", "1_hour"]).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionReminder = typeof sessionReminders.$inferSelect;
export type InsertSessionReminder = typeof sessionReminders.$inferInsert;

/**
 * Discount codes table - for promotional offers and exit-intent popups
 */
export const discountCodes = mysqlTable("discountCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountPercent: int("discountPercent").notNull(), // 10 for 10%
  discountAmount: int("discountAmount"), // Fixed amount in cents (optional)
  maxUses: int("maxUses"), // null = unlimited
  usedCount: int("usedCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = typeof discountCodes.$inferInsert;

/**
 * Discount code usage tracking
 */
export const discountCodeUsage = mysqlTable("discountCodeUsage", {
  id: int("id").autoincrement().primaryKey(),
  discountCodeId: int("discountCodeId").notNull().references(() => discountCodes.id),
  userId: int("userId").references(() => users.id),
  sessionId: int("sessionId").references(() => sessions.id),
  usedAt: timestamp("usedAt").defaultNow().notNull(),
});

export type DiscountCodeUsage = typeof discountCodeUsage.$inferSelect;
export type InsertDiscountCodeUsage = typeof discountCodeUsage.$inferInsert;

/**
 * AI chat conversations - 24/7 AI coaching chat history
 */
export const aiChatConversations = mysqlTable("aiChatConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: int("clientId").references(() => clients.id, { onDelete: "cascade" }), // Optional link to client profile
  title: varchar("title", { length: 255 }), // Auto-generated conversation title
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiChatConversation = typeof aiChatConversations.$inferSelect;
export type InsertAiChatConversation = typeof aiChatConversations.$inferInsert;

/**
 * AI chat messages - individual messages in conversations
 */
export const aiChatMessages = mysqlTable("aiChatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull().references(() => aiChatConversations.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  emotionDetected: varchar("emotionDetected", { length: 100 }), // AI-detected emotion from user message
  crisisFlag: mysqlEnum("crisisFlag", ["none", "low", "medium", "high", "critical"]).default("none").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAiChatMessage = typeof aiChatMessages.$inferInsert;

/**
 * Platform settings - global configuration for the coaching platform
 */
export const platformSettings = mysqlTable("platformSettings", {
  id: int("id").autoincrement().primaryKey(),
  aiCoachingEnabled: mysqlEnum("aiCoachingEnabled", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;


/**
 * Video Testimonials - real client video testimonials
 */
export const videoTestimonials = mysqlTable("videoTestimonials", {
  id: int("id").autoincrement().primaryKey(),
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
  duration: int("duration"), // Video duration in seconds
  isPublished: mysqlEnum("isPublished", ["true", "false"]).default("false").notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoTestimonial = typeof videoTestimonials.$inferSelect;
export type InsertVideoTestimonial = typeof videoTestimonials.$inferInsert;

/**
 * Compliance flags - track prohibited content in AI conversations
 */
export const complianceFlags = mysqlTable("complianceFlags", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull().references(() => aiChatConversations.id, { onDelete: "cascade" }),
  messageId: int("messageId").notNull().references(() => aiChatMessages.id, { onDelete: "cascade" }),
  flagType: mysqlEnum("flagType", ["medical_advice", "diagnosis", "prescription", "legal_advice", "financial_advice", "harmful_content"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  flaggedContent: text("flaggedContent").notNull(), // The specific content that triggered the flag
  aiResponse: text("aiResponse"), // How the AI responded to the flagged content
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "reviewed", "dismissed", "escalated"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy").references(() => users.id), // Coach who reviewed
  reviewNotes: text("reviewNotes"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComplianceFlag = typeof complianceFlags.$inferSelect;
export type InsertComplianceFlag = typeof complianceFlags.$inferInsert;

/**
 * Escalation queue - AI to human coach handoff requests
 */
export const escalationQueue = mysqlTable("escalationQueue", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull().references(() => aiChatConversations.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id),
  clientId: int("clientId").references(() => clients.id),
  escalationType: mysqlEnum("escalationType", ["crisis", "client_request", "ai_uncertainty", "compliance_flag", "complex_issue"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  reason: text("reason").notNull(), // Why escalation was triggered
  context: text("context"), // Recent conversation context
  status: mysqlEnum("status", ["pending", "assigned", "in_progress", "resolved", "closed"]).default("pending").notNull(),
  assignedTo: int("assignedTo").references(() => coaches.id), // Which coach is handling it
  assignedAt: timestamp("assignedAt"),
  resolvedAt: timestamp("resolvedAt"),
  resolutionNotes: text("resolutionNotes"),
  notificationSent: mysqlEnum("notificationSent", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EscalationQueue = typeof escalationQueue.$inferSelect;
export type InsertEscalationQueue = typeof escalationQueue.$inferInsert;

/**
 * Similar cases library - context helpers for coaches
 */
export const similarCases = mysqlTable("similarCases", {
  id: int("id").autoincrement().primaryKey(),
  caseTitle: varchar("caseTitle", { length: 255 }).notNull(),
  caseDescription: text("caseDescription").notNull(),
  clientIssues: text("clientIssues").notNull(), // JSON array of issues/symptoms
  interventions: text("interventions").notNull(), // What the coach did
  outcome: text("outcome").notNull(), // What happened
  successRating: int("successRating").notNull(), // 1-10 scale
  timeToResolution: int("timeToResolution"), // Days to resolution
  coachNotes: text("coachNotes"), // Coach insights and recommendations
  tags: text("tags"), // JSON array of searchable tags
  isPublic: mysqlEnum("isPublic", ["true", "false"]).default("false").notNull(), // Share with other coaches
  createdBy: int("createdBy").notNull().references(() => coaches.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SimilarCase = typeof similarCases.$inferSelect;
export type InsertSimilarCase = typeof similarCases.$inferInsert;

/**
 * Coach notifications - alerts for escalations and flags
 */
export const coachNotifications = mysqlTable("coachNotifications", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  notificationType: mysqlEnum("notificationType", ["escalation", "compliance_flag", "crisis_alert", "new_client", "session_reminder"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  relatedId: int("relatedId"), // ID of related escalation, flag, etc.
  isRead: mysqlEnum("isRead", ["true", "false"]).default("false").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachNotification = typeof coachNotifications.$inferSelect;
export type InsertCoachNotification = typeof coachNotifications.$inferInsert;


// Live Session Transcripts (for real-time coach assistance)
export const liveSessionTranscripts = mysqlTable("liveSessionTranscripts", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  speaker: mysqlEnum("speaker", ["client", "coach"]).notNull(),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

// Coach Guidance (AI suggestions during live sessions)
export const coachGuidance = mysqlTable("coachGuidance", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  guidanceType: mysqlEnum("guidanceType", ["suggest", "alert", "reference", "technique", "crisis"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).notNull(),
  message: text("message").notNull(),
  context: text("context"),
  timestamp: timestamp("timestamp").notNull(),
  wasFollowed: mysqlEnum("wasFollowed", ["true", "false"]).default("false"),
});
