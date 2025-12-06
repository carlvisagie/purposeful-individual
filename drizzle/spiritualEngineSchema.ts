/**
 * SPIRITUAL ENGINE
 * Evidence-based approach using Mindfulness Research, Contemplative Science, Purpose Psychology, and Meditation Studies
 * Research sources: Jon Kabat-Zinn (MBSR), Richie Davidson (neuroscience of meditation), Viktor Frankl (logotherapy), William Damon (purpose research)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Tracks what practices work best for each user
 * - Adapts recommendations based on user response
 * - Learns optimal timing and duration for each individual
 * - Integrates with latest meditation & mindfulness research
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Spiritual Profiles
export const spiritualProfiles = mysqlTable("spiritual_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Spiritual Background
  spiritualBackground: mysqlEnum("spiritual_background", [
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
  meditationExperience: mysqlEnum("meditation_experience", ["none", "beginner", "intermediate", "advanced"]),
  currentPractices: text("current_practices"), // JSON array
  
  // Spiritual Goals
  primaryGoal: mysqlEnum("primary_goal", [
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
  preferredPracticeTime: mysqlEnum("preferred_practice_time", ["morning", "afternoon", "evening", "night", "flexible"]),
  preferredDuration: int("preferred_duration"), // minutes
  preferredStyle: text("preferred_style"), // JSON array: guided, silent, movement, etc.
  
  // Self-Learning Data
  mostEffectivePractices: text("most_effective_practices"), // JSON: practices that work best for this user
  optimalPracticeTime: int("optimal_practice_time"), // minutes (learned from user data)
  bestTimeOfDay: varchar("best_time_of_day", { length: 50 }), // learned from completion rates
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meditation Sessions
export const meditationSessions = mysqlTable("meditation_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  sessionDate: timestamp("session_date").notNull(),
  
  // Practice Details
  practiceType: mysqlEnum("practice_type", [
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
  
  guidedOrSilent: mysqlEnum("guided_or_silent", ["guided", "silent", "hybrid"]),
  guideSource: varchar("guide_source", { length: 255 }), // App, teacher, self, etc.
  
  // Duration
  plannedDuration: int("planned_duration"), // minutes
  actualDuration: int("actual_duration"), // minutes
  
  // Quality Metrics
  focusLevel: int("focus_level"), // 1-10 (how focused were you?)
  distractionLevel: int("distraction_level"), // 1-10
  peaceLevel: int("peace_level"), // 1-10 (how peaceful did you feel?)
  insightLevel: int("insight_level"), // 1-10 (any insights or realizations?)
  
  // State Before/After
  emotionBefore: varchar("emotion_before", { length: 255 }),
  stressLevelBefore: int("stress_level_before"), // 1-10
  emotionAfter: varchar("emotion_after", { length: 255 }),
  stressLevelAfter: int("stress_level_after"), // 1-10
  
  // Experience
  experiences: text("experiences"), // JSON array: calm, restless, sleepy, energized, etc.
  insights: text("insights"), // Any realizations or insights
  challenges: text("challenges"), // What was difficult?
  
  // Completion
  completed: boolean("completed").default(true),
  
  // Self-Learning Data
  effectiveness: int("effectiveness"), // 1-10 (calculated from before/after metrics)
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Mindfulness Practices (Daily Informal Practice)
export const mindfulnessPractices = mysqlTable("mindfulness_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // Practice Type (informal mindfulness)
  practiceType: mysqlEnum("practice_type", [
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
  
  duration: int("duration"), // minutes
  
  // Context
  activity: varchar("activity", { length: 255 }), // What were you doing?
  location: varchar("location", { length: 255 }),
  
  // Quality
  presenceLevel: int("presence_level"), // 1-10 (how present were you?)
  awarenessLevel: int("awareness_level"), // 1-10
  
  // Experience
  whatYouNoticed: text("what_you_noticed"),
  howItFelt: text("how_it_felt"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Purpose & Meaning Exploration
export const purposeExplorations = mysqlTable("purpose_explorations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  explorationDate: timestamp("exploration_date").notNull(),
  
  // Exploration Type (evidence-based purpose discovery)
  explorationType: mysqlEnum("exploration_type", [
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
  clarityLevel: int("clarity_level"), // 1-10 (how clear is your purpose?)
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Gratitude Practice
export const gratitudeEntries = mysqlTable("gratitude_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  entryDate: timestamp("entry_date").notNull(),
  
  // Gratitude Items (research shows 3-5 is optimal)
  gratitude1: text("gratitude_1").notNull(),
  gratitude2: text("gratitude_2"),
  gratitude3: text("gratitude_3"),
  gratitude4: text("gratitude_4"),
  gratitude5: text("gratitude_5"),
  
  // Depth
  gratitudeDepth: mysqlEnum("gratitude_depth", ["surface", "moderate", "deep"]), // Surface = "coffee", Deep = "my health that allows me to enjoy coffee"
  
  // Emotional Impact
  emotionalImpact: int("emotional_impact"), // 1-10
  
  // Savoring
  savoringTime: int("savoring_time"), // seconds spent savoring each gratitude
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Compassion & Loving-Kindness Practice
export const compassionPractices = mysqlTable("compassion_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  practiceType: mysqlEnum("practice_type", [
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
  
  duration: int("duration"), // minutes
  
  // Target
  target: varchar("target", { length: 255 }), // Who was the practice directed toward?
  
  // Experience
  emotionBefore: varchar("emotion_before", { length: 255 }),
  emotionAfter: varchar("emotion_after", { length: 255 }),
  
  warmthLevel: int("warmth_level"), // 1-10 (how much warmth/compassion did you feel?)
  resistanceLevel: int("resistance_level"), // 1-10 (any resistance or difficulty?)
  
  // Insights
  insights: text("insights"),
  
  // Behavioral Follow-up (for acts of kindness)
  actionTaken: text("action_taken"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Spiritual Experiences & Insights
export const spiritualExperiences = mysqlTable("spiritual_experiences", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  experienceDate: timestamp("experience_date").notNull(),
  
  experienceType: mysqlEnum("experience_type", [
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
  intensity: int("intensity"), // 1-10
  duration: int("duration"), // minutes or hours
  
  // Impact
  emotionalImpact: int("emotional_impact"), // 1-10
  meaningfulness: int("meaningfulness"), // 1-10
  lifeChanging: boolean("life_changing").default(false),
  
  // Integration
  insights: text("insights"),
  howItChangedYou: text("how_it_changed_you"),
  actionsTaken: text("actions_taken"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Spiritual Milestones
export const spiritualMilestones = mysqlTable("spiritual_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  milestoneType: mysqlEnum("milestone_type", [
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

// Self-Learning Analytics (Engine learns from all users)
export const spiritualEngineAnalytics = mysqlTable("spiritual_engine_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Practice Effectiveness (aggregated across all users)
  practiceType: varchar("practice_type", { length: 100 }).notNull(),
  
  // Effectiveness Metrics
  avgStressReduction: decimal("avg_stress_reduction", { precision: 5, scale: 2 }), // Average stress reduction
  avgPeaceIncrease: decimal("avg_peace_increase", { precision: 5, scale: 2 }),
  avgCompletionRate: decimal("avg_completion_rate", { precision: 5, scale: 2 }), // % who complete
  
  // Optimal Parameters (learned)
  optimalDuration: int("optimal_duration"), // minutes
  optimalTimeOfDay: varchar("optimal_time_of_day", { length: 50 }),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: {beginners: 8.5, advanced: 7.2, etc.}
  
  // Sample Size
  sessionCount: int("session_count"), // How many sessions analyzed
  userCount: int("user_count"), // How many users
  
  // Last Updated
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
