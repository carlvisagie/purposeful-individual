/**
 * JOURNAL & REFLECTION SYSTEM
 * Evidence-based approach using Expressive Writing Research, Reflective Practice, and Cognitive Processing
 * Research sources: James Pennebaker (expressive writing), Tim Wilson (redirect method),
 * Ethan Kross (self-distancing), Laura King (writing about best possible self),
 * Sonja Lyubomirsky (gratitude journaling), David Kolb (experiential learning cycle),
 * Donald Schön (reflective practice), Carol Dweck (growth mindset reflection)
 * 
 * CORE PRINCIPLES:
 * 1. Writing Heals (Pennebaker's research on expressive writing)
 * 2. Reflection Drives Growth (learning from experience)
 * 3. Gratitude Rewires the Brain (positive psychology)
 * 4. Self-Distancing Reduces Rumination (3rd person perspective)
 * 5. Future Self Visualization (best possible self exercise)
 * 6. Pattern Recognition (AI identifies themes over time)
 * 
 * JOURNAL TYPES:
 * - Free-form journaling (stream of consciousness)
 * - Gratitude journaling (3 good things)
 * - Reflective journaling (what did I learn?)
 * - Expressive writing (process difficult emotions)
 * - Goal reflection (progress review)
 * - Best possible self (future visualization)
 * - Daily review (what went well/poorly)
 * 
 * PROMPTS LIBRARY:
 * - Evidence-based prompts from research
 * - Adaptive prompts based on user state
 * - Themed prompts (relationships, career, health, etc.)
 * - Crisis prompts (when struggling)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Identifies emotional patterns over time
 * - Detects cognitive distortions
 * - Recognizes growth areas
 * - Suggests relevant prompts
 * - Predicts when journaling would be most helpful
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Journal Profiles
export const journalProfiles = mysqlTable("journal_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Journaling Stats
  totalEntries: int("total_entries").default(0),
  currentStreak: int("current_streak").default(0), // Days
  longestStreak: int("longest_streak").default(0),
  
  // Preferences
  preferredJournalType: mysqlEnum("preferred_journal_type", [
    "free_form",
    "gratitude",
    "reflective",
    "expressive",
    "goal_focused",
    "mixed"
  ]),
  
  preferredTime: mysqlEnum("preferred_time", ["morning", "afternoon", "evening", "night", "flexible"]),
  
  // Privacy
  defaultPrivacy: mysqlEnum("default_privacy", ["private", "shared_with_coach", "shared_with_community"]).default("private"),
  
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

// Journal Entries
export const journalEntries = mysqlTable("journal_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Entry Details
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  
  // Entry Type
  entryType: mysqlEnum("entry_type", [
    "free_form",
    "gratitude",
    "reflective",
    "expressive",
    "goal_reflection",
    "best_possible_self",
    "daily_review",
    "crisis_processing"
  ]).notNull(),
  
  // Prompt (if used)
  promptId: varchar("prompt_id", { length: 255 }),
  promptText: text("prompt_text"),
  
  // Mood Before/After
  moodBefore: int("mood_before"), // 1-10
  moodAfter: int("mood_after"), // 1-10
  
  // Emotions (AI-Detected)
  primaryEmotion: mysqlEnum("primary_emotion", [
    "joy",
    "gratitude",
    "peace",
    "excitement",
    "hope",
    "sadness",
    "anxiety",
    "anger",
    "frustration",
    "fear",
    "shame",
    "guilt",
    "neutral"
  ]),
  
  emotionIntensity: int("emotion_intensity"), // 1-10
  secondaryEmotions: text("secondary_emotions"), // JSON array
  
  // Themes (AI-Detected)
  themes: text("themes"), // JSON: relationships, work, health, etc.
  
  // Cognitive Patterns (AI-Detected)
  cognitiveDistortions: text("cognitive_distortions"), // JSON: catastrophizing, black-and-white thinking, etc.
  
  // Insights (AI-Generated)
  aiInsights: text("ai_insights"), // JSON: patterns, suggestions, reflections
  
  // Word Count
  wordCount: int("word_count"),
  
  // Duration
  writingDurationMinutes: int("writing_duration_minutes"),
  
  // Privacy
  privacy: mysqlEnum("privacy", ["private", "shared_with_coach", "shared_with_community"]).default("private"),
  
  // Favorite
  isFavorite: boolean("is_favorite").default(false),
  
  // Tags
  tags: text("tags"), // JSON array
  
  // Related
  relatedGoalId: varchar("related_goal_id", { length: 255 }),
  relatedEventId: varchar("related_event_id", { length: 255 }),
  
  entryDate: timestamp("entry_date").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal Prompts Library
export const journalPrompts = mysqlTable("journal_prompts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Prompt Details
  promptText: text("prompt_text").notNull(),
  description: text("description"),
  
  // Category
  category: mysqlEnum("category", [
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
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]),
  
  // Effectiveness
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  totalUses: int("total_uses").default(0),
  
  // Active
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gratitude Entries (Specific Type)
export const gratitudeEntries = mysqlTable("gratitude_entries", {
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
  gratitudeLevel: int("gratitude_level"), // 1-10
  
  entryDate: timestamp("entry_date").defaultNow(),
});

// Best Possible Self Entries (Laura King's exercise)
export const bestPossibleSelfEntries = mysqlTable("best_possible_self_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  journalEntryId: varchar("journal_entry_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Timeframe
  timeframe: mysqlEnum("timeframe", ["1_year", "5_years", "10_years", "end_of_life"]).notNull(),
  
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

// Daily Reviews
export const dailyReviews = mysqlTable("daily_reviews", {
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
  dayRating: int("day_rating"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Emotional Patterns (AI-Detected)
export const emotionalPatterns = mysqlTable("emotional_patterns", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Pattern Type
  patternType: mysqlEnum("pattern_type", [
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
  occurrenceCount: int("occurrence_count").default(0),
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

// Journal Insights (AI-Generated)
export const journalInsights = mysqlTable("journal_insights", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Insight Type
  insightType: mysqlEnum("insight_type", [
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

// Writing Streaks
export const writingStreaks = mysqlTable("writing_streaks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Streak Details
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  
  // Length
  streakLength: int("streak_length"), // Days
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Journal Reflections (Meta-Journaling)
export const journalReflections = mysqlTable("journal_reflections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Reflection Period
  periodType: mysqlEnum("period_type", ["weekly", "monthly", "quarterly", "yearly"]).notNull(),
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

// Prompt Effectiveness (Self-Learning)
export const promptEffectiveness = mysqlTable("prompt_effectiveness", {
  id: varchar("id", { length: 255 }).primaryKey(),
  promptId: varchar("prompt_id", { length: 255 }).notNull(),
  
  // Usage Stats
  totalUses: int("total_uses").default(0),
  
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
  userCount: int("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal Analytics (Self-Learning)
export const journalAnalytics = mysqlTable("journal_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Entry Type
  entryType: varchar("entry_type", { length: 100 }).notNull(),
  
  // Effectiveness Metrics
  avgMoodImprovement: decimal("avg_mood_improvement", { precision: 4, scale: 2 }),
  avgInsightsGenerated: decimal("avg_insights_generated", { precision: 4, scale: 2 }),
  avgBehaviorChange: decimal("avg_behavior_change", { precision: 5, scale: 2 }), // % who took action
  
  // Optimal Parameters
  optimalWordCount: int("optimal_word_count"),
  optimalDuration: int("optimal_duration"), // minutes
  optimalTimeOfDay: varchar("optimal_time_of_day", { length: 100 }),
  
  // Best For
  mostEffectiveFor: text("most_effective_for"), // JSON: user types, situations
  
  // Sample Size
  userCount: int("user_count"),
  totalEntries: int("total_entries"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
