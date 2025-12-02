import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * STRESS REDUCTION ROUTER
 * 
 * Evidence-based stress management following:
 * - Wim Hof (breathing techniques, cold exposure)
 * - Andrew Huberman (neuroscience of stress)
 * - Mindfulness-Based Stress Reduction (MBSR)
 * 
 * Techniques: Box Breathing, Wim Hof Method, 5-4-3-2-1 Grounding
 */

export const stressRouter = router({
  // Start a stress reduction session
  startSession: protectedProcedure
    .input(
      z.object({
        technique: z.enum(["box_breathing", "wim_hof", "grounding", "body_scan"]),
        stressBefore: z.number().int().min(1).max(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Return session start data
      return {
        success: true,
        technique: input.technique,
        stressBefore: input.stressBefore,
        startTime: new Date().toISOString(),
      };
    }),

  // Complete a stress reduction session
  completeSession: protectedProcedure
    .input(
      z.object({
        technique: z.enum(["box_breathing", "wim_hof", "grounding", "body_scan"]),
        durationSeconds: z.number().int().min(1).max(3600),
        stressBefore: z.number().int().min(1).max(10),
        stressAfter: z.number().int().min(1).max(10),
        notes: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db.execute(
        sql`INSERT INTO stress_sessions (userId, technique, durationSeconds, stressBefore, stressAfter, notes) 
            VALUES (${ctx.user.id}, ${input.technique}, ${input.durationSeconds}, ${input.stressBefore}, ${input.stressAfter}, ${input.notes || null})`
      );

      const improvement = input.stressBefore - input.stressAfter;

      return {
        success: true,
        id: Number(result.insertId),
        improvement,
        message:
          improvement > 0
            ? `Stress reduced by ${improvement} points! Great work.`
            : "Session complete. Keep practicing for better results.",
      };
    }),

  // Get session history
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await db.execute(
        sql`SELECT * FROM stress_sessions 
            WHERE userId = ${ctx.user.id} 
            ORDER BY sessionDate DESC 
            LIMIT ${input.limit}`
      );

      return result.rows;
    }),

  // Get stats (averages, total sessions, effectiveness)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.execute(
      sql`SELECT 
            COUNT(*) as totalSessions,
            AVG(stressBefore) as avgStressBefore,
            AVG(stressAfter) as avgStressAfter,
            AVG(stressBefore - stressAfter) as avgImprovement,
            SUM(durationSeconds) as totalDurationSeconds,
            technique,
            COUNT(*) as count
          FROM stress_sessions 
          WHERE userId = ${ctx.user.id}
          GROUP BY technique`
    );

    const techniqueStats = result.rows as any[];

    // Overall stats
    const overallResult = await db.execute(
      sql`SELECT 
            COUNT(*) as totalSessions,
            AVG(stressBefore) as avgStressBefore,
            AVG(stressAfter) as avgStressAfter,
            AVG(stressBefore - stressAfter) as avgImprovement,
            SUM(durationSeconds) as totalDurationSeconds
          FROM stress_sessions 
          WHERE userId = ${ctx.user.id}`
    );

    const overall = overallResult.rows[0] as any;

    return {
      overall: {
        totalSessions: Number(overall?.totalSessions || 0),
        avgStressBefore: Number(overall?.avgStressBefore || 0).toFixed(1),
        avgStressAfter: Number(overall?.avgStressAfter || 0).toFixed(1),
        avgImprovement: Number(overall?.avgImprovement || 0).toFixed(1),
        totalMinutes: Math.round(Number(overall?.totalDurationSeconds || 0) / 60),
      },
      byTechnique: techniqueStats.map((stat) => ({
        technique: stat.technique,
        count: Number(stat.count),
        avgImprovement: Number(stat.avgImprovement).toFixed(1),
      })),
    };
  }),
});
