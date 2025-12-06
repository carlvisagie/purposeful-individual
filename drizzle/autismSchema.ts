import { mysqlTable, int, text, timestamp, mysqlEnum, varchar } from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * AUTISM TRANSFORMATION MODULE - DATABASE SCHEMA (MySQL)
 * 
 * This schema supports the world-class autism transformation protocol
 * combining biomedical, behavioral, and cutting-edge interventions.
 */

// Child Profile & Assessment
export const autismProfiles = mysqlTable("autismProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id), // Parent's user ID
  childName: varchar("childName", { length: 255 }).notNull(),
  dateOfBirth: timestamp("dateOfBirth").notNull(),
  diagnosisDate: timestamp("diagnosisDate"),
  severity: mysqlEnum("severity", ["mild", "moderate", "severe"]).notNull(),
  
  // Assessment Data
  atecScore: int("atecScore"), // Autism Treatment Evaluation Checklist
  carsScore: int("carsScore"), // Childhood Autism Rating Scale
  communicationLevel: mysqlEnum("communicationLevel", ["nonverbal", "minimally_verbal", "verbal"]).notNull(),
  
  // Symptoms & Challenges (stored as JSON text)
  giSymptoms: text("giSymptoms"), // JSON: ["constipation", "diarrhea", "pain"]
  sleepIssues: text("sleepIssues"), // JSON: ["difficulty_falling_asleep", "night_wakings"]
  sensoryProfile: text("sensoryProfile"), // JSON: {"hyper": ["sound", "touch"], "hypo": ["movement"]}
  behaviorChallenges: text("behaviorChallenges"), // JSON: ["aggression", "self_injury", "tantrums"]
  
  // Family Context
  familyResources: text("familyResources"), // JSON: {"time": "limited", "budget": "moderate", "support": "high"}
  treatmentPriorities: text("treatmentPriorities"), // JSON: ["communication", "behavior", "independence"]
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutismProfile = typeof autismProfiles.$inferSelect;
export type InsertAutismProfile = typeof autismProfiles.$inferInsert;

// Personalized Intervention Plans
export const interventionPlans = mysqlTable("interventionPlans", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull().references(() => autismProfiles.id),
  
  // Tiered Interventions (JSON arrays)
  tier1Interventions: text("tier1Interventions").notNull(), // JSON: ["nutrition", "sleep", "sensory"]
  tier2Interventions: text("tier2Interventions"), // JSON: ["FMT", "GFCF_diet", "omega3"]
  tier3Interventions: text("tier3Interventions"), // JSON: ["ABA", "OT", "speech"]
  tier4Interventions: text("tier4Interventions"), // JSON: ["neurofeedback", "TMS_trial"]
  
  // Timeline & Providers
  currentPhase: mysqlEnum("currentPhase", ["foundation", "biomedical", "behavioral", "advanced"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  providerDirectory: text("providerDirectory"), // JSON: {"ABA": "provider_name", "OT": "provider_name"}
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InterventionPlan = typeof interventionPlans.$inferSelect;
export type InsertInterventionPlan = typeof interventionPlans.$inferInsert;

// Supplement Tracking
export const supplementTracking = mysqlTable("supplementTracking", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull().references(() => autismProfiles.id),
  
  supplementName: varchar("supplementName", { length: 255 }).notNull(), // "Omega-3", "Vitamin D", "Methylcobalamin"
  dosage: varchar("dosage", { length: 255 }).notNull(), // "1000mg EPA+DHA", "300 IU/kg/day"
  frequency: mysqlEnum("frequency", ["daily", "twice_daily", "every_3_days"]).notNull(),
  
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  // Tracking
  adherence: int("adherence"), // Percentage: 0-100
  sideEffects: text("sideEffects"), // JSON: ["fishy_burps", "loose_stools"]
  perceivedBenefit: int("perceivedBenefit"), // 1-10 scale
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupplementTracking = typeof supplementTracking.$inferSelect;
export type InsertSupplementTracking = typeof supplementTracking.$inferInsert;

// Dietary Interventions
export const dietaryInterventions = mysqlTable("dietaryInterventions", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull().references(() => autismProfiles.id),
  
  dietType: mysqlEnum("dietType", ["GFCF", "ketogenic", "SCD"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  // Tracking
  adherence: int("adherence"), // Percentage: 0-100
  giSymptomChanges: text("giSymptomChanges"), // JSON: {"constipation": "improved", "bloating": "resolved"}
  behaviorChanges: text("behaviorChanges"), // JSON: {"attention": "improved", "sleep": "improved"}
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DietaryIntervention = typeof dietaryInterventions.$inferSelect;
export type InsertDietaryIntervention = typeof dietaryInterventions.$inferInsert;

// Therapy Sessions
export const therapySessions = mysqlTable("therapySessions", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull().references(() => autismProfiles.id),
  
  therapyType: mysqlEnum("therapyType", ["ABA", "OT", "speech", "Floortime", "neurofeedback"]).notNull(),
  sessionDate: timestamp("sessionDate").notNull(),
  duration: int("duration").notNull(), // Minutes
  
  // Session Details
  goalsAddressed: text("goalsAddressed"), // JSON: ["increase_eye_contact", "reduce_tantrums"]
  progress: text("progress"), // JSON: {"eye_contact": "improved", "tantrums": "reduced_by_30%"}
  parentFeedback: text("parentFeedback"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TherapySession = typeof therapySessions.$inferSelect;
export type InsertTherapySession = typeof therapySessions.$inferInsert;

// Autism Outcome Tracking
export const autismOutcomeTracking = mysqlTable("autismOutcomeTracking", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull().references(() => autismProfiles.id),
  
  assessmentDate: timestamp("assessmentDate").notNull(),
  
  // Core Autism Symptoms
  atecScore: int("atecScore"),
  carsScore: int("carsScore"),
  communicationLevel: mysqlEnum("communicationLevel", ["nonverbal", "minimally_verbal", "verbal"]),
  
  // Behavior & Function
  behaviorScore: int("behaviorScore"), // 1-10 scale (parent-reported)
  adaptiveFunctionScore: int("adaptiveFunctionScore"), // 1-10 scale
  
  // Physical Health
  giSymptomScore: int("giSymptomScore"), // 1-10 scale (1=severe, 10=none)
  sleepScore: int("sleepScore"), // 1-10 scale (1=severe issues, 10=excellent)
  
  // Family Quality of Life
  familyQOL: int("familyQOL"), // 1-10 scale
  parentStress: int("parentStress"), // 1-10 scale (1=low, 10=high)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutismOutcomeTracking = typeof autismOutcomeTracking.$inferSelect;
export type InsertAutismOutcomeTracking = typeof autismOutcomeTracking.$inferInsert;

// Adaptive Learning - Pattern Detection for Autism
export const autismPatternDetection = mysqlTable("autismPatternDetection", {
  id: int("id").autoincrement().primaryKey(),
  
  // Child Profile Characteristics
  childProfile: text("childProfile").notNull(), // JSON: {"severity": "moderate", "giSymptoms": true, "age": 4}
  
  // Intervention Combination
  interventionCombination: text("interventionCombination").notNull(), // JSON: ["FMT", "omega3", "ABA"]
  
  // Outcome Data
  outcomeData: text("outcomeData").notNull(), // JSON: {"atec_improvement": 40, "behavior_improvement": 60}
  
  // Pattern Insights
  patternType: mysqlEnum("patternType", ["high_responder", "moderate_responder", "non_responder"]),
  confidence: int("confidence"), // 0-100
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutismPatternDetection = typeof autismPatternDetection.$inferSelect;
export type InsertAutismPatternDetection = typeof autismPatternDetection.$inferInsert;

// Provider Directory for Autism Services
export const autismProviders = mysqlTable("autismProviders", {
  id: int("id").autoincrement().primaryKey(),
  
  providerType: mysqlEnum("providerType", ["ABA", "OT", "speech", "FMT_clinic", "neurofeedback"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(), // City, State
  
  // Contact & Details
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  
  // Ratings & Reviews
  rating: int("rating"), // 1-5 stars
  reviewCount: int("reviewCount"),
  
  // Insurance & Cost
  acceptsInsurance: mysqlEnum("acceptsInsurance", ["true", "false"]).notNull(),
  costRange: varchar("costRange", { length: 100 }), // "$100-$200/session"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutismProvider = typeof autismProviders.$inferSelect;
export type InsertAutismProvider = typeof autismProviders.$inferInsert;

// Daily Tracking Logs
export const autismDailyLogs = mysqlTable("autismDailyLogs", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull().references(() => autismProfiles.id),
  
  date: timestamp("date").notNull(),
  mood: int("mood").notNull(), // 1-10 scale
  sleepQuality: int("sleepQuality").notNull(), // 1-10 scale
  sleepHours: int("sleepHours"), // Decimal hours (stored as int * 10, e.g., 8.5 hours = 85)
  
  // Behaviors
  meltdownCount: int("meltdownCount").notNull().default(0),
  communicationAttempts: int("communicationAttempts").notNull().default(0),
  
  // Observations
  wins: text("wins"), // Today's wins/successes
  challenges: text("challenges"), // Today's challenges
  notes: text("notes"), // Additional notes
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutismDailyLog = typeof autismDailyLogs.$inferSelect;
export type InsertAutismDailyLog = typeof autismDailyLogs.$inferInsert;
