/**
 * NUTRITION ENGINE
 * Evidence-based approach using Nutritional Science, Metabolic Health, Gut Health Research, and Behavioral Nutrition
 * Research sources: Layne Norton (protein research), Peter Attia (metabolic health), Tim Spector (gut microbiome), Brian Wansink (eating behavior)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Tracks food-mood-energy correlations
 * - Identifies trigger foods and sensitivities
 * - Learns optimal macronutrient ratios for each user
 * - Adapts meal timing recommendations based on performance
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Nutrition Profiles
export const nutritionProfiles = mysqlTable("nutrition_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current State
  currentWeight: decimal("current_weight", { precision: 5, scale: 2 }), // kg
  targetWeight: decimal("target_weight", { precision: 5, scale: 2 }), // kg
  height: int("height"), // cm
  
  // Goals
  primaryGoal: mysqlEnum("primary_goal", [
    "lose_fat",
    "build_muscle",
    "maintain_weight",
    "improve_health",
    "increase_energy",
    "gut_health",
    "athletic_performance",
    "disease_management"
  ]).notNull(),
  
  // Dietary Approach
  dietaryApproach: mysqlEnum("dietary_approach", [
    "balanced",
    "low_carb",
    "keto",
    "paleo",
    "vegan",
    "vegetarian",
    "mediterranean",
    "intermittent_fasting",
    "carnivore",
    "whole30",
    "flexible_dieting"
  ]),
  
  // Restrictions & Allergies
  allergies: text("allergies"), // JSON array
  intolerances: text("intolerances"), // JSON: lactose, gluten, etc.
  restrictions: text("restrictions"), // JSON: religious, ethical, etc.
  
  // Health Conditions
  healthConditions: text("health_conditions"), // JSON: diabetes, IBS, PCOS, etc.
  medications: text("medications"), // JSON array
  
  // Targets (calculated or custom)
  targetCalories: int("target_calories"),
  targetProtein: int("target_protein"), // grams
  targetCarbs: int("target_carbs"), // grams
  targetFat: int("target_fat"), // grams
  targetFiber: int("target_fiber"), // grams
  
  // Eating Patterns
  mealsPerDay: int("meals_per_day"),
  fastingWindow: int("fasting_window"), // hours (if IF)
  eatingWindow: int("eating_window"), // hours
  
  // Self-Learning Data
  optimalMacroRatio: text("optimal_macro_ratio"), // JSON: {protein: 30, carbs: 40, fat: 30}
  energyOptimalFoods: text("energy_optimal_foods"), // JSON: foods that boost energy
  triggerFoods: text("trigger_foods"), // JSON: foods that cause issues
  bestMealTiming: text("best_meal_timing"), // JSON: when to eat for best performance
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meals & Food Logging
export const meals = mysqlTable("meals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  mealDate: timestamp("meal_date").notNull(),
  
  // Meal Type
  mealType: mysqlEnum("meal_type", [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "pre_workout",
    "post_workout"
  ]).notNull(),
  
  // Foods
  foods: text("foods"), // JSON array: [{name, quantity, unit, calories, protein, carbs, fat}]
  
  // Macros (calculated from foods)
  totalCalories: int("total_calories"),
  totalProtein: decimal("total_protein", { precision: 5, scale: 1 }), // grams
  totalCarbs: decimal("total_carbs", { precision: 5, scale: 1 }), // grams
  totalFat: decimal("total_fat", { precision: 5, scale: 1 }), // grams
  totalFiber: decimal("total_fiber", { precision: 5, scale: 1 }), // grams
  totalSugar: decimal("total_sugar", { precision: 5, scale: 1 }), // grams
  
  // Context
  location: varchar("location", { length: 255 }), // Home, restaurant, work, etc.
  socialContext: mysqlEnum("social_context", ["alone", "family", "friends", "work"]),
  
  // Eating Behavior
  eatingSpeed: mysqlEnum("eating_speed", ["slow", "moderate", "fast"]),
  mindfulEating: boolean("mindful_eating"), // Were you present while eating?
  distractions: text("distractions"), // JSON: TV, phone, work, etc.
  
  // Hunger & Satisfaction
  hungerBefore: int("hunger_before"), // 1-10
  hungerAfter: int("hunger_after"), // 1-10
  satisfactionLevel: int("satisfaction_level"), // 1-10
  
  // Emotional State
  emotionBefore: varchar("emotion_before", { length: 100 }),
  emotionalEating: boolean("emotional_eating"), // Was this emotion-driven?
  
  // Post-Meal Effects (tracked later)
  energyAfter: int("energy_after"), // 1-10 (30-60 min post-meal)
  digestionQuality: int("digestion_quality"), // 1-10
  bloating: int("bloating"), // 1-10
  
  // Photos
  mealPhoto: varchar("meal_photo", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Nutrition Summary
export const dailyNutritionSummary = mysqlTable("daily_nutrition_summary", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  summaryDate: timestamp("summary_date").notNull(),
  
  // Total Macros
  totalCalories: int("total_calories"),
  totalProtein: decimal("total_protein", { precision: 6, scale: 1 }),
  totalCarbs: decimal("total_carbs", { precision: 6, scale: 1 }),
  totalFat: decimal("total_fat", { precision: 6, scale: 1 }),
  totalFiber: decimal("total_fiber", { precision: 5, scale: 1 }),
  
  // Hydration
  waterIntake: decimal("water_intake", { precision: 4, scale: 1 }), // liters
  
  // Adherence
  calorieAdherence: int("calorie_adherence"), // % of target
  proteinAdherence: int("protein_adherence"), // % of target
  
  // Quality
  vegetableServings: int("vegetable_servings"),
  fruitServings: int("fruit_servings"),
  processedFoodServings: int("processed_food_servings"),
  
  // Overall Ratings
  nutritionQuality: int("nutrition_quality"), // 1-10
  adherenceRating: int("adherence_rating"), // 1-10
  
  // Energy & Performance
  avgEnergyLevel: int("avg_energy_level"), // 1-10
  sleepQuality: int("sleep_quality"), // 1-10 (that night)
  workoutPerformance: int("workout_performance"), // 1-10 (if workout that day)
  
  // Digestive Health
  bowelMovements: int("bowel_movements"),
  digestiveComfort: int("digestive_comfort"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Supplements
export const supplements = mysqlTable("supplements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Supplement Details
  supplementName: varchar("supplement_name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  
  // Purpose
  purpose: mysqlEnum("purpose", [
    "vitamin_mineral", // General health
    "protein", // Muscle building
    "performance", // Pre-workout, creatine, etc.
    "recovery", // Post-workout, sleep
    "gut_health", // Probiotics, fiber
    "cognitive", // Nootropics
    "immune", // Vitamin C, zinc, etc.
    "joint_health",
    "other"
  ]).notNull(),
  
  // Dosage
  dosage: varchar("dosage", { length: 255 }),
  unit: varchar("unit", { length: 50 }),
  frequency: mysqlEnum("frequency", ["daily", "twice_daily", "as_needed", "weekly"]),
  
  // Timing
  timing: mysqlEnum("timing", ["morning", "afternoon", "evening", "with_meal", "before_bed", "pre_workout", "post_workout"]),
  
  // Active
  active: boolean("active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Effectiveness (self-learning)
  perceivedEffectiveness: int("perceived_effectiveness"), // 1-10
  sideEffects: text("side_effects"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supplement Logs
export const supplementLogs = mysqlTable("supplement_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  supplementId: varchar("supplement_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  logDate: timestamp("log_date").notNull(),
  
  taken: boolean("taken").default(true),
  dosage: varchar("dosage", { length: 255 }),
  
  // Context
  timing: varchar("timing", { length: 100 }),
  withFood: boolean("with_food"),
  
  // Effects
  perceivedEffect: int("perceived_effect"), // 1-10
  sideEffects: text("side_effects"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Food Sensitivities & Reactions
export const foodReactions = mysqlTable("food_reactions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  reactionDate: timestamp("reaction_date").notNull(),
  
  // Food
  suspectedFood: varchar("suspected_food", { length: 255 }).notNull(),
  
  // Reaction Type
  reactionType: mysqlEnum("reaction_type", [
    "digestive", // Bloating, gas, diarrhea, constipation
    "skin", // Rash, hives, eczema
    "respiratory", // Congestion, asthma
    "energy", // Fatigue, brain fog
    "mood", // Anxiety, irritability
    "headache",
    "other"
  ]).notNull(),
  
  // Symptoms
  symptoms: text("symptoms"), // JSON array
  severity: mysqlEnum("severity", ["mild", "moderate", "severe"]),
  
  // Timing
  onsetTime: int("onset_time"), // minutes after eating
  duration: int("duration"), // hours
  
  // Pattern
  consistentReaction: boolean("consistent_reaction"), // Does this food always cause this?
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Hydration Tracking
export const hydrationLogs = mysqlTable("hydration_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  logDate: timestamp("log_date").notNull(),
  
  // Intake
  waterIntake: decimal("water_intake", { precision: 4, scale: 2 }), // liters
  
  // Other Beverages
  coffee: int("coffee"), // cups
  tea: int("tea"), // cups
  alcohol: int("alcohol"), // standard drinks
  
  // Hydration Status
  urineColor: mysqlEnum("urine_color", ["clear", "pale_yellow", "yellow", "dark_yellow", "amber"]), // Hydration indicator
  
  // Symptoms
  headache: boolean("headache"),
  fatigue: boolean("fatigue"),
  dryMouth: boolean("dry_mouth"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Meal Planning
export const mealPlans = mysqlTable("meal_plans", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  planName: varchar("plan_name", { length: 255 }).notNull(),
  
  // Duration
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Meals
  meals: text("meals"), // JSON: {monday: {breakfast: [], lunch: [], dinner: []}, ...}
  
  // Shopping List
  shoppingList: text("shopping_list"), // JSON array
  
  // Prep Notes
  prepNotes: text("prep_notes"),
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Nutrition Experiments (Elimination diets, macro cycling, etc.)
export const nutritionExperiments = mysqlTable("nutrition_experiments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  experimentName: varchar("experiment_name", { length: 255 }).notNull(),
  
  // Type
  experimentType: mysqlEnum("experiment_type", [
    "elimination_diet", // Remove suspected trigger foods
    "macro_cycling", // Vary macros by day
    "meal_timing", // Change when you eat
    "supplement_trial", // Test a new supplement
    "food_introduction", // Reintroduce eliminated food
    "calorie_cycling", // Vary calories by day
    "other"
  ]).notNull(),
  
  // Hypothesis
  hypothesis: text("hypothesis"), // What do you expect to happen?
  
  // Duration
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Protocol
  protocol: text("protocol"), // What exactly are you doing?
  
  // Baseline Metrics
  baselineWeight: decimal("baseline_weight", { precision: 5, scale: 2 }),
  baselineEnergy: int("baseline_energy"), // 1-10
  baselineDigestion: int("baseline_digestion"), // 1-10
  
  // Results
  endWeight: decimal("end_weight", { precision: 5, scale: 2 }),
  endEnergy: int("end_energy"), // 1-10
  endDigestion: int("end_digestion"), // 1-10
  
  // Findings
  findings: text("findings"),
  conclusion: text("conclusion"),
  
  // Decision
  willContinue: boolean("will_continue"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Nutrition Engine Self-Learning Analytics
export const nutritionEngineAnalytics = mysqlTable("nutrition_engine_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Food-Effect Correlations (aggregated)
  foodCategory: varchar("food_category", { length: 100 }).notNull(),
  
  // Energy Correlation
  avgEnergyImpact: decimal("avg_energy_impact", { precision: 5, scale: 2 }), // Change in energy level
  
  // Digestive Impact
  avgDigestiveImpact: decimal("avg_digestive_impact", { precision: 5, scale: 2 }),
  
  // Performance Impact
  avgWorkoutImpact: decimal("avg_workout_impact", { precision: 5, scale: 2 }),
  
  // Optimal Timing
  optimalMealTiming: varchar("optimal_meal_timing", { length: 100 }),
  
  // User Segments
  mostBeneficialFor: text("most_beneficial_for"), // JSON: different user types
  
  // Sample Size
  mealCount: int("meal_count"),
  userCount: int("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
