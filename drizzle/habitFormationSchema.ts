/**
 * HABIT FORMATION SYSTEM
 * Evidence-based approach using Habit Science, Behavioral Psychology, and Language Patterns
 * Research sources: James Clear (Atomic Habits), BJ Fogg (Tiny Habits), Charles Duhigg (Power of Habit),
 * Wendy Wood (habit automaticity), Peter Gollwitzer (implementation intentions),
 * Jerry Bresser (language patterns), NLP (reframing), Marshall Rosenberg (NVC),
 * Byron Katie (The Work), Carol Dweck (growth mindset language)
 * 
 * CORE PRINCIPLES:
 * 1. Identity-Based Habits (who you are, not what you do)
 * 2. Tiny Habits (start ridiculously small)
 * 3. Habit Stacking (anchor to existing habits)
 * 4. Cue-Routine-Reward (habit loop)
 * 5. Implementation Intentions (if-then planning)
 * 6. Environment Design (make it obvious/easy)
 * 7. Language Patterns (empowering self-talk)
 * 8. Spaced Repetition (memory integration from Memory Engine)
 * 
 * LANGUAGE PATTERN INTEGRATION:
 * - Limiting language → Empowering language
 * - Fixed mindset → Growth mindset
 * - "I can't" → "I'm learning to"
 * - "I have to" → "I choose to"
 * - "I'm bad at" → "I'm becoming better at"
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Tracks which habit formation strategies work best per user
 * - Identifies optimal cue-routine-reward combinations
 * - Learns ideal habit stack sequences
 * - Predicts habit sustainability based on patterns
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Habit Profiles
export const habitProfiles = mysqlTable("habit_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current State
  totalActiveHabits: int("total_active_habits").default(0),
  totalMasteredHabits: int("total_mastered_habits").default(0),
  longestStreak: int("longest_streak").default(0),
  
  // Preferences
  preferredHabitTime: mysqlEnum("preferred_habit_time", ["morning", "midday", "evening", "night", "flexible"]),
  
  // Self-Learning Data
  mostSuccessfulCues: text("most_successful_cues"), // JSON: which cues lead to habit completion
  optimalHabitStackSequence: text("optimal_habit_stack_sequence"), // JSON: best order for habits
  personalSuccessFactors: text("personal_success_factors"), // JSON: what makes habits stick for this user
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Habits
export const habits = mysqlTable("habits", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Habit Details
  habitName: varchar("habit_name", { length: 255 }).notNull(),
  habitDescription: text("habit_description"),
  
  // Identity Connection (James Clear)
  identityStatement: varchar("identity_statement", { length: 255 }), // "I am a person who..."
  
  // Habit Type
  habitType: mysqlEnum("habit_type", [
    "build", // Building a new habit
    "break", // Breaking a bad habit
    "replace" // Replacing bad habit with good one
  ]).notNull(),
  
  // Category
  category: mysqlEnum("category", [
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
  cueType: mysqlEnum("cue_type", ["time", "location", "preceding_action", "emotional_state", "other_people"]),
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
  targetFrequency: mysqlEnum("target_frequency", [
    "daily",
    "weekdays",
    "weekends",
    "weekly",
    "custom"
  ]).notNull(),
  customFrequency: text("custom_frequency"), // JSON: specific days
  
  // Duration
  targetDuration: int("target_duration"), // minutes (if applicable)
  
  // Difficulty
  difficulty: int("difficulty"), // 1-10
  
  // Progress
  currentStreak: int("current_streak").default(0),
  longestStreak: int("longest_streak").default(0),
  totalCompletions: int("total_completions").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // %
  
  // Automaticity (Wendy Wood)
  automaticityLevel: int("automaticity_level"), // 1-10: How automatic is this habit?
  
  // Status
  status: mysqlEnum("status", ["active", "paused", "mastered", "abandoned"]).default("active"),
  
  // Dates
  startDate: timestamp("start_date").notNull(),
  masteredDate: timestamp("mastered_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily Habit Tracking
export const habitTracking = mysqlTable("habit_tracking", {
  id: varchar("id", { length: 255 }).primaryKey(),
  habitId: varchar("habit_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  trackingDate: timestamp("tracking_date").notNull(),
  
  // Completion
  completed: boolean("completed").notNull(),
  
  // Details
  duration: int("duration"), // minutes (if applicable)
  intensity: int("intensity"), // 1-10 (if applicable)
  
  // Context
  timeOfDay: varchar("time_of_day", { length: 50 }),
  location: varchar("location", { length: 255 }),
  
  // Cue Recognition
  cuePresent: boolean("cue_present"), // Was the cue there?
  cueEffectiveness: int("cue_effectiveness"), // 1-10: How well did the cue work?
  
  // Resistance & Ease
  resistanceLevel: int("resistance_level"), // 1-10: How hard was it to start?
  easeOfCompletion: int("ease_of_completion"), // 1-10: How easy once started?
  
  // Reward
  rewardExperienced: boolean("reward_experienced"),
  rewardSatisfaction: int("reward_satisfaction"), // 1-10
  
  // Automaticity
  feltAutomatic: boolean("felt_automatic"), // Did it feel automatic?
  
  // Mood & Energy
  moodBefore: varchar("mood_before", { length: 100 }),
  moodAfter: varchar("mood_after", { length: 100 }),
  energyBefore: int("energy_before"), // 1-10
  energyAfter: int("energy_after"), // 1-10
  
  // Notes
  notes: text("notes"),
  challenges: text("challenges"),
  wins: text("wins"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Language Patterns (Self-Talk Tracking)
export const languagePatterns = mysqlTable("language_patterns", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Pattern Type
  patternType: mysqlEnum("pattern_type", [
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
  beliefInOld: int("belief_in_old"), // 1-10: How much do you still believe the old statement?
  beliefInNew: int("belief_in_new"), // 1-10: How much do you believe the new statement?
  
  // Impact
  impactOnBehavior: int("impact_on_behavior"), // 1-10
  
  // Status
  status: mysqlEnum("status", ["working_on", "integrated", "mastered"]).default("working_on"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Language Pattern Practice (Daily Reframing)
export const languagePatternPractice = mysqlTable("language_pattern_practice", {
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
  impactOnMood: int("impact_on_mood"), // 1-10
  impactOnAction: int("impact_on_action"), // 1-10
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Habit Obstacles & Solutions
export const habitObstacles = mysqlTable("habit_obstacles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  habitId: varchar("habit_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Obstacle
  obstacleDescription: text("obstacle_description").notNull(),
  obstacleType: mysqlEnum("obstacle_type", [
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
  frequency: mysqlEnum("frequency", ["rare", "occasional", "frequent", "constant"]),
  
  // Solution (Implementation Intention)
  ifThenPlan: text("if_then_plan"), // "If [obstacle], then I will [solution]"
  
  // Effectiveness
  solutionEffectiveness: int("solution_effectiveness"), // 1-10
  
  // Status
  resolved: boolean("resolved").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Habit Milestones
export const habitMilestones = mysqlTable("habit_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  habitId: varchar("habit_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  milestoneType: mysqlEnum("milestone_type", [
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

// Habit Stacks (Sequences of Habits)
export const habitStacks = mysqlTable("habit_stacks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  stackName: varchar("stack_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // When
  timeOfDay: mysqlEnum("time_of_day", ["morning", "midday", "evening", "night"]),
  
  // Habits in Stack (ordered)
  habitSequence: text("habit_sequence"), // JSON array: ordered habit IDs
  
  // Total Duration
  estimatedDuration: int("estimated_duration"), // minutes
  
  // Performance
  totalCompletions: int("total_completions").default(0),
  currentStreak: int("current_streak").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weekly Habit Reviews
export const weeklyHabitReviews = mysqlTable("weekly_habit_reviews", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  weekStartDate: timestamp("week_start_date").notNull(),
  
  // Overall Performance
  overallSuccessRate: decimal("overall_success_rate", { precision: 5, scale: 2 }),
  totalHabitsCompleted: int("total_habits_completed"),
  
  // Wins
  biggestWins: text("biggest_wins"), // JSON array
  habitsGettingEasier: text("habits_getting_easier"), // JSON: habit IDs
  
  // Challenges
  biggestChallenges: text("biggest_challenges"), // JSON array
  habitsStrugglingWith: text("habits_struggling_with"), // JSON: habit IDs
  
  // Language Patterns
  limitingLanguageCaught: int("limiting_language_caught"), // How many times caught yourself
  empoweringLanguageUsed: int("empowering_language_used"), // How many times used new patterns
  
  // Insights
  keyInsights: text("key_insights"),
  lessonsLearned: text("lessons_learned"),
  
  // Next Week
  adjustmentsPlanned: text("adjustments_planned"), // JSON array
  newHabitsToStart: text("new_habits_to_start"), // JSON array
  habitsToModify: text("habits_to_modify"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Habit Formation Analytics (Self-Learning)
export const habitFormationAnalytics = mysqlTable("habit_formation_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Strategy Effectiveness (aggregated)
  strategy: varchar("strategy", { length: 100 }).notNull(), // tiny_habits, stacking, implementation_intention, etc.
  habitCategory: varchar("habit_category", { length: 100 }),
  
  // Success Metrics
  avgSuccessRate: decimal("avg_success_rate", { precision: 5, scale: 2 }),
  avgTimeToAutomaticity: int("avg_time_to_automaticity"), // days
  avgStreakLength: int("avg_streak_length"),
  
  // Optimal Parameters
  optimalCueType: varchar("optimal_cue_type", { length: 100 }),
  optimalTimeOfDay: varchar("optimal_time_of_day", { length: 50 }),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  habitCount: int("habit_count"),
  userCount: int("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
