/**
 * SLEEP OPTIMIZATION FEATURE
 * Evidence-based approach using Sleep Science, Circadian Biology, and Recovery Research
 * Research sources: Matthew Walker (Why We Sleep), Andrew Huberman (circadian optimization),
 * Peter Attia (sleep & longevity), Oura Ring research, WHOOP recovery science
 * 
 * CORE PRINCIPLES:
 * 1. Sleep Hygiene (evidence-based protocols)
 * 2. Circadian Rhythm Optimization
 * 3. Sleep Stages & Quality
 * 4. Recovery Metrics (HRV, resting HR)
 * 5. Sleep-Performance Correlation
 * 6. Memory Consolidation (integrates with Memory Engine)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Identifies personal sleep need (7-9 hours varies by individual)
 * - Learns optimal bedtime/wake time for each user
 * - Correlates sleep quality with next-day performance
 * - Predicts recovery based on sleep patterns
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Sleep Profiles
export const sleepProfiles = mysqlTable("sleep_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Sleep Goals
  targetSleepDuration: decimal("target_sleep_duration", { precision: 3, scale: 1 }), // hours
  targetBedtime: varchar("target_bedtime", { length: 10 }), // HH:MM
  targetWakeTime: varchar("target_wake_time", { length: 10 }), // HH:MM
  
  // Chronotype (circadian preference)
  chronotype: mysqlEnum("chronotype", ["early_bird", "night_owl", "intermediate", "unknown"]),
  
  // Current Issues
  sleepIssues: text("sleep_issues"), // JSON array: insomnia, apnea, restless, etc.
  
  // Tracking Method
  trackingMethod: mysqlEnum("tracking_method", ["manual", "wearable", "app"]),
  wearableDevice: varchar("wearable_device", { length: 100 }), // Oura, WHOOP, Apple Watch, etc.
  
  // Self-Learning Data
  personalSleepNeed: decimal("personal_sleep_need", { precision: 3, scale: 1 }), // Calculated optimal hours
  optimalBedtime: varchar("optimal_bedtime", { length: 10 }),
  optimalWakeTime: varchar("optimal_wake_time", { length: 10 }),
  sleepPerformanceCorrelations: text("sleep_performance_correlations"), // JSON: how sleep affects different areas
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily Sleep Tracking
export const sleepTracking = mysqlTable("sleep_tracking", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  sleepDate: timestamp("sleep_date").notNull(), // Date of the night
  
  // Sleep Times
  bedtime: timestamp("bedtime"),
  wakeTime: timestamp("wake_time"),
  
  // Duration
  timeInBed: decimal("time_in_bed", { precision: 4, scale: 2 }), // hours
  actualSleepDuration: decimal("actual_sleep_duration", { precision: 4, scale: 2 }), // hours
  sleepEfficiency: decimal("sleep_efficiency", { precision: 5, scale: 2 }), // % (sleep duration / time in bed)
  
  // Sleep Stages (if available from wearable)
  lightSleepMinutes: int("light_sleep_minutes"),
  deepSleepMinutes: int("deep_sleep_minutes"),
  remSleepMinutes: int("rem_sleep_minutes"),
  awakeMinutes: int("awake_minutes"),
  
  // Quality Metrics
  sleepQuality: int("sleep_quality"), // 1-10 subjective
  sleepScore: int("sleep_score"), // 0-100 (if from wearable)
  
  // Disruptions
  timesToWakeUp: int("times_to_wake_up"),
  timeToFallAsleep: int("time_to_fall_asleep"), // minutes (sleep latency)
  
  // Recovery Metrics
  restingHeartRate: int("resting_heart_rate"), // bpm
  hrv: int("hrv"), // Heart Rate Variability (ms)
  respiratoryRate: decimal("respiratory_rate", { precision: 4, scale: 2 }), // breaths per minute
  bodyTemperature: decimal("body_temperature", { precision: 4, scale: 2 }), // Celsius
  
  // Recovery Score
  recoveryScore: int("recovery_score"), // 0-100
  readinessScore: int("readiness_score"), // 0-100 (Oura-style)
  
  // Morning State
  morningMood: varchar("morning_mood", { length: 100 }),
  morningEnergy: int("morning_energy"), // 1-10
  morningFocus: int("morning_focus"), // 1-10
  
  // Sleep Hygiene Compliance
  hygieneScore: int("hygiene_score"), // 0-100
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Sleep Hygiene Practices
export const sleepHygienePractices = mysqlTable("sleep_hygiene_practices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sleepTrackingId: varchar("sleep_tracking_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  
  // Evening Routine (evidence-based practices)
  noScreens1HourBefore: boolean("no_screens_1_hour_before"),
  dimLightsEvening: boolean("dim_lights_evening"),
  coolRoomTemp: boolean("cool_room_temp"), // 60-67°F optimal
  darkRoom: boolean("dark_room"),
  quietEnvironment: boolean("quiet_environment"),
  
  // Timing
  consistentBedtime: boolean("consistent_bedtime"),
  consistentWakeTime: boolean("consistent_wake_time"),
  
  // Substances
  noCaffeineAfter2pm: boolean("no_caffeine_after_2pm"),
  noAlcohol: boolean("no_alcohol"),
  noHeavyMealBefore3Hours: boolean("no_heavy_meal_before_3_hours"),
  
  // Daytime Practices
  morningLightExposure: boolean("morning_light_exposure"), // Huberman protocol
  exercisedToday: boolean("exercised_today"),
  noNapsAfter3pm: boolean("no_naps_after_3pm"),
  
  // Relaxation
  relaxationPractice: mysqlEnum("relaxation_practice", [
    "none",
    "meditation",
    "breathing",
    "reading",
    "stretching",
    "warm_bath",
    "journaling"
  ]),
  
  // Supplements (if any)
  supplements: text("supplements"), // JSON array: magnesium, glycine, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Sleep Experiments
export const sleepExperiments = mysqlTable("sleep_experiments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  experimentName: varchar("experiment_name", { length: 255 }).notNull(),
  hypothesis: text("hypothesis"), // What do you think will improve sleep?
  
  // What's Being Tested
  variable: varchar("variable", { length: 255 }).notNull(), // Bedtime, temperature, supplement, etc.
  
  // Duration
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  duration: int("duration"), // days
  
  // Baseline
  baselineSleepQuality: decimal("baseline_sleep_quality", { precision: 4, scale: 2 }),
  baselineSleepDuration: decimal("baseline_sleep_duration", { precision: 4, scale: 2 }),
  
  // Results
  avgSleepQualityDuringExperiment: decimal("avg_sleep_quality_during_experiment", { precision: 4, scale: 2 }),
  avgSleepDurationDuringExperiment: decimal("avg_sleep_duration_during_experiment", { precision: 4, scale: 2 }),
  
  // Impact
  improvement: decimal("improvement", { precision: 6, scale: 2 }), // % change
  
  // Conclusion
  conclusion: text("conclusion"),
  keepPractice: boolean("keep_practice"), // Will you continue this?
  
  // Status
  status: mysqlEnum("status", ["planning", "active", "completed"]).default("planning"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sleep-Performance Correlations
export const sleepPerformanceCorrelations = mysqlTable("sleep_performance_correlations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Performance Area
  performanceArea: mysqlEnum("performance_area", [
    "cognitive",
    "physical",
    "emotional",
    "productivity",
    "creativity",
    "social"
  ]).notNull(),
  
  // Correlation Strength
  correlationCoefficient: decimal("correlation_coefficient", { precision: 4, scale: 3 }), // -1 to 1
  
  // Optimal Sleep for This Area
  optimalSleepDuration: decimal("optimal_sleep_duration", { precision: 3, scale: 1 }),
  optimalSleepQuality: int("optimal_sleep_quality"),
  
  // Sample Size
  dataPoints: int("data_points"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sleep Insights (AI-Generated)
export const sleepInsights = mysqlTable("sleep_insights", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  insightType: mysqlEnum("insight_type", [
    "pattern_detected",
    "recommendation",
    "warning",
    "achievement",
    "correlation_found"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Supporting Data
  supportingData: text("supporting_data"), // JSON: evidence for this insight
  
  // Action Recommended
  actionRecommended: text("action_recommended"),
  
  // Priority
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  
  // User Response
  acknowledged: boolean("acknowledged").default(false),
  actionTaken: boolean("action_taken").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Sleep Analytics (Self-Learning)
export const sleepAnalytics = mysqlTable("sleep_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Hygiene Practice Effectiveness (aggregated)
  practice: varchar("practice", { length: 100 }).notNull(),
  
  // Impact Metrics
  avgSleepQualityImprovement: decimal("avg_sleep_quality_improvement", { precision: 5, scale: 2 }), // %
  avgSleepDurationImprovement: decimal("avg_sleep_duration_improvement", { precision: 5, scale: 2 }), // minutes
  
  // Optimal Parameters
  optimalImplementationTime: varchar("optimal_implementation_time", { length: 100 }), // When to do this practice
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  userCount: int("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
