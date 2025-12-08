/**
 * Habit Formation Router
 * Evidence-based habit building system integrated with all wellness modules
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { habits, habitTracking, habitProfiles } from "../../drizzle/habitFormationSchema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export const habitsRouter = router({
  /**
   * Get or create habit profile for user
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id.toString();
    
    let profile = await db
      .select()
      .from(habitProfiles)
      .where(eq(habitProfiles.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      // Create new profile
      const newProfile = await db.insert(habitProfiles).values({
        id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        totalActiveHabits: 0,
        totalMasteredHabits: 0,
        longestStreak: 0,
      });
      
      profile = await db
        .select()
        .from(habitProfiles)
        .where(eq(habitProfiles.userId, userId))
        .limit(1);
    }

    return { profile: profile[0] };
  }),

  /**
   * Create new habit
   */
  createHabit: protectedProcedure
    .input(
      z.object({
        habitName: z.string(),
        habitDescription: z.string().optional(),
        identityStatement: z.string().optional(),
        habitType: z.enum(["build", "break", "replace"]),
        category: z.enum([
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
          "other",
        ]),
        tinyVersion: z.string().optional(),
        fullVersion: z.string().optional(),
        cue: z.string(),
        cueType: z.enum(["time", "location", "preceding_action", "emotional_state", "other_people"]).optional(),
        routine: z.string(),
        reward: z.string().optional(),
        anchorHabit: z.string().optional(),
        stackingFormula: z.string().optional(),
        implementationIntention: z.string().optional(),
        targetFrequency: z.enum(["daily", "weekdays", "weekends", "weekly", "custom"]),
        customFrequency: z.string().optional(),
        targetDuration: z.number().optional(),
        difficulty: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id.toString();
      
      // Get profile
      const profile = await db
        .select()
        .from(habitProfiles)
        .where(eq(habitProfiles.userId, userId))
        .limit(1);

      if (profile.length === 0) {
        throw new Error("Profile not found");
      }

      const habitId = `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create habit
      await db.insert(habits).values({
        id: habitId,
        profileId: profile[0].id,
        userId,
        ...input,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        startDate: new Date(),
        status: "active",
      });

      // Update profile
      await db
        .update(habitProfiles)
        .set({
          totalActiveHabits: (profile[0].totalActiveHabits || 0) + 1,
        })
        .where(eq(habitProfiles.id, profile[0].id));

      return { success: true, habitId };
    }),

  /**
   * Get all habits for user
   */
  getHabits: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "paused", "mastered", "abandoned"]).optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id.toString();

      let query = db.select().from(habits).where(eq(habits.userId, userId));

      if (input.status) {
        query = query.where(and(eq(habits.userId, userId), eq(habits.status, input.status)));
      }

      if (input.category) {
        query = query.where(and(eq(habits.userId, userId), eq(habits.category, input.category as any)));
      }

      const userHabits = await query.orderBy(desc(habits.createdAt));

      return { habits: userHabits };
    }),

  /**
   * Track habit completion
   */
  trackCompletion: protectedProcedure
    .input(
      z.object({
        habitId: z.string(),
        completed: z.boolean(),
        duration: z.number().optional(),
        intensity: z.number().min(1).max(10).optional(),
        cuePresent: z.boolean().optional(),
        cueEffectiveness: z.number().min(1).max(10).optional(),
        resistanceLevel: z.number().min(1).max(10).optional(),
        easeOfCompletion: z.number().min(1).max(10).optional(),
        rewardExperienced: z.boolean().optional(),
        rewardSatisfaction: z.number().min(1).max(10).optional(),
        feltAutomatic: z.boolean().optional(),
        moodBefore: z.string().optional(),
        moodAfter: z.string().optional(),
        energyBefore: z.number().min(1).max(10).optional(),
        energyAfter: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
        challenges: z.string().optional(),
        wins: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id.toString();
      const { habitId, completed, ...trackingData } = input;

      // Get habit
      const habit = await db
        .select()
        .from(habits)
        .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
        .limit(1);

      if (habit.length === 0) {
        throw new Error("Habit not found");
      }

      // Create tracking entry
      await db.insert(habitTracking).values({
        id: `tracking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        habitId,
        profileId: habit[0].profileId,
        userId,
        trackingDate: new Date(),
        completed,
        ...trackingData,
      });

      // Update habit stats
      if (completed) {
        const newStreak = (habit[0].currentStreak || 0) + 1;
        const newLongestStreak = Math.max(newStreak, habit[0].longestStreak || 0);
        const newTotalCompletions = (habit[0].totalCompletions || 0) + 1;

        await db
          .update(habits)
          .set({
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            totalCompletions: newTotalCompletions,
          })
          .where(eq(habits.id, habitId));
      } else {
        // Reset streak
        await db
          .update(habits)
          .set({
            currentStreak: 0,
          })
          .where(eq(habits.id, habitId));
      }

      return { success: true };
    }),

  /**
   * Get habit tracking history
   */
  getTrackingHistory: protectedProcedure
    .input(
      z.object({
        habitId: z.string(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id.toString();
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);

      const tracking = await db
        .select()
        .from(habitTracking)
        .where(
          and(
            eq(habitTracking.habitId, input.habitId),
            eq(habitTracking.userId, userId),
            gte(habitTracking.trackingDate, daysAgo)
          )
        )
        .orderBy(desc(habitTracking.trackingDate));

      return { tracking };
    }),

  /**
   * Get habits by category (for module integration)
   */
  getHabitsByCategory: protectedProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id.toString();

      const categoryHabits = await db
        .select()
        .from(habits)
        .where(
          and(
            eq(habits.userId, userId),
            eq(habits.category, input.category as any),
            eq(habits.status, "active")
          )
        )
        .orderBy(desc(habits.currentStreak));

      return { habits: categoryHabits };
    }),

  /**
   * Update habit
   */
  updateHabit: protectedProcedure
    .input(
      z.object({
        habitId: z.string(),
        updates: z.object({
          habitName: z.string().optional(),
          habitDescription: z.string().optional(),
          cue: z.string().optional(),
          routine: z.string().optional(),
          reward: z.string().optional(),
          status: z.enum(["active", "paused", "mastered", "abandoned"]).optional(),
          automaticityLevel: z.number().min(1).max(10).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id.toString();

      await db
        .update(habits)
        .set(input.updates)
        .where(and(eq(habits.id, input.habitId), eq(habits.userId, userId)));

      return { success: true };
    }),

  /**
   * Delete habit
   */
  deleteHabit: protectedProcedure
    .input(z.object({ habitId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id.toString();

      // Mark as abandoned instead of deleting
      await db
        .update(habits)
        .set({ status: "abandoned" })
        .where(and(eq(habits.id, input.habitId), eq(habits.userId, userId)));

      return { success: true };
    }),
});
