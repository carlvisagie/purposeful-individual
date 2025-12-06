/**
 * GOAL SETTING & ACHIEVEMENT SYSTEM
 * Evidence-based approach using Goal-Setting Theory, Implementation Science, and Achievement Psychology
 * Research sources: Edwin Locke & Gary Latham (goal-setting theory), Gabriele Oettingen (WOOP),
 * Peter Gollwitzer (implementation intentions), Angela Duckworth (grit), Carol Dweck (growth mindset),
 * Heidi Grant Halvorson (goal achievement), James Clear (systems vs goals), Charles Duhigg (goal frameworks)
 * 
 * CORE PRINCIPLES:
 * 1. Specific > Vague (SMART goals)
 * 2. Process > Outcome (systems thinking)
 * 3. Implementation Intentions (if-then planning)
 * 4. Mental Contrasting (WOOP method)
 * 5. Progress Tracking (what gets measured gets done)
 * 6. Identity-Based Goals (who you're becoming)
 * 
 * GOAL FRAMEWORKS SUPPORTED:
 * - SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
 * - OKRs (Objectives & Key Results)
 * - WOOP (Wish, Outcome, Obstacle, Plan)
 * - Implementation Intentions (if-then planning)
 * - Habit-Based Goals (systems approach)
 * - Identity-Based Goals (I am X type of person)
 * 
 * GOAL TYPES:
 * - Outcome goals (what you want to achieve)
 * - Process goals (what you'll do)
 * - Performance goals (standards to meet)
 * - Learning goals (skills to acquire)
 * - Avoidance goals (what to stop doing)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Identifies which goal types you achieve most
 * - Predicts goal success probability
 * - Learns optimal goal difficulty for you
 * - Suggests accountability mechanisms
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Goal Profiles
export const goalProfiles = mysqlTable("goal_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Achievement Stats
  totalGoalsSet: int("total_goals_set").default(0),
  totalGoalsAchieved: int("total_goals_achieved").default(0),
  totalGoalsAbandoned: int("total_goals_abandoned").default(0),
  achievementRate: decimal("achievement_rate", { precision: 5, scale: 2 }), // %
  
  // Goal-Setting Style
  preferredFramework: mysqlEnum("preferred_framework", [
    "smart",
    "okr",
    "woop",
    "habit_based",
    "identity_based"
  ]),
  
  // Optimal Parameters (Self-Learning)
  optimalGoalDifficulty: int("optimal_goal_difficulty"), // 1-10
  optimalTimeframe: varchar("optimal_timeframe", { length: 100 }), // "30 days", "90 days", etc.
  optimalGoalCount: int("optimal_goal_count"), // How many concurrent goals?
  
  // Motivation Type
  motivationType: mysqlEnum("motivation_type", [
    "outcome_focused", // Wants the result
    "process_focused", // Enjoys the journey
    "identity_focused", // Wants to become someone
    "mixed"
  ]),
  
  // Accountability Preferences
  needsAccountability: boolean("needs_accountability").default(false),
  preferredAccountabilityType: mysqlEnum("preferred_accountability_type", [
    "self",
    "partner",
    "group",
    "public",
    "coach"
  ]),
  
  // Success Patterns
  successPatterns: text("success_patterns"), // JSON: what leads to success for this user
  failurePatterns: text("failure_patterns"), // JSON: what leads to failure
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Goals
export const goals = mysqlTable("goals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Goal Details
  goalName: varchar("goal_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Goal Type
  goalType: mysqlEnum("goal_type", [
    "outcome", // Achieve a specific result
    "process", // Follow a specific process
    "performance", // Meet a standard
    "learning", // Acquire a skill
    "avoidance", // Stop doing something
    "identity" // Become a type of person
  ]).notNull(),
  
  // Framework
  framework: mysqlEnum("framework", ["smart", "okr", "woop", "habit_based", "identity_based"]),
  
  // SMART Criteria
  specific: boolean("specific").default(false), // Is it specific?
  measurable: boolean("measurable").default(false), // Can it be measured?
  achievable: boolean("achievable").default(false), // Is it realistic?
  relevant: boolean("relevant").default(false), // Does it matter?
  timeBound: boolean("time_bound").default(false), // Does it have a deadline?
  
  // Category
  category: mysqlEnum("category", [
    "health",
    "fitness",
    "career",
    "financial",
    "relationships",
    "personal_growth",
    "learning",
    "creative",
    "spiritual",
    "other"
  ]),
  
  // Difficulty
  difficulty: int("difficulty"), // 1-10
  
  // Timeline
  startDate: timestamp("start_date"),
  targetDate: timestamp("target_date"),
  
  // Measurement
  metricType: mysqlEnum("metric_type", ["number", "percentage", "boolean", "custom"]),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }), // kg, %, hours, etc.
  
  // Progress
  progressPercent: decimal("progress_percent", { precision: 5, scale: 2 }), // 0-100
  
  // Status
  status: mysqlEnum("status", [
    "not_started",
    "in_progress",
    "on_track",
    "at_risk",
    "behind",
    "achieved",
    "abandoned"
  ]).default("not_started"),
  
  // Priority
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  
  // Visibility
  isPublic: boolean("is_public").default(false), // Share with community?
  
  // Related
  relatedHabitId: varchar("related_habit_id", { length: 255 }), // Link to habit
  relatedGoalId: varchar("related_goal_id", { length: 255 }), // Parent/child goals
  
  // Completion
  completedAt: timestamp("completed_at"),
  abandonedAt: timestamp("abandoned_at"),
  abandonReason: text("abandon_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OKRs (Objectives & Key Results)
export const okrs = mysqlTable("okrs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Objective (the goal)
  objective: text("objective").notNull(),
  
  // Time Period
  timePeriod: mysqlEnum("time_period", ["quarterly", "annual", "custom"]),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Overall Progress
  overallProgress: decimal("overall_progress", { precision: 5, scale: 2 }), // 0-100
  
  // Status
  status: mysqlEnum("status", ["not_started", "in_progress", "achieved", "abandoned"]).default("not_started"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Key Results
export const keyResults = mysqlTable("key_results", {
  id: varchar("id", { length: 255 }).primaryKey(),
  okrId: varchar("okr_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Key Result Details
  keyResult: text("key_result").notNull(),
  
  // Measurement
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  
  // Progress
  progressPercent: decimal("progress_percent", { precision: 5, scale: 2 }), // 0-100
  
  // Status
  status: mysqlEnum("status", ["not_started", "in_progress", "achieved"]).default("not_started"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WOOP Plans (Mental Contrasting)
export const woopPlans = mysqlTable("woop_plans", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Wish
  wish: text("wish").notNull(), // What do you want?
  
  // Outcome
  outcome: text("outcome").notNull(), // What's the best outcome?
  outcomeVisualization: text("outcome_visualization"), // Detailed visualization
  
  // Obstacle
  obstacle: text("obstacle").notNull(), // What will get in the way?
  obstacleAnticipation: text("obstacle_anticipation"), // How likely is this obstacle?
  
  // Plan
  plan: text("plan").notNull(), // If obstacle occurs, then I will...
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Implementation Intentions (If-Then Plans)
export const implementationIntentions = mysqlTable("implementation_intentions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // If-Then Statement
  ifCondition: text("if_condition").notNull(), // If [situation]...
  thenAction: text("then_action").notNull(), // Then I will [action]...
  
  // Type
  intentionType: mysqlEnum("intention_type", [
    "initiation", // When to start
    "execution", // How to do it
    "obstacle_management", // How to handle obstacles
    "recovery" // How to get back on track
  ]),
  
  // Effectiveness
  timesTriggered: int("times_triggered").default(0),
  timesExecuted: int("times_executed").default(0),
  executionRate: decimal("execution_rate", { precision: 5, scale: 2 }), // %
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Goal Milestones
export const goalMilestones = mysqlTable("goal_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Milestone Details
  milestoneName: varchar("milestone_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Target
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  targetDate: timestamp("target_date"),
  
  // Progress
  achieved: boolean("achieved").default(false),
  achievedAt: timestamp("achieved_at"),
  
  // Order
  sequenceOrder: int("sequence_order"), // 1st milestone, 2nd, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Goal Progress Logs
export const goalProgressLogs = mysqlTable("goal_progress_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Progress Update
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull(),
  progressPercent: decimal("progress_percent", { precision: 5, scale: 2 }),
  
  // Context
  notes: text("notes"),
  
  // Momentum
  momentum: mysqlEnum("momentum", ["accelerating", "steady", "slowing", "stalled"]),
  
  logDate: timestamp("log_date").defaultNow(),
});

// Goal Obstacles
export const goalObstacles = mysqlTable("goal_obstacles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Obstacle Details
  obstacleName: varchar("obstacle_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Type
  obstacleType: mysqlEnum("obstacle_type", [
    "internal", // Motivation, fear, habits
    "external", // Time, money, resources
    "skill", // Lack of knowledge/ability
    "environmental", // Circumstances
    "social" // Other people
  ]),
  
  // Severity
  severity: int("severity"), // 1-10
  
  // Frequency
  occurrenceCount: int("occurrence_count").default(0),
  lastOccurrence: timestamp("last_occurrence"),
  
  // Solution
  solution: text("solution"), // How to overcome this
  solutionEffective: boolean("solution_effective"),
  
  // Status
  overcome: boolean("overcome").default(false),
  overcameAt: timestamp("overcame_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Goal Accountability
export const goalAccountability = mysqlTable("goal_accountability", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Accountability Type
  accountabilityType: mysqlEnum("accountability_type", [
    "self_tracking",
    "accountability_partner",
    "group",
    "public_commitment",
    "coach",
    "financial_stake" // Put money on the line
  ]).notNull(),
  
  // Partner (if applicable)
  partnerId: varchar("partner_id", { length: 255 }),
  
  // Check-In Frequency
  checkInFrequency: mysqlEnum("check_in_frequency", ["daily", "weekly", "biweekly", "monthly"]),
  
  // Last Check-In
  lastCheckIn: timestamp("last_check_in"),
  nextCheckIn: timestamp("next_check_in"),
  
  // Effectiveness
  adherenceRate: decimal("adherence_rate", { precision: 5, scale: 2 }), // % of check-ins completed
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Goal Reflections
export const goalReflections = mysqlTable("goal_reflections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Reflection Type
  reflectionType: mysqlEnum("reflection_type", [
    "weekly_review",
    "monthly_review",
    "achievement_reflection",
    "obstacle_reflection",
    "abandonment_reflection"
  ]).notNull(),
  
  // Reflection Questions
  whatWorked: text("what_worked"),
  whatDidntWork: text("what_didnt_work"),
  lessonsLearned: text("lessons_learned"),
  adjustmentsNeeded: text("adjustments_needed"),
  
  // Mood
  confidenceLevel: int("confidence_level"), // 1-10
  motivationLevel: int("motivation_level"), // 1-10
  
  reflectionDate: timestamp("reflection_date").defaultNow(),
});

// Goal Predictions (AI-Powered)
export const goalPredictions = mysqlTable("goal_predictions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goalId: varchar("goal_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Prediction Type
  predictionType: mysqlEnum("prediction_type", [
    "success_probability", // Will you achieve this goal?
    "completion_date", // When will you achieve it?
    "obstacle_likelihood", // What obstacles will you face?
    "optimal_adjustment" // What should you change?
  ]).notNull(),
  
  // Prediction
  prediction: text("prediction"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // %
  
  // Contributing Factors
  factors: text("factors"), // JSON: what influences this prediction
  
  // Recommendation
  recommendation: text("recommendation"),
  
  // Validation
  actualOutcome: text("actual_outcome"),
  predictionAccurate: boolean("prediction_accurate"),
  
  createdAt: timestamp("created_at").defaultNow(),
  validatedAt: timestamp("validated_at"),
});

// Goal Analytics (Self-Learning)
export const goalAnalytics = mysqlTable("goal_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Goal Type
  goalType: varchar("goal_type", { length: 100 }).notNull(),
  
  // Success Metrics
  avgAchievementRate: decimal("avg_achievement_rate", { precision: 5, scale: 2 }), // %
  avgTimeToCompletion: int("avg_time_to_completion"), // days
  avgAbandonmentRate: decimal("avg_abandonment_rate", { precision: 5, scale: 2 }), // %
  
  // Optimal Parameters
  optimalDifficulty: int("optimal_difficulty"), // 1-10
  optimalTimeframe: int("optimal_timeframe"), // days
  optimalAccountabilityType: varchar("optimal_accountability_type", { length: 100 }),
  
  // Success Factors
  successFactors: text("success_factors"), // JSON: what predicts success
  failureFactors: text("failure_factors"), // JSON: what predicts failure
  
  // Sample Size
  userCount: int("user_count"),
  totalGoals: int("total_goals"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
