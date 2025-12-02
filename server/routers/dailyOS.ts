import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * DAILY OPERATING SYSTEM ROUTER
 * 
 * Consolidated router for all daily operating system features:
 * - Morning Routine Protocol
 * - Evening Review Protocol
 * - Impulse Control System
 * - Recovery Tracking
 * - Dopamine Regulation
 * 
 * Evidence-based: Jocko Willink (discipline), David Goggins (mental toughness),
 * Tim Ferriss (systems), Cal Newport (deep work)
 */

export const dailyOSRouter = router({
  // ========== MORNING ROUTINE ==========
  morning: router({
    start: protectedProcedure
      .input(z.object({
        routineDate: z.string(), // YYYY-MM-DD
        wakeTime: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.execute(
          sql`INSERT INTO morning_routines (userId, routineDate, wakeTime) 
              VALUES (${ctx.user.id}, ${input.routineDate}, ${input.wakeTime || null})`
        );
        return { success: true, id: Number(result.insertId) };
      }),

    complete: protectedProcedure
      .input(z.object({
        routineDate: z.string(),
        hydrated: z.boolean(),
        movement: z.boolean(),
        meditation: z.boolean(),
        coldShower: z.boolean(),
        healthyBreakfast: z.boolean(),
        top3Priorities: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const completionRate = [
          input.hydrated,
          input.movement,
          input.meditation,
          input.coldShower,
          input.healthyBreakfast,
        ].filter(Boolean).length * 20; // 5 items = 100%

        await db.execute(
          sql`UPDATE morning_routines 
              SET hydrated = ${input.hydrated}, 
                  movement = ${input.movement}, 
                  meditation = ${input.meditation}, 
                  coldShower = ${input.coldShower}, 
                  healthyBreakfast = ${input.healthyBreakfast}, 
                  top3Priorities = ${input.top3Priorities || null}, 
                  completedAt = NOW(), 
                  completionRate = ${completionRate}
              WHERE userId = ${ctx.user.id} AND routineDate = ${input.routineDate}`
        );

        return { success: true, completionRate };
      }),

    getStreak: protectedProcedure.query(async ({ ctx }) => {
      const result = await db.execute(
        sql`SELECT * FROM morning_routines 
            WHERE userId = ${ctx.user.id} AND completionRate >= 80 
            ORDER BY routineDate DESC 
            LIMIT 30`
      );

      let streak = 0;
      const rows = result.rows as any[];
      
      for (const row of rows) {
        if (row.completionRate >= 80) {
          streak++;
        } else {
          break;
        }
      }

      return { streak, recentRoutines: rows };
    }),
  }),

  // ========== EVENING REVIEW ==========
  evening: router({
    createReview: protectedProcedure
      .input(z.object({
        reviewDate: z.string(),
        wins: z.string(),
        losses: z.string().optional(),
        lessonsLearned: z.string().optional(),
        tomorrowTop3: z.string(),
        gratitude: z.string().optional(),
        identityAlignment: z.number().int().min(1).max(10),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.execute(
          sql`INSERT INTO evening_reviews 
              (userId, reviewDate, wins, losses, lessonsLearned, tomorrowTop3, gratitude, identityAlignment) 
              VALUES (${ctx.user.id}, ${input.reviewDate}, ${input.wins}, ${input.losses || null}, 
                      ${input.lessonsLearned || null}, ${input.tomorrowTop3}, ${input.gratitude || null}, 
                      ${input.identityAlignment})`
        );

        return { success: true, id: Number(result.insertId) };
      }),

    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(30) }))
      .query(async ({ input, ctx }) => {
        const result = await db.execute(
          sql`SELECT * FROM evening_reviews 
              WHERE userId = ${ctx.user.id} 
              ORDER BY reviewDate DESC 
              LIMIT ${input.limit}`
        );

        return result.rows;
      }),
  }),

  // ========== IMPULSE CONTROL ==========
  impulse: router({
    logUrge: protectedProcedure
      .input(z.object({
        trigger: z.string().max(200),
        urgeStrength: z.number().int().min(1).max(10),
        actionTaken: z.enum(["resisted", "delayed", "gave_in"]),
        delayMinutes: z.number().int().min(0).optional(),
        alternativeAction: z.string().optional(),
        outcome: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.execute(
          sql`INSERT INTO impulse_logs 
              (userId, trigger, urgeStrength, actionTaken, delayMinutes, alternativeAction, outcome) 
              VALUES (${ctx.user.id}, ${input.trigger}, ${input.urgeStrength}, ${input.actionTaken}, 
                      ${input.delayMinutes || null}, ${input.alternativeAction || null}, ${input.outcome || null})`
        );

        return { success: true, id: Number(result.insertId) };
      }),

    getPatterns: protectedProcedure.query(async ({ ctx }) => {
      const result = await db.execute(
        sql`SELECT trigger, COUNT(*) as count, AVG(urgeStrength) as avgStrength, 
                   SUM(CASE WHEN actionTaken = 'resisted' THEN 1 ELSE 0 END) as resistedCount
            FROM impulse_logs 
            WHERE userId = ${ctx.user.id} 
            GROUP BY trigger 
            ORDER BY count DESC 
            LIMIT 10`
      );

      return result.rows;
    }),
  }),

  // ========== RECOVERY TRACKING ==========
  recovery: router({
    log: protectedProcedure
      .input(z.object({
        logDate: z.string(),
        recoveryType: z.enum(["rest_day", "active_recovery", "massage", "sauna", "ice_bath", "nap"]),
        durationMinutes: z.number().int().min(1).max(1440),
        energyBefore: z.number().int().min(1).max(10),
        energyAfter: z.number().int().min(1).max(10),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.execute(
          sql`INSERT INTO recovery_logs 
              (userId, logDate, recoveryType, durationMinutes, energyBefore, energyAfter, notes) 
              VALUES (${ctx.user.id}, ${input.logDate}, ${input.recoveryType}, ${input.durationMinutes}, 
                      ${input.energyBefore}, ${input.energyAfter}, ${input.notes || null})`
        );

        return { success: true, id: Number(result.insertId) };
      }),

    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(30) }))
      .query(async ({ input, ctx }) => {
        const result = await db.execute(
          sql`SELECT * FROM recovery_logs 
              WHERE userId = ${ctx.user.id} 
              ORDER BY logDate DESC 
              LIMIT ${input.limit}`
        );

        return result.rows;
      }),
  }),

  // ========== DOPAMINE REGULATION ==========
  dopamine: router({
    logBehavior: protectedProcedure
      .input(z.object({
        trigger: z.string().max(200),
        behavior: z.string().max(200),
        durationMinutes: z.number().int().min(1).max(1440),
        satisfaction: z.number().int().min(1).max(10),
        regret: z.number().int().min(1).max(10),
        healthierAlternative: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.execute(
          sql`INSERT INTO dopamine_logs 
              (userId, trigger, behavior, durationMinutes, satisfaction, regret, healthierAlternative) 
              VALUES (${ctx.user.id}, ${input.trigger}, ${input.behavior}, ${input.durationMinutes}, 
                      ${input.satisfaction}, ${input.regret}, ${input.healthierAlternative || null})`
        );

        return { success: true, id: Number(result.insertId) };
      }),

    getPatterns: protectedProcedure.query(async ({ ctx }) => {
      const result = await db.execute(
        sql`SELECT behavior, COUNT(*) as count, AVG(satisfaction) as avgSatisfaction, 
                   AVG(regret) as avgRegret, SUM(durationMinutes) as totalMinutes
            FROM dopamine_logs 
            WHERE userId = ${ctx.user.id} 
            GROUP BY behavior 
            ORDER BY count DESC 
            LIMIT 10`
      );

      return result.rows;
    }),
  }),
});
