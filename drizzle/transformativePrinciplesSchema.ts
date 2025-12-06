/**
 * TRANSFORMATIVE PRINCIPLES ENGINE
 * Evidence-based approach using Identity-Based Change, Habit Science, and Personal Development Research
 * Research sources: James Clear (Atomic Habits), BJ Fogg (Tiny Habits), Tony Robbins (identity transformation),
 * Charles Duhigg (habit loops), Carol Dweck (growth mindset), Angela Duckworth (grit)
 * 
 * THE 12 TRANSFORMATIVE PRINCIPLES:
 * Based on Og Mandino's philosophy but modernized with habit science and identity psychology
 * 
 * 1. I AM DISCIPLINED - Master of my habits, creator of my destiny
 * 2. I AM RESILIENT - I rise stronger from every setback
 * 3. I AM PURPOSEFUL - Every action serves my greater mission
 * 4. I AM PRESENT - I live fully in this moment
 * 5. I AM GRATEFUL - I see abundance in all things
 * 6. I AM PERSISTENT - I never quit, I only learn
 * 7. I AM COMPASSIONATE - I treat myself and others with kindness
 * 8. I AM COURAGEOUS - I act despite fear
 * 9. I AM GROWING - I improve 1% every day
 * 10. I AM AUTHENTIC - I live aligned with my values
 * 11. I AM CONNECTED - I nurture meaningful relationships
 * 12. I AM WHOLE - I integrate all parts of myself
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Tracks which principles resonate most with each user
 * - Identifies patterns between principle practice and life outcomes
 * - Learns optimal practice frequency and format per user
 * - Adapts reminders and prompts based on engagement
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Transformative Principles Profiles
export const transformativePrinciplesProfiles = mysqlTable("transformative_principles_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current State
  overallGrowth: int("overall_growth"), // 1-10 self-assessment
  
  // Primary Focus
  primaryPrinciple: mysqlEnum("primary_principle", [
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
  preferredPracticeTime: mysqlEnum("preferred_practice_time", ["morning", "midday", "evening", "night"]),
  practiceFrequency: mysqlEnum("practice_frequency", ["daily", "weekdays", "custom"]),
  
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

// The 12 Principles (Master Reference)
export const principles = mysqlTable("principles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  principleNumber: int("principle_number").notNull(), // 1-12
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

// Daily Principle Practice
export const principlePractices = mysqlTable("principle_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // Which Principle
  principleId: varchar("principle_id", { length: 255 }).notNull(),
  principleNumber: int("principle_number").notNull(), // 1-12
  
  // Practice Type
  practiceType: mysqlEnum("practice_type", [
    "reading", // Read the principle
    "reflection", // Journal on prompts
    "action", // Take specific action
    "meditation", // Meditate on principle
    "affirmation", // Repeat identity statement
    "habit_practice" // Practice key habit
  ]).notNull(),
  
  // Engagement
  timeSpent: int("time_spent"), // minutes
  completed: boolean("completed").default(true),
  
  // Reflection
  reflectionNotes: text("reflection_notes"),
  insights: text("insights"), // What did you learn?
  
  // Application
  actionsTaken: text("actions_taken"), // JSON array: specific actions
  challengesFaced: text("challenges_faced"),
  winsAchieved: text("wins_achieved"),
  
  // Impact
  impactOnDay: int("impact_on_day"), // 1-10: How much did this principle improve your day?
  embodimentLevel: int("embodiment_level"), // 1-10: How well did you embody this principle today?
  
  // Mood & State
  moodBefore: varchar("mood_before", { length: 100 }),
  moodAfter: varchar("mood_after", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Principle Progress Tracking
export const principleProgress = mysqlTable("principle_progress", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  principleId: varchar("principle_id", { length: 255 }).notNull(),
  
  // Mastery Level
  masteryLevel: int("mastery_level"), // 1-100
  
  // Practice Stats
  totalPractices: int("total_practices"),
  currentStreak: int("current_streak"), // days
  longestStreak: int("longest_streak"), // days
  
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

// Identity Transformation Tracking
export const identityTransformations = mysqlTable("identity_transformations", {
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
  transformationProgress: int("transformation_progress"), // 1-100
  
  // Evidence
  evidenceOfChange: text("evidence_of_change"), // JSON array: concrete examples
  
  // Timeline
  startDate: timestamp("start_date"),
  targetDate: timestamp("target_date"),
  
  // Status
  status: mysqlEnum("status", ["in_progress", "achieved", "evolving"]).default("in_progress"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weekly Principle Review
export const weeklyPrincipleReviews = mysqlTable("weekly_principle_reviews", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  weekStartDate: timestamp("week_start_date").notNull(),
  
  // Overall Week
  overallGrowth: int("overall_growth"), // 1-10
  
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

// Principle-Based Goals
export const principleGoals = mysqlTable("principle_goals", {
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
  progress: int("progress"), // 0-100
  
  // Why This Matters
  whyItMatters: text("why_it_matters"),
  
  // Status
  status: mysqlEnum("status", ["active", "achieved", "abandoned"]).default("active"),
  
  achievedDate: timestamp("achieved_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily Affirmations (Identity Reinforcement)
export const dailyAffirmations = mysqlTable("daily_affirmations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  affirmationDate: timestamp("affirmation_date").notNull(),
  
  // Affirmations Practiced
  affirmations: text("affirmations"), // JSON array: "I am disciplined", "I am resilient", etc.
  
  // How Practiced
  practiceMethod: mysqlEnum("practice_method", [
    "spoken_aloud",
    "written",
    "visualization",
    "mirror_work",
    "meditation"
  ]),
  
  // Repetitions
  repetitions: int("repetitions"),
  
  // Belief Level
  beliefLevel: int("belief_level"), // 1-10: How much do you believe these statements?
  
  // Impact
  impactOnMood: int("impact_on_mood"), // 1-10
  impactOnBehavior: int("impact_on_behavior"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Transformative Moments (Breakthrough Experiences)
export const transformativeMoments = mysqlTable("transformative_moments", {
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
  momentType: mysqlEnum("moment_type", [
    "breakthrough", // Major insight or realization
    "embodiment", // Fully embodied a principle
    "identity_shift", // Felt a shift in who you are
    "challenge_overcome", // Overcame significant obstacle
    "pattern_broken", // Broke old pattern
    "new_behavior", // Established new behavior
    "peak_experience" // Transcendent moment
  ]).notNull(),
  
  // Impact
  significance: int("significance"), // 1-10
  lifeAreasAffected: text("life_areas_affected"), // JSON array
  
  // Insights
  insights: text("insights"),
  lessonsLearned: text("lessons_learned"),
  
  // Integration
  howToMaintain: text("how_to_maintain"), // How to keep this alive
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Transformative Principles Engine Self-Learning Analytics
export const transformativePrinciplesAnalytics = mysqlTable("transformative_principles_analytics", {
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
  practiceCount: int("practice_count"),
  userCount: int("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
