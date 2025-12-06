/**
 * EMOTIONAL ENGINE
 * Evidence-based approach using DBT, ACT, Emotion Regulation Research, and Resilience Science
 * Research sources: Marsha Linehan (DBT), Steven Hayes (ACT), Lisa Feldman Barrett (emotion construction), Susan David (emotional agility)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Identifies emotional patterns and triggers for each user
 * - Learns which regulation strategies work best per individual
 * - Predicts emotional states based on context
 * - Adapts interventions based on effectiveness
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Emotional Profiles
export const emotionalProfiles = mysqlTable("emotional_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Baseline Emotional State
  baselineEmotionalState: varchar("baseline_emotional_state", { length: 100 }),
  emotionalRange: mysqlEnum("emotional_range", ["narrow", "moderate", "wide"]), // How much do emotions fluctuate?
  emotionalIntensity: mysqlEnum("emotional_intensity", ["low", "moderate", "high"]),
  
  // Regulation Ability
  regulationSkillLevel: int("regulation_skill_level"), // 1-10
  awarenessLevel: int("awareness_level"), // 1-10 (how aware are you of your emotions?)
  
  // Challenges
  primaryChallenges: text("primary_challenges"), // JSON: overwhelm, numbness, mood_swings, anger, anxiety, etc.
  
  // Goals
  primaryGoal: mysqlEnum("primary_goal", [
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

// Emotion Tracking (Mood Logging)
export const emotionEntries = mysqlTable("emotion_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  entryDate: timestamp("entry_date").notNull(),
  
  // Primary Emotion (Lisa Feldman Barrett's emotion categories)
  primaryEmotion: varchar("primary_emotion", { length: 100 }).notNull(), // joy, sadness, anger, fear, disgust, surprise, etc.
  secondaryEmotions: text("secondary_emotions"), // JSON array
  
  // Intensity
  intensity: int("intensity"), // 1-10
  
  // Valence & Arousal (circumplex model)
  valence: int("valence"), // -5 to +5 (negative to positive)
  arousal: int("arousal"), // 1-10 (low energy to high energy)
  
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
  durationMinutes: int("duration_minutes"),
  
  // Regulation Attempted
  regulationUsed: boolean("regulation_used"),
  regulationStrategy: varchar("regulation_strategy", { length: 255 }),
  regulationEffectiveness: int("regulation_effectiveness"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// DBT Skills Practice
export const dbtSkillsPractice = mysqlTable("dbt_skills_practice", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // DBT Module
  dbtModule: mysqlEnum("dbt_module", [
    "mindfulness",
    "distress_tolerance",
    "emotion_regulation",
    "interpersonal_effectiveness"
  ]).notNull(),
  
  // Specific Skill
  skillUsed: mysqlEnum("skill_used", [
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
  intensityBefore: int("intensity_before"), // 1-10
  
  // Practice
  howUsed: text("how_used"),
  
  // Outcome
  emotionAfter: varchar("emotion_after", { length: 100 }),
  intensityAfter: int("intensity_after"), // 1-10
  
  // Effectiveness
  effectiveness: int("effectiveness"), // 1-10
  wouldUseAgain: boolean("would_use_again"),
  
  // Challenges
  challenges: text("challenges"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// ACT (Acceptance & Commitment Therapy) Practices
export const actPractices = mysqlTable("act_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // ACT Process
  actProcess: mysqlEnum("act_process", [
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
  acceptanceLevel: int("acceptance_level"), // 1-10 (how much did you accept vs. struggle?)
  defusionLevel: int("defusion_level"), // 1-10 (how much did you separate from the thought?)
  
  // Values Alignment
  valueIdentified: varchar("value_identified", { length: 255 }),
  actionTaken: text("action_taken"), // Values-based action
  
  // Outcome
  psychologicalFlexibility: int("psychological_flexibility"), // 1-10 (how flexible were you?)
  effectiveness: int("effectiveness"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Emotion Regulation Strategies
export const emotionRegulationStrategies = mysqlTable("emotion_regulation_strategies", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  useDate: timestamp("use_date").notNull(),
  
  // Strategy Type (evidence-based)
  strategyType: mysqlEnum("strategy_type", [
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
  intensityBefore: int("intensity_before"), // 1-10
  trigger: text("trigger"),
  
  // Strategy Application
  whatYouDid: text("what_you_did"),
  duration: int("duration"), // minutes
  
  // Outcome
  intensityAfter: int("intensity_after"), // 1-10
  emotionChanged: boolean("emotion_changed"),
  newEmotion: varchar("new_emotion", { length: 100 }),
  
  // Effectiveness
  immediateEffectiveness: int("immediate_effectiveness"), // 1-10
  longTermHelpful: boolean("long_term_helpful"), // Did this actually help or just avoid?
  
  // Side Effects
  sideEffects: text("side_effects"), // Any negative consequences?
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Resilience Building Activities
export const resilienceActivities = mysqlTable("resilience_activities", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  activityDate: timestamp("activity_date").notNull(),
  
  // Activity Type (evidence-based resilience factors)
  activityType: mysqlEnum("activity_type", [
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
  
  duration: int("duration"), // minutes
  
  // Impact
  resilienceImpact: int("resilience_impact"), // 1-10
  emotionalImpact: int("emotional_impact"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Emotional Processing (for difficult emotions)
export const emotionalProcessing = mysqlTable("emotional_processing", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  processingDate: timestamp("processing_date").notNull(),
  
  // What You're Processing
  emotionToProcess: varchar("emotion_to_process", { length: 100 }).notNull(),
  relatedEvent: text("related_event"),
  
  // Processing Method
  processingMethod: mysqlEnum("processing_method", [
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
  processingDepth: mysqlEnum("processing_depth", ["surface", "moderate", "deep"]),
  
  // Outcome
  feelingAfter: varchar("feeling_after", { length: 100 }),
  resolutionLevel: int("resolution_level"), // 1-10 (how resolved does this feel?)
  
  // Integration
  insights: text("insights"),
  actionSteps: text("action_steps"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Emotional Wins & Breakthroughs
export const emotionalWins = mysqlTable("emotional_wins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  winDate: timestamp("win_date").notNull(),
  
  winType: mysqlEnum("win_type", [
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

// Emotional Engine Self-Learning Analytics
export const emotionalEngineAnalytics = mysqlTable("emotional_engine_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Strategy Effectiveness (aggregated)
  strategyType: varchar("strategy_type", { length: 100 }).notNull(),
  emotionType: varchar("emotion_type", { length: 100 }).notNull(),
  
  // Effectiveness Metrics
  avgIntensityReduction: decimal("avg_intensity_reduction", { precision: 5, scale: 2 }),
  avgEffectivenessRating: decimal("avg_effectiveness_rating", { precision: 5, scale: 2 }),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // % of times it helped
  
  // Optimal Parameters
  optimalDuration: int("optimal_duration"), // minutes
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different emotional profiles
  
  // Sample Size
  useCount: int("use_count"),
  userCount: int("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
