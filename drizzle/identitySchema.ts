import { mysqlTable, int, varchar, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import { clients } from "./schema";

/**
 * Identity Profiles - Track user's evolving identity
 * Based on MasterPrompt: Identity over motivation
 */
export const identityProfiles = mysqlTable("identityProfiles", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  
  // Current identity markers
  currentIdentity: text("currentIdentity"), // JSON: ["disciplined", "resilient", etc.]
  targetIdentity: text("targetIdentity"), // JSON: ["unstoppable", "mission-driven", etc.]
  identityGaps: text("identityGaps"), // JSON: What's missing between current and target
  
  // Core values and mission
  coreValues: text("coreValues"), // JSON array
  lifeMission: text("lifeMission"),
  longTermVision: text("longTermVision"),
  
  // Identity reinforcement tracking
  identityWins: text("identityWins"), // JSON: Recent actions that reinforced identity
  identityContradictions: text("identityContradictions"), // JSON: Actions that contradicted identity
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IdentityProfile = typeof identityProfiles.$inferSelect;
export type InsertIdentityProfile = typeof identityProfiles.$inferInsert;

/**
 * Daily Check-ins - Minimal cognitive load tracking
 */
export const dailyCheckins = mysqlTable("dailyCheckins", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  checkinDate: timestamp("checkinDate").defaultNow().notNull(),
  
  // Physical health (minimal questions)
  sleptWell: mysqlEnum("sleptWell", ["yes", "no"]).notNull(),
  ateWell: mysqlEnum("ateWell", ["yes", "no"]).notNull(),
  movedBody: mysqlEnum("movedBody", ["yes", "no"]).notNull(),
  
  // Emotional state (single rating)
  emotionalState: int("emotionalState").notNull(), // 1-10 scale
  
  // Discipline tracking
  followedPlan: mysqlEnum("followedPlan", ["yes", "no"]).notNull(),
  controlledImpulses: mysqlEnum("controlledImpulses", ["yes", "no"]).notNull(),
  
  // Identity reinforcement
  actedLikeTargetIdentity: mysqlEnum("actedLikeTargetIdentity", ["yes", "no"]).notNull(),
  
  // Optional notes (not required)
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type InsertDailyCheckin = typeof dailyCheckins.$inferInsert;

/**
 * Habit Tracking - Identity-based habits
 */
export const habits = mysqlTable("habits", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  
  // Habit definition
  habitName: varchar("habitName", { length: 255 }).notNull(),
  habitDescription: text("habitDescription"),
  identityConnection: text("identityConnection"), // "This habit makes me [identity]"
  
  // Frequency
  frequency: mysqlEnum("frequency", ["daily", "weekly", "custom"]).default("daily").notNull(),
  
  // Status
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;

/**
 * Habit Completions - Track daily execution
 */
export const habitCompletions = mysqlTable("habitCompletions", {
  id: int("id").autoincrement().primaryKey(),
  habitId: int("habitId").notNull().references(() => habits.id),
  completionDate: timestamp("completionDate").defaultNow().notNull(),
  completed: mysqlEnum("completed", ["yes", "no"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = typeof habitCompletions.$inferInsert;

/**
 * Discipline Events - Track impulse control and discipline moments
 */
export const disciplineEvents = mysqlTable("disciplineEvents", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  eventDate: timestamp("eventDate").defaultNow().notNull(),
  
  // Event details
  eventType: mysqlEnum("eventType", ["impulse_controlled", "impulse_failed", "discipline_win", "discipline_fail"]).notNull(),
  situation: text("situation"), // What happened
  response: text("response"), // How they responded
  outcome: text("outcome"), // Result
  
  // Identity impact
  reinforcedIdentity: mysqlEnum("reinforcedIdentity", ["yes", "no"]).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DisciplineEvent = typeof disciplineEvents.$inferSelect;
export type InsertDisciplineEvent = typeof disciplineEvents.$inferInsert;

/**
 * Micro-Habits - Tiny, stackable behaviors
 */
export const microHabits = mysqlTable("microHabits", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  
  // Micro-habit definition (must be < 2 minutes)
  microHabitName: varchar("microHabitName", { length: 255 }).notNull(),
  trigger: varchar("trigger", { length: 255 }).notNull(), // "After I [existing habit]"
  action: varchar("action", { length: 255 }).notNull(), // "I will [micro-habit]"
  
  // Identity connection
  identityReinforcement: text("identityReinforcement"), // "This makes me [identity]"
  
  // Status
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MicroHabit = typeof microHabits.$inferSelect;
export type InsertMicroHabit = typeof microHabits.$inferInsert;
