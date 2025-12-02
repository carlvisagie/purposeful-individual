import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * COGNITIVE PROTECTION ROUTER
 * 
 * TIER 1 Features from Master Prompt:
 * - Mental Clarity Tracker
 * - Cognitive Load Monitor
 * - Energy Level Tracking
 * - Spiral Detection
 */

export const cognitiveRouter = router({
  // Log mental state
  logState: protectedProcedure
    .input(z.object({
      logType: z.enum(['clarity', 'load', 'energy', 'spiral']),
      mentalClarity: z.number().min(1).max(10).optional(),
      cognitiveLoad: z.number().min(1).max(10).optional(),
      energyLevel: z.number().min(1).max(10).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.execute(
        sql`INSERT INTO cognitive_logs (userId, logType, mentalClarity, cognitiveLoad, energyLevel, notes)
            VALUES (${ctx.user.id}, ${input.logType}, ${input.mentalClarity || null}, ${input.cognitiveLoad || null}, ${input.energyLevel || null}, ${input.notes || null})`
      );

      return { success: true, message: "Mental state logged" };
    }),

  // Get recent logs
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(30) }))
    .query(async ({ input, ctx }) => {
      const result = await db.execute(
        sql`SELECT * FROM cognitive_logs 
            WHERE userId = ${ctx.user.id} 
            ORDER BY createdAt DESC 
            LIMIT ${input.limit}`
      );

      return result.rows;
    }),

  // Get stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const last7Days = await db.execute(
      sql`SELECT 
            AVG(mentalClarity) as avgClarity,
            AVG(cognitiveLoad) as avgLoad,
            AVG(energyLevel) as avgEnergy,
            COUNT(CASE WHEN logType = 'spiral' THEN 1 END) as spiralCount
          FROM cognitive_logs 
          WHERE userId = ${ctx.user.id} 
            AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    const stats = last7Days.rows[0] || {
      avgClarity: 0,
      avgLoad: 0,
      avgEnergy: 0,
      spiralCount: 0,
    };

    return {
      avgClarity: Number(stats.avgClarity || 0).toFixed(1),
      avgLoad: Number(stats.avgLoad || 0).toFixed(1),
      avgEnergy: Number(stats.avgEnergy || 0).toFixed(1),
      spiralCount: Number(stats.spiralCount || 0),
      recommendation: getRecommendation(stats),
    };
  }),

  // Detect spiral (called automatically when user logs multiple low clarity/high load entries)
  detectSpiral: protectedProcedure.query(async ({ ctx }) => {
    // Check last 3 logs
    const recentLogs = await db.execute(
      sql`SELECT mentalClarity, cognitiveLoad 
          FROM cognitive_logs 
          WHERE userId = ${ctx.user.id} 
          ORDER BY createdAt DESC 
          LIMIT 3`
    );

    if (recentLogs.rows.length < 3) {
      return { inSpiral: false };
    }

    // Spiral detection: 3 consecutive low clarity (<5) or high load (>7)
    const lowClarityCount = recentLogs.rows.filter((log: any) => log.mentalClarity && log.mentalClarity < 5).length;
    const highLoadCount = recentLogs.rows.filter((log: any) => log.cognitiveLoad && log.cognitiveLoad > 7).length;

    const inSpiral = lowClarityCount >= 2 || highLoadCount >= 2;

    if (inSpiral) {
      // Log spiral detection
      await db.execute(
        sql`INSERT INTO cognitive_logs (userId, logType, notes)
            VALUES (${ctx.user.id}, 'spiral', 'Automatic spiral detection triggered')`
      );
    }

    return {
      inSpiral,
      protocol: inSpiral ? getSpiralProtocol() : null,
    };
  }),
});

function getRecommendation(stats: any): string {
  const clarity = Number(stats.avgClarity || 0);
  const load = Number(stats.avgLoad || 0);
  const energy = Number(stats.avgEnergy || 0);

  if (clarity < 5) {
    return "Low mental clarity detected. Reduce decisions. Use Decision Helper for common scenarios.";
  }

  if (load > 7) {
    return "High cognitive load. Take 5-minute break. Do Box Breathing. Defer non-essential decisions.";
  }

  if (energy < 4) {
    return "Low energy. Prioritize sleep, movement, hydration. Avoid complex tasks until energy rebounds.";
  }

  if (stats.spiralCount > 2) {
    return "Multiple spirals this week. Review Emotional Overwhelm Protocol. Consider session with coach.";
  }

  return "Cognitive health is stable. Maintain current routines.";
}

function getSpiralProtocol(): string[] {
  return [
    "STOP: Step away from current task immediately",
    "BREATHE: Box breathing for 2 minutes (4-4-4-4)",
    "GROUND: 5-4-3-2-1 technique (5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste)",
    "MOVE: 5-minute walk outside or 10 pushups",
    "SIMPLIFY: Pick ONE thing to do next. Ignore everything else.",
    "EXECUTE: Do that one thing for 10 minutes. No thinking, just doing.",
  ];
}
