/**
 * PHYSICAL / EXERCISE ENGINE
 * Evidence-based approach using Exercise Science, Biomechanics, Recovery Science, and Movement Research
 * Research sources: Andrew Huberman (exercise neuroscience), Peter Attia (longevity), Kelly Starrett (mobility), Pavel Tsatsouline (strength)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Tracks exercise response and recovery patterns
 * - Learns optimal training frequency/volume for each user
 * - Identifies injury risk patterns
 * - Adapts programming based on progress and recovery
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Physical Profiles
export const physicalProfiles = mysqlTable("physical_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current State
  fitnessLevel: mysqlEnum("fitness_level", ["sedentary", "beginner", "intermediate", "advanced", "athlete"]),
  
  // Measurements
  height: int("height"), // cm
  weight: decimal("weight", { precision: 5, scale: 2 }), // kg
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 4, scale: 1 }),
  
  // Goals
  primaryGoal: mysqlEnum("primary_goal", [
    "lose_weight",
    "build_muscle",
    "increase_strength",
    "improve_endurance",
    "enhance_mobility",
    "athletic_performance",
    "general_health",
    "injury_recovery",
    "longevity"
  ]).notNull(),
  
  specificGoals: text("specific_goals"), // JSON array
  
  // Limitations
  injuries: text("injuries"), // JSON array: current injuries
  injuryHistory: text("injury_history"), // JSON array: past injuries
  limitations: text("limitations"), // JSON: mobility restrictions, pain, etc.
  
  // Experience
  experienceLevel: text("experience_level"), // JSON: {strength_training: "intermediate", cardio: "advanced", etc.}
  
  // Preferences
  preferredExerciseTypes: text("preferred_exercise_types"), // JSON array
  availableEquipment: text("available_equipment"), // JSON array
  timeAvailable: int("time_available"), // minutes per session
  
  // Self-Learning Data
  optimalTrainingFrequency: int("optimal_training_frequency"), // days per week
  optimalSessionDuration: int("optimal_session_duration"), // minutes
  bestRecoveryStrategies: text("best_recovery_strategies"), // JSON
  injuryRiskFactors: text("injury_risk_factors"), // JSON: patterns that lead to injury
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workouts
export const workouts = mysqlTable("workouts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  workoutDate: timestamp("workout_date").notNull(),
  
  // Workout Type
  workoutType: mysqlEnum("workout_type", [
    "strength_training",
    "cardio",
    "HIIT",
    "yoga",
    "mobility",
    "sports",
    "walking",
    "running",
    "cycling",
    "swimming",
    "martial_arts",
    "dance",
    "other"
  ]).notNull(),
  
  // Focus
  primaryFocus: mysqlEnum("primary_focus", [
    "upper_body",
    "lower_body",
    "full_body",
    "core",
    "push",
    "pull",
    "legs",
    "cardio",
    "flexibility",
    "balance"
  ]),
  
  // Duration & Intensity
  duration: int("duration"), // minutes
  intensity: mysqlEnum("intensity", ["low", "moderate", "high", "max"]),
  perceivedExertion: int("perceived_exertion"), // 1-10 (RPE)
  
  // State Before
  energyBefore: int("energy_before"), // 1-10
  soreness Before: int("soreness_before"), // 1-10
  motivationBefore: int("motivation_before"), // 1-10
  
  // Performance
  performanceRating: int("performance_rating"), // 1-10
  personalRecords: text("personal_records"), // JSON: any PRs achieved
  
  // State After
  energyAfter: int("energy_after"), // 1-10
  sorenessAfter: int("soreness_after"), // 1-10
  satisfactionLevel: int("satisfaction_level"), // 1-10
  
  // Environment
  location: varchar("location", { length: 255 }),
  temperature: int("temperature"), // celsius
  
  // Notes
  notes: text("notes"),
  
  // Completion
  completed: boolean("completed").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercises (within workouts)
export const exercises = mysqlTable("exercises", {
  id: varchar("id", { length: 255 }).primaryKey(),
  workoutId: varchar("workout_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Exercise Details
  exerciseName: varchar("exercise_name", { length: 255 }).notNull(),
  exerciseType: mysqlEnum("exercise_type", [
    "compound", // Multi-joint (squat, deadlift, bench)
    "isolation", // Single-joint (bicep curl, leg extension)
    "cardio",
    "plyometric",
    "isometric",
    "mobility",
    "balance"
  ]),
  
  muscleGroup: varchar("muscle_group", { length: 255 }), // Primary muscle worked
  
  // Sets & Reps
  sets: int("sets"),
  reps: text("reps"), // JSON array (can vary per set)
  weight: text("weight"), // JSON array (kg per set)
  
  // Rest
  restBetweenSets: int("rest_between_sets"), // seconds
  
  // Tempo (if tracked)
  tempo: varchar("tempo", { length: 50 }), // e.g., "3-1-2-0" (eccentric-pause-concentric-pause)
  
  // Range of Motion
  rangeOfMotion: mysqlEnum("range_of_motion", ["full", "partial", "limited"]),
  
  // Quality
  formQuality: int("form_quality"), // 1-10
  difficulty: int("difficulty"), // 1-10
  
  // Progression
  progressionFromLast: varchar("progression_from_last", { length: 255 }), // More weight, reps, better form, etc.
  
  // Pain/Discomfort
  painDuring: boolean("pain_during"),
  painLocation: varchar("pain_location", { length: 255 }),
  painLevel: int("pain_level"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Cardio Sessions
export const cardioSessions = mysqlTable("cardio_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  workoutId: varchar("workout_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sessionDate: timestamp("session_date").notNull(),
  
  // Activity
  activityType: mysqlEnum("activity_type", [
    "running",
    "cycling",
    "swimming",
    "rowing",
    "walking",
    "hiking",
    "elliptical",
    "stair_climbing",
    "jump_rope",
    "other"
  ]).notNull(),
  
  // Duration & Distance
  duration: int("duration"), // minutes
  distance: decimal("distance", { precision: 6, scale: 2 }), // km
  
  // Intensity
  avgHeartRate: int("avg_heart_rate"), // bpm
  maxHeartRate: int("max_heart_rate"), // bpm
  heartRateZones: text("heart_rate_zones"), // JSON: time in each zone
  
  avgPace: varchar("avg_pace", { length: 50 }), // min/km
  avgSpeed: decimal("avg_speed", { precision: 5, scale: 2 }), // km/h
  
  // Elevation
  elevationGain: int("elevation_gain"), // meters
  
  // Calories
  caloriesBurned: int("calories_burned"),
  
  // Performance
  performanceRating: int("performance_rating"), // 1-10
  
  // Recovery
  recoveryHeartRate: int("recovery_heart_rate"), // HR 1 min after stopping
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Mobility & Flexibility Work
export const mobilityWork = mysqlTable("mobility_work", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sessionDate: timestamp("session_date").notNull(),
  
  // Session Type
  sessionType: mysqlEnum("session_type", [
    "stretching",
    "foam_rolling",
    "yoga",
    "dynamic_warmup",
    "mobility_drills",
    "joint_prep"
  ]).notNull(),
  
  // Focus Areas
  areasWorked: text("areas_worked"), // JSON: hips, shoulders, ankles, etc.
  
  // Duration
  duration: int("duration"), // minutes
  
  // Quality
  rangeOfMotionBefore: int("range_of_motion_before"), // 1-10
  rangeOfMotionAfter: int("range_of_motion_after"), // 1-10
  
  painBefore: int("pain_before"), // 1-10
  painAfter: int("pain_after"), // 1-10
  
  // Techniques Used
  techniquesUsed: text("techniques_used"), // JSON array
  
  // Effectiveness
  effectiveness: int("effectiveness"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Recovery Tracking
export const recoveryTracking = mysqlTable("recovery_tracking", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  trackingDate: timestamp("tracking_date").notNull(),
  
  // Recovery Score (calculated or self-reported)
  recoveryScore: int("recovery_score"), // 1-10
  
  // Metrics
  restingHeartRate: int("resting_heart_rate"), // bpm
  hrv: int("hrv"), // Heart Rate Variability (ms)
  
  sleepQuality: int("sleep_quality"), // 1-10
  sleepHours: decimal("sleep_hours", { precision: 3, scale: 1 }),
  
  // Soreness
  overallSoreness: int("overall_soreness"), // 1-10
  soreAreas: text("sore_areas"), // JSON: specific muscles/joints
  
  // Energy & Readiness
  energyLevel: int("energy_level"), // 1-10
  readinessToTrain: int("readiness_to_train"), // 1-10
  
  // Stress
  stressLevel: int("stress_level"), // 1-10
  
  // Recovery Strategies Used
  recoveryStrategies: text("recovery_strategies"), // JSON: sleep, nutrition, massage, ice bath, etc.
  
  // Recommendations (self-learning)
  recommendedAction: mysqlEnum("recommended_action", [
    "full_training",
    "light_training",
    "active_recovery",
    "rest_day",
    "deload"
  ]),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Body Measurements
export const bodyMeasurements = mysqlTable("body_measurements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  measurementDate: timestamp("measurement_date").notNull(),
  
  // Weight
  weight: decimal("weight", { precision: 5, scale: 2 }), // kg
  
  // Body Composition
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 4, scale: 1 }),
  muscleMass: decimal("muscle_mass", { precision: 5, scale: 2 }), // kg
  
  // Circumferences (cm)
  neck: decimal("neck", { precision: 4, scale: 1 }),
  chest: decimal("chest", { precision: 4, scale: 1 }),
  waist: decimal("waist", { precision: 4, scale: 1 }),
  hips: decimal("hips", { precision: 4, scale: 1 }),
  bicepLeft: decimal("bicep_left", { precision: 4, scale: 1 }),
  bicepRight: decimal("bicep_right", { precision: 4, scale: 1 }),
  thighLeft: decimal("thigh_left", { precision: 4, scale: 1 }),
  thighRight: decimal("thigh_right", { precision: 4, scale: 1 }),
  calfLeft: decimal("calf_left", { precision: 4, scale: 1 }),
  calfRight: decimal("calf_right", { precision: 4, scale: 1 }),
  
  // Photos
  frontPhoto: varchar("front_photo", { length: 255 }),
  sidePhoto: varchar("side_photo", { length: 255 }),
  backPhoto: varchar("back_photo", { length: 255 }),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Strength Benchmarks
export const strengthBenchmarks = mysqlTable("strength_benchmarks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  testDate: timestamp("test_date").notNull(),
  
  // Exercise
  exercise: varchar("exercise", { length: 255 }).notNull(),
  
  // Test Type
  testType: mysqlEnum("test_type", [
    "1RM", // One rep max
    "3RM",
    "5RM",
    "max_reps", // Max reps at bodyweight or specific weight
    "time_to_failure"
  ]).notNull(),
  
  // Result
  weight: decimal("weight", { precision: 6, scale: 2 }), // kg
  reps: int("reps"),
  duration: int("duration"), // seconds (for time-based tests)
  
  // Relative Strength
  bodyweightRatio: decimal("bodyweight_ratio", { precision: 4, scale: 2 }), // weight lifted / bodyweight
  
  // Comparison
  improvementFromLast: decimal("improvement_from_last", { precision: 5, scale: 2 }), // percentage
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Physical Engine Self-Learning Analytics
export const physicalEngineAnalytics = mysqlTable("physical_engine_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Training Effectiveness (aggregated)
  workoutType: varchar("workout_type", { length: 100 }).notNull(),
  
  // Effectiveness Metrics
  avgRecoveryScore: decimal("avg_recovery_score", { precision: 5, scale: 2 }),
  avgProgressionRate: decimal("avg_progression_rate", { precision: 5, scale: 2 }), // % improvement per week
  injuryRate: decimal("injury_rate", { precision: 5, scale: 2 }), // % of users who get injured
  
  // Optimal Parameters
  optimalFrequency: int("optimal_frequency"), // sessions per week
  optimalDuration: int("optimal_duration"), // minutes
  optimalIntensity: varchar("optimal_intensity", { length: 50 }),
  
  // Recovery
  avgRecoveryTime: int("avg_recovery_time"), // hours needed
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different fitness levels
  
  // Sample Size
  workoutCount: int("workout_count"),
  userCount: int("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
