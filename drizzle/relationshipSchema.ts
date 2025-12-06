/**
 * RELATIONSHIP CHALLENGES MODULE
 * Evidence-based approach using Gottman Method, Attachment Theory, and Communication Research
 * Research sources: Gottman Institute, Sue Johnson (EFT), John Bowlby (Attachment Theory)
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Relationship Profiles
export const relationshipProfiles = mysqlTable("relationship_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Relationship Type & Status
  relationshipType: mysqlEnum("relationship_type", ["dating", "committed", "engaged", "married", "separated", "divorced", "post_breakup"]).notNull(),
  relationshipStatus: mysqlEnum("relationship_status", ["active", "on_break", "ending", "ended"]).notNull(),
  relationshipDuration: int("relationship_duration"), // months
  
  // Partner Information (optional, for privacy)
  partnerInvolved: boolean("partner_involved").default(false), // Is partner also using platform?
  partnerUserId: varchar("partner_user_id", { length: 255 }),
  
  // Attachment Style (evidence-based assessment)
  attachmentStyle: mysqlEnum("attachment_style", ["secure", "anxious", "avoidant", "fearful_avoidant"]),
  partnerAttachmentStyle: mysqlEnum("partner_attachment_style", ["secure", "anxious", "avoidant", "fearful_avoidant", "unknown"]),
  
  // Love Languages (Gary Chapman's 5 Love Languages)
  primaryLoveLanguage: mysqlEnum("primary_love_language", ["words_of_affirmation", "quality_time", "receiving_gifts", "acts_of_service", "physical_touch"]),
  secondaryLoveLanguage: mysqlEnum("secondary_love_language", ["words_of_affirmation", "quality_time", "receiving_gifts", "acts_of_service", "physical_touch"]),
  partnerPrimaryLoveLanguage: mysqlEnum("partner_primary_love_language", ["words_of_affirmation", "quality_time", "receiving_gifts", "acts_of_service", "physical_touch", "unknown"]),
  partnerSecondaryLoveLanguage: mysqlEnum("partner_secondary_love_language", ["words_of_affirmation", "quality_time", "receiving_gifts", "acts_of_service", "physical_touch", "unknown"]),
  
  // Relationship Goals
  primaryGoal: mysqlEnum("primary_goal", [
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
  conflictFrequency: mysqlEnum("conflict_frequency", ["rare", "occasional", "frequent", "constant"]),
  
  // Gottman Four Horsemen Assessment
  criticismLevel: int("criticism_level"), // 1-10
  contemptLevel: int("contempt_level"),
  defensivenessLevel: int("defensiveness_level"),
  stonewallinglevel: int("stonewalling_level"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communication Logs - Track conversations & conflicts
export const communicationLogs = mysqlTable("communication_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  logDate: timestamp("log_date").notNull(),
  
  // Conversation Type
  conversationType: mysqlEnum("conversation_type", ["conflict", "difficult_topic", "check_in", "quality_time", "repair_attempt"]).notNull(),
  
  // Topic & Context
  topic: varchar("topic", { length: 255 }).notNull(),
  context: text("context"),
  
  // Emotional State
  emotionBefore: varchar("emotion_before", { length: 255 }),
  intensityBefore: int("intensity_before"), // 1-10
  
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
  outcome: mysqlEnum("outcome", ["resolved", "partially_resolved", "unresolved", "escalated"]),
  emotionAfter: varchar("emotion_after", { length: 255 }),
  intensityAfter: int("intensity_after"),
  
  // Reflection
  whatWorked: text("what_worked"),
  whatToImprove: text("what_to_improve"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Gottman Love Maps - Know your partner deeply
export const loveMaps = mysqlTable("love_maps", {
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

// Bids for Connection - Gottman's turning toward/away/against
export const connectionBids = mysqlTable("connection_bids", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  bidDate: timestamp("bid_date").notNull(),
  
  // Bid Details
  bidType: mysqlEnum("bid_type", ["conversation", "affection", "humor", "help", "quality_time"]).notNull(),
  bidDescription: text("bid_description"),
  
  // Response
  response: mysqlEnum("response", ["turned_toward", "turned_away", "turned_against"]).notNull(),
  responseDescription: text("response_description"),
  
  // Impact
  emotionalImpact: int("emotional_impact"), // 1-10 (positive or negative)
  connectionStrength: int("connection_strength"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Repair Attempts - Track efforts to heal & reconnect
export const repairAttempts = mysqlTable("repair_attempts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  attemptDate: timestamp("attempt_date").notNull(),
  
  // What Happened
  conflictDescription: text("conflict_description"),
  
  // Repair Strategy
  repairStrategy: mysqlEnum("repair_strategy", [
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
  partnerResponse: mysqlEnum("partner_response", ["accepted", "rejected", "mixed", "no_response"]),
  
  // Outcome
  conflictResolved: boolean("conflict_resolved"),
  connectionRestored: boolean("connection_restored"),
  
  // Learning
  effectiveness: int("effectiveness"), // 1-10
  whatLearned: text("what_learned"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Relationship Rituals - Build connection through routines
export const relationshipRituals = mysqlTable("relationship_rituals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  ritualType: mysqlEnum("ritual_type", [
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
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "as_needed"]),
  
  // Tracking
  lastCompleted: timestamp("last_completed"),
  completionCount: int("completion_count").default(0),
  currentStreak: int("current_streak").default(0),
  longestStreak: int("longest_streak").default(0),
  
  // Impact
  connectionImpact: int("connection_impact"), // 1-10 average
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Breakup Recovery (if applicable)
export const breakupRecovery = mysqlTable("breakup_recovery", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  breakupDate: timestamp("breakup_date"),
  relationshipDuration: int("relationship_duration"), // months
  
  // Breakup Context
  initiator: mysqlEnum("initiator", ["me", "them", "mutual"]),
  reason: text("reason"),
  
  // Recovery Phase (evidence-based stages of grief)
  currentPhase: mysqlEnum("current_phase", ["denial", "anger", "bargaining", "depression", "acceptance", "growth"]),
  
  // No Contact
  noContactActive: boolean("no_contact_active").default(false),
  noContactStartDate: timestamp("no_contact_start_date"),
  noContactDuration: int("no_contact_duration"), // days
  
  // Healing Activities
  healingActivities: text("healing_activities"), // JSON array
  supportSystem: text("support_system"), // JSON array
  
  // Progress Markers
  daysWithoutContact: int("days_without_contact").default(0),
  goodDaysCount: int("good_days_count").default(0),
  badDaysCount: int("bad_days_count").default(0),
  
  // Growth & Lessons
  lessonsLearned: text("lessons_learned"), // JSON array
  personalGrowth: text("personal_growth"),
  futureGoals: text("future_goals"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// Love Language Actions - Track how you express & receive love (Gary Chapman's 5 Love Languages)
export const loveLanguageActions = mysqlTable("love_language_actions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  actionDate: timestamp("action_date").notNull(),
  
  // Action Type
  actionType: mysqlEnum("action_type", ["given", "received"]).notNull(),
  
  // Love Language
  loveLanguage: mysqlEnum("love_language", [
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
  // Quality Time: "Had dinner without phones", "Went for a walk together", "Had deep conversation"
  // Gifts: "Brought their favorite coffee", "Surprise flowers", "Meaningful book"
  // Acts of Service: "Did the dishes", "Filled their car with gas", "Made their favorite meal"
  // Physical Touch: "Long hug", "Held hands during movie", "Back massage"
  
  // Impact
  emotionalImpact: int("emotional_impact"), // 1-10
  connectionFelt: int("connection_felt"), // 1-10
  
  // Partner Response (if given)
  partnerResponse: text("partner_response"),
  
  createdAt: timestamp("created_at").defaultNow(),
});
