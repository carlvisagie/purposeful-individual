import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { healthLogs } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * PHYSICAL HEALTH TRACKING ROUTER
 * 
 * Evidence-based health optimization following:
 * - Matthew Walker (sleep science)
 * - Peter Attia (longevity, health optimization)
 * - Andrew Huberman (neuroscience, performance)
 * 
 * Tracks: Movement, nutrition, sleep, hydration, energy
 */

export const healthRouter = router({
  // Log daily health metrics
  logDaily: protectedProcedure
    .input(
      z.object({
        logDate: z.string(), // YYYY-MM-DD format
        steps: z.number().int().min(0).max(100000).optional(),
        workoutMinutes: z.number().int().min(0).max(1440).optional(),
        workoutType: z.string().max(100).optional(),
        mealsLogged: z.number().int().min(0).max(20).optional(),
        waterIntakeOz: z.number().int().min(0).max(500).optional(),
        nutritionQuality: z.number().int().min(1).max(10).optional(),
        sleepHours: z.number().int().min(0).max(1440).optional(), // stored as minutes
        sleepQuality: z.number().int().min(1).max(10).optional(),
        wakeTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(), // HH:MM:SS
        energyLevel: z.number().int().min(1).max(10).optional(),
        notes: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if log already exists for this date
      const existing = await db
        .select()
        .from(healthLogs)
        .where(
          and(
            eq(healthLogs.userId, ctx.user.id),
            eq(healthLogs.logDate, input.logDate)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing log
        await db
          .update(healthLogs)
          .set({
            steps: input.steps,
            workoutMinutes: input.workoutMinutes,
            workoutType: input.workoutType,
            mealsLogged: input.mealsLogged,
            waterIntakeOz: input.waterIntakeOz,
            nutritionQuality: input.nutritionQuality,
            sleepHours: input.sleepHours,
            sleepQuality: input.sleepQuality,
            wakeTime: input.wakeTime,
            energyLevel: input.energyLevel,
            notes: input.notes,
          })
          .where(eq(healthLogs.id, existing[0].id));

        return { success: true, updated: true, id: existing[0].id };
      } else {
        // Create new log
        const result = await db.insert(healthLogs).values({
          userId: ctx.user.id,
          logDate: input.logDate,
          steps: input.steps,
          workoutMinutes: input.workoutMinutes,
          workoutType: input.workoutType,
          mealsLogged: input.mealsLogged,
          waterIntakeOz: input.waterIntakeOz,
          nutritionQuality: input.nutritionQuality,
          sleepHours: input.sleepHours,
          sleepQuality: input.sleepQuality,
          wakeTime: input.wakeTime,
          energyLevel: input.energyLevel,
          notes: input.notes,
        });

        return { success: true, updated: false, id: result.insertId };
      }
    }),

  // Get health history (last N days)
  getHistory: protectedProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(365).default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const logs = await db
        .select()
        .from(healthLogs)
        .where(eq(healthLogs.userId, ctx.user.id))
        .orderBy(desc(healthLogs.logDate))
        .limit(input.days);

      return logs;
    }),

  // Get health stats (averages, streaks, insights)
  getStats: protectedProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(365).default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const logs = await db
        .select()
        .from(healthLogs)
        .where(eq(healthLogs.userId, ctx.user.id))
        .orderBy(desc(healthLogs.logDate))
        .limit(input.days);

      if (logs.length === 0) {
        return {
          averages: {
            steps: 0,
            workoutMinutes: 0,
            waterIntakeOz: 0,
            sleepHours: 0,
            sleepQuality: 0,
            energyLevel: 0,
            nutritionQuality: 0,
          },
          streaks: {
            workout: 0,
            sleep: 0,
            hydration: 0,
          },
          insights: [],
        };
      }

      // Calculate averages
      const averages = {
        steps: Math.round(
          logs.reduce((sum, log) => sum + (log.steps || 0), 0) / logs.length
        ),
        workoutMinutes: Math.round(
          logs.reduce((sum, log) => sum + (log.workoutMinutes || 0), 0) /
            logs.length
        ),
        waterIntakeOz: Math.round(
          logs.reduce((sum, log) => sum + (log.waterIntakeOz || 0), 0) /
            logs.length
        ),
        sleepHours: Math.round(
          logs.reduce((sum, log) => sum + (log.sleepHours || 0), 0) / logs.length
        ),
        sleepQuality: (
          logs.reduce((sum, log) => sum + (log.sleepQuality || 0), 0) /
          logs.filter((log) => log.sleepQuality).length
        ).toFixed(1),
        energyLevel: (
          logs.reduce((sum, log) => sum + (log.energyLevel || 0), 0) /
          logs.filter((log) => log.energyLevel).length
        ).toFixed(1),
        nutritionQuality: (
          logs.reduce((sum, log) => sum + (log.nutritionQuality || 0), 0) /
          logs.filter((log) => log.nutritionQuality).length
        ).toFixed(1),
      };

      // Calculate streaks
      let workoutStreak = 0;
      let sleepStreak = 0;
      let hydrationStreak = 0;

      for (const log of logs) {
        if (log.workoutMinutes && log.workoutMinutes > 0) {
          workoutStreak++;
        } else {
          break;
        }
      }

      for (const log of logs) {
        if (log.sleepHours && log.sleepHours >= 420) {
          // 7+ hours
          sleepStreak++;
        } else {
          break;
        }
      }

      for (const log of logs) {
        if (log.waterIntakeOz && log.waterIntakeOz >= 64) {
          // 64+ oz
          hydrationStreak++;
        } else {
          break;
        }
      }

      // Generate insights
      const insights: string[] = [];

      if (averages.sleepHours < 420) {
        // < 7 hours
        insights.push(
          "Sleep deficit detected. Aim for 7-9 hours per night (Matthew Walker)."
        );
      }

      if (averages.waterIntakeOz < 64) {
        insights.push(
          "Hydration below optimal. Target 64+ oz daily (Andrew Huberman)."
        );
      }

      if (averages.workoutMinutes < 30) {
        insights.push(
          "Movement below recommended. Aim for 30+ minutes daily (Peter Attia)."
        );
      }

      if (parseFloat(averages.energyLevel) < 6) {
        insights.push(
          "Low energy levels. Focus on sleep, nutrition, and movement."
        );
      }

      if (workoutStreak >= 7) {
        insights.push(
          `🔥 ${workoutStreak}-day workout streak! Consistency builds discipline.`
        );
      }

      if (sleepStreak >= 7) {
        insights.push(
          `💤 ${sleepStreak}-day sleep streak! Quality sleep = peak performance.`
        );
      }

      return {
        averages,
        streaks: {
          workout: workoutStreak,
          sleep: sleepStreak,
          hydration: hydrationStreak,
        },
        insights,
      };
    }),

  // Get today's log
  getToday: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const log = await db
      .select()
      .from(healthLogs)
      .where(
        and(eq(healthLogs.userId, ctx.user.id), eq(healthLogs.logDate, today))
      )
      .limit(1);

    return log.length > 0 ? log[0] : null;
  }),
});
