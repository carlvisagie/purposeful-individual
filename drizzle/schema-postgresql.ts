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

// ============================================================================
// AUTISM TRANSFORMATION MODULE
// ============================================================================

// Autism-specific enums
export const autismSeverityEnum = pgEnum("autism_severity", ["mild", "moderate", "severe"]);
export const communicationLevelEnum = pgEnum("communication_level", ["nonverbal", "minimally_verbal", "verbal"]);
export const interventionPhaseEnum = pgEnum("intervention_phase", ["foundation", "biomedical", "behavioral", "advanced"]);
export const supplementFrequencyEnum = pgEnum("supplement_frequency", ["daily", "twice_daily", "every_3_days"]);
export const dietTypeEnum = pgEnum("diet_type", ["GFCF", "ketogenic", "SCD"]);
export const therapyTypeEnum = pgEnum("therapy_type", ["ABA", "OT", "speech", "Floortime", "neurofeedback"]);
export const patternTypeEnum = pgEnum("pattern_type", ["high_responder", "moderate_responder", "non_responder"]);
export const providerTypeEnum = pgEnum("provider_type", ["ABA", "OT", "speech", "FMT_clinic", "neurofeedback"]);
export const acceptsInsuranceEnum = pgEnum("accepts_insurance", ["true", "false"]);

// Child Profile & Assessment
export const autismProfiles = pgTable("autism_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  childName: varchar("child_name", { length: 255 }).notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  diagnosisDate: timestamp("diagnosis_date"),
  severity: autismSeverityEnum("severity").notNull(),
  
  // Assessment Data
  atecScore: integer("atec_score"),
  carsScore: integer("cars_score"),
  communicationLevel: communicationLevelEnum("communication_level").notNull(),
  
  // Symptoms & Challenges (stored as JSON)
  giSymptoms: json("gi_symptoms"),
  sleepIssues: json("sleep_issues"),
  sensoryProfile: json("sensory_profile"),
  behaviorChallenges: json("behavior_challenges"),
  
  // Family Context
  familyResources: json("family_resources"),
  treatmentPriorities: json("treatment_priorities"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AutismProfile = typeof autismProfiles.$inferSelect;
export type InsertAutismProfile = typeof autismProfiles.$inferInsert;

// Personalized Intervention Plans
export const interventionPlans = pgTable("intervention_plans", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => autismProfiles.id, { onDelete: "cascade" }),
  
  // Tiered Interventions (JSON arrays)
  tier1Interventions: json("tier1_interventions").notNull(),
  tier2Interventions: json("tier2_interventions"),
  tier3Interventions: json("tier3_interventions"),
  tier4Interventions: json("tier4_interventions"),
  
  // Timeline & Providers
  currentPhase: interventionPhaseEnum("current_phase").notNull(),
  startDate: timestamp("start_date").notNull(),
  providerDirectory: json("provider_directory"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InterventionPlan = typeof interventionPlans.$inferSelect;
export type InsertInterventionPlan = typeof interventionPlans.$inferInsert;

// Supplement Tracking
export const supplementTracking = pgTable("supplement_tracking", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => autismProfiles.id, { onDelete: "cascade" }),
  
  supplementName: varchar("supplement_name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 255 }).notNull(),
  frequency: supplementFrequencyEnum("frequency").notNull(),
  
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  
  // Tracking
  adherence: integer("adherence"),
  sideEffects: json("side_effects"),
  perceivedBenefit: integer("perceived_benefit"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SupplementTracking = typeof supplementTracking.$inferSelect;
export type InsertSupplementTracking = typeof supplementTracking.$inferInsert;

// Dietary Interventions
export const dietaryInterventions = pgTable("dietary_interventions", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => autismProfiles.id, { onDelete: "cascade" }),
  
  dietType: dietTypeEnum("diet_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  
  // Tracking
  adherence: integer("adherence"),
  giSymptomChanges: json("gi_symptom_changes"),
  behaviorChanges: json("behavior_changes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DietaryIntervention = typeof dietaryInterventions.$inferSelect;
export type InsertDietaryIntervention = typeof dietaryInterventions.$inferInsert;

// Therapy Sessions
export const therapySessions = pgTable("therapy_sessions", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => autismProfiles.id, { onDelete: "cascade" }),
  
  therapyType: therapyTypeEnum("therapy_type").notNull(),
  sessionDate: timestamp("session_date").notNull(),
  duration: integer("duration").notNull(),
  
  // Session Details
  goalsAddressed: json("goals_addressed"),
  progress: json("progress"),
  parentFeedback: text("parent_feedback"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TherapySession = typeof therapySessions.$inferSelect;
export type InsertTherapySession = typeof therapySessions.$inferInsert;

// Autism Outcome Tracking
export const autismOutcomeTracking = pgTable("autism_outcome_tracking", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => autismProfiles.id, { onDelete: "cascade" }),
  
  assessmentDate: timestamp("assessment_date").notNull(),
  
  // Core Autism Symptoms
  atecScore: integer("atec_score"),
  carsScore: integer("cars_score"),
  communicationLevel: communicationLevelEnum("communication_level"),
  
  // Behavior & Function
  behaviorScore: integer("behavior_score"),
  adaptiveFunctionScore: integer("adaptive_function_score"),
  
  // Physical Health
  giSymptomScore: integer("gi_symptom_score"),
  sleepScore: integer("sleep_score"),
  
  // Family Quality of Life
  familyQOL: integer("family_qol"),
  parentStress: integer("parent_stress"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AutismOutcomeTracking = typeof autismOutcomeTracking.$inferSelect;
export type InsertAutismOutcomeTracking = typeof autismOutcomeTracking.$inferInsert;

// Adaptive Learning - Pattern Detection for Autism
export const autismPatternDetection = pgTable("autism_pattern_detection", {
  id: serial("id").primaryKey(),
  
  // Child Profile Characteristics
  childProfile: json("child_profile").notNull(),
  
  // Intervention Combination
  interventionCombination: json("intervention_combination").notNull(),
  
  // Outcome Data
  outcomeData: json("outcome_data").notNull(),
  
  // Pattern Insights
  patternType: patternTypeEnum("pattern_type"),
  confidence: integer("confidence"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AutismPatternDetection = typeof autismPatternDetection.$inferSelect;
export type InsertAutismPatternDetection = typeof autismPatternDetection.$inferInsert;

// Provider Directory for Autism Services
export const autismProviders = pgTable("autism_providers", {
  id: serial("id").primaryKey(),
  
  providerType: providerTypeEnum("provider_type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  
  // Contact & Details
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  
  // Ratings & Reviews
  rating: integer("rating"),
  reviewCount: integer("review_count"),
  
  // Insurance & Cost
  acceptsInsurance: acceptsInsuranceEnum("accepts_insurance").notNull(),
  costRange: varchar("cost_range", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AutismProvider = typeof autismProviders.$inferSelect;
export type InsertAutismProvider = typeof autismProviders.$inferInsert;

// Daily Tracking Logs
export const autismDailyLogs = pgTable("autism_daily_logs", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => autismProfiles.id, { onDelete: "cascade" }),
  
  date: timestamp("date").notNull(),
  mood: integer("mood").notNull(),
  sleepQuality: integer("sleep_quality").notNull(),
  sleepHours: integer("sleep_hours"),
  
  // Behaviors
  meltdownCount: integer("meltdown_count").notNull().default(0),
  communicationAttempts: integer("communication_attempts").notNull().default(0),
  
  // Observations
  wins: text("wins"),
  challenges: text("challenges"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AutismDailyLog = typeof autismDailyLogs.$inferSelect;
export type InsertAutismDailyLog = typeof autismDailyLogs.$inferInsert;
