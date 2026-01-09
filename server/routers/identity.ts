/**
 * Identity & Behavioral Architecture Router
 * Master Prompt: Identity over motivation
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import {
  identityProfiles,
  dailyCheckins,
  habits,
  habitCompletions,
  disciplineEvents,
  microHabits,
} from "../../drizzle/schema-postgresql";
import { eq, and, desc, gte } from "drizzle-orm";

export const identityRouter = router({
  /**
   * Get or create identity profile
   */
  getProfile: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      const profiles = await db
        .select()
        .from(identityProfiles)
        .where(eq(identityProfiles.clientId, input.clientId))
        .limit(1);

      if (profiles.length === 0) {
        // Create default profile
        const [newProfile] = await db
          .insert(identityProfiles)
          .values({
            clientId: input.clientId,
            currentIdentity: JSON.stringify([]),
            targetIdentity: JSON.stringify(["disciplined", "resilient", "mission-driven"]),
            identityGaps: JSON.stringify([]),
            coreValues: JSON.stringify([]),
            identityWins: JSON.stringify([]),
            identityContradictions: JSON.stringify([]),
          })
          .$returningId();

        const [profile] = await db
          .select()
          .from(identityProfiles)
          .where(eq(identityProfiles.id, newProfile.id));

        return profile;
      }

      return profiles[0];
    }),

  /**
   * Update identity profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        currentIdentity: z.array(z.string()).optional(),
        targetIdentity: z.array(z.string()).optional(),
        identityGaps: z.array(z.string()).optional(),
        coreValues: z.array(z.string()).optional(),
        lifeMission: z.string().optional(),
        longTermVision: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { clientId, ...updates } = input;

      // Convert arrays to JSON strings
      const jsonUpdates: any = {};
      if (updates.currentIdentity) jsonUpdates.currentIdentity = JSON.stringify(updates.currentIdentity);
      if (updates.targetIdentity) jsonUpdates.targetIdentity = JSON.stringify(updates.targetIdentity);
      if (updates.identityGaps) jsonUpdates.identityGaps = JSON.stringify(updates.identityGaps);
      if (updates.coreValues) jsonUpdates.coreValues = JSON.stringify(updates.coreValues);
      if (updates.lifeMission) jsonUpdates.lifeMission = updates.lifeMission;
      if (updates.longTermVision) jsonUpdates.longTermVision = updates.longTermVision;

      await db
        .update(identityProfiles)
        .set(jsonUpdates)
        .where(eq(identityProfiles.clientId, clientId));

      return { success: true };
    }),

  /**
   * Submit daily check-in (minimal cognitive load)
   */
  submitDailyCheckin: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        sleptWell: z.enum(["yes", "no"]),
        ateWell: z.enum(["yes", "no"]),
        movedBody: z.enum(["yes", "no"]),
        emotionalState: z.number().min(1).max(10),
        followedPlan: z.enum(["yes", "no"]),
        controlledImpulses: z.enum(["yes", "no"]),
        actedLikeTargetIdentity: z.enum(["yes", "no"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [checkin] = await db
        .insert(dailyCheckins)
        .values(input)
        .$returningId();

      return { checkinId: checkin.id, success: true };
    }),

  /**
   * Get recent check-ins
   */
  getRecentCheckins: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);

      const checkins = await db
        .select()
        .from(dailyCheckins)
        .where(
          and(
            eq(dailyCheckins.clientId, input.clientId),
            gte(dailyCheckins.checkinDate, daysAgo)
          )
        )
        .orderBy(desc(dailyCheckins.checkinDate));

      return { checkins };
    }),

  /**
   * Create habit
   */
  createHabit: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        habitName: z.string(),
        habitDescription: z.string().optional(),
        identityConnection: z.string(), // "This habit makes me [identity]"
        frequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
      })
    )
    .mutation(async ({ input }) => {
      const [habit] = await db
        .insert(habits)
        .values(input)
        .$returningId();

      return { habitId: habit.id, success: true };
    }),

  /**
   * Get active habits
   */
  getActiveHabits: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      const activeHabits = await db
        .select()
        .from(habits)
        .where(
          and(
            eq(habits.clientId, input.clientId),
            eq(habits.isActive, "true")
          )
        );

      return { habits: activeHabits };
    }),

  /**
   * Complete habit
   */
  completeHabit: protectedProcedure
    .input(
      z.object({
        habitId: z.number(),
        completed: z.enum(["yes", "no"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [completion] = await db
        .insert(habitCompletions)
        .values(input)
        .$returningId();

      return { completionId: completion.id, success: true };
    }),

  /**
   * Get habit completion history
   */
  getHabitHistory: protectedProcedure
    .input(
      z.object({
        habitId: z.number(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);

      const completions = await db
        .select()
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, input.habitId),
            gte(habitCompletions.completionDate, daysAgo)
          )
        )
        .orderBy(desc(habitCompletions.completionDate));

      return { completions };
    }),

  /**
   * Log discipline event
   */
  logDisciplineEvent: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        eventType: z.enum(["impulse_controlled", "impulse_failed", "discipline_win", "discipline_fail"]),
        situation: z.string(),
        response: z.string(),
        outcome: z.string(),
        reinforcedIdentity: z.enum(["yes", "no"]),
      })
    )
    .mutation(async ({ input }) => {
      const [event] = await db
        .insert(disciplineEvents)
        .values(input)
        .$returningId();

      return { eventId: event.id, success: true };
    }),

  /**
   * Get recent discipline events
   */
  getDisciplineEvents: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);

      const events = await db
        .select()
        .from(disciplineEvents)
        .where(
          and(
            eq(disciplineEvents.clientId, input.clientId),
            gte(disciplineEvents.eventDate, daysAgo)
          )
        )
        .orderBy(desc(disciplineEvents.eventDate));

      return { events };
    }),

  /**
   * Create micro-habit
   */
  createMicroHabit: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        microHabitName: z.string(),
        trigger: z.string(), // "After I [existing habit]"
        action: z.string(), // "I will [micro-habit]"
        identityReinforcement: z.string(), // "This makes me [identity]"
      })
    )
    .mutation(async ({ input }) => {
      const [microHabit] = await db
        .insert(microHabits)
        .values(input)
        .$returningId();

      return { microHabitId: microHabit.id, success: true };
    }),

  /**
   * Get active micro-habits
   */
  getActiveMicroHabits: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      const activeMicroHabits = await db
        .select()
        .from(microHabits)
        .where(
          and(
            eq(microHabits.clientId, input.clientId),
            eq(microHabits.isActive, "true")
          )
        );

      return { microHabits: activeMicroHabits };
    }),
});
