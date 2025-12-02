import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * MASTER SYSTEMS ROUTER
 * 
 * Advanced transformation systems:
 * - Identity Architecture (who you're becoming)
 * - Accountability & Milestones (what you're achieving)
 * - Long-term Trajectory (where you're going)
 */

export const masterSystemsRouter = router({
  // ========== IDENTITY ARCHITECTURE ==========
  identity: router({
    createSnapshot: protectedProcedure
      .input(z.object({
        snapshotDate: z.string(),
        currentIdentity: z.string(),
        targetIdentity: z.string(),
        contradictions: z.string().optional(),
        alignmentScore: z.number().int().min(1).max(10),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.execute(
          sql`INSERT INTO identity_snapshots 
              (userId, snapshotDate, currentIdentity, targetIdentity, contradictions, alignmentScore) 
              VALUES (${ctx.user.id}, ${input.snapshotDate}, ${input.currentIdentity}, ${input.targetIdentity}, 
                      ${input.contradictions || null}, ${input.alignmentScore})`
        );

        return { success: true, id: Number(result.insertId) };
      }),

    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(30) }))
      .query(async ({ input, ctx }) => {
        const result = await db.execute(
          sql`SELECT * FROM identity_snapshots 
              WHERE userId = ${ctx.user.id} 
              ORDER BY snapshotDate DESC 
              LIMIT ${input.limit}`
        );

        return result.rows;
      }),

    getContradictions: protectedProcedure.query(async ({ ctx }) => {
      const result = await db.execute(
        sql`SELECT * FROM identity_snapshots 
            WHERE userId = ${ctx.user.id} AND contradictions IS NOT NULL 
            ORDER BY snapshotDate DESC 
            LIMIT 10`
      );

      return result.rows;
    }),

    getEvolution: protectedProcedure.query(async ({ ctx }) => {
      const result = await db.execute(
        sql`SELECT snapshotDate, alignmentScore FROM identity_snapshots 
            WHERE userId = ${ctx.user.id} 
            ORDER BY snapshotDate ASC`
      );

      return result.rows;
    }),
  }),

  // ========== ACCOUNTABILITY & MILESTONES ==========
  accountability: router({
    createMilestone: protectedProcedure
      .input(z.object({
        title: z.string().max(200),
        description: z.string().optional(),
        targetDate: z.string().optional(),
        category: z.enum(["health", "career", "relationships", "personal", "financial"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.execute(
          sql`INSERT INTO milestones (userId, title, description, targetDate, category) 
              VALUES (${ctx.user.id}, ${input.title}, ${input.description || null}, 
                      ${input.targetDate || null}, ${input.category})`
        );

        return { success: true, id: Number(result.insertId) };
      }),

    updateProgress: protectedProcedure
      .input(z.object({
        milestoneId: z.number().int(),
        progress: z.number().int().min(0).max(100),
        status: z.enum(["in_progress", "completed", "abandoned"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const completedAt = input.status === "completed" ? sql`NOW()` : sql`NULL`;

        await db.execute(
          sql`UPDATE milestones 
              SET progress = ${input.progress}, 
                  status = ${input.status || "in_progress"}, 
                  completedAt = ${completedAt}
              WHERE id = ${input.milestoneId} AND userId = ${ctx.user.id}`
        );

        return { success: true };
      }),

    getMilestones: protectedProcedure
      .input(z.object({ 
        status: z.enum(["in_progress", "completed", "abandoned", "all"]).default("in_progress") 
      }))
      .query(async ({ input, ctx }) => {
        const statusFilter = input.status === "all" 
          ? sql`` 
          : sql`AND status = ${input.status}`;

        const result = await db.execute(
          sql`SELECT * FROM milestones 
              WHERE userId = ${ctx.user.id} ${statusFilter}
              ORDER BY targetDate ASC, createdAt DESC`
        );

        return result.rows;
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const result = await db.execute(
        sql`SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
              SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
              AVG(progress) as avgProgress
            FROM milestones 
            WHERE userId = ${ctx.user.id}`
      );

      const stats = result.rows[0] as any;

      return {
        total: Number(stats?.total || 0),
        completed: Number(stats?.completed || 0),
        inProgress: Number(stats?.inProgress || 0),
        avgProgress: Number(stats?.avgProgress || 0).toFixed(1),
      };
    }),
  }),

  // ========== LONG-TERM TRAJECTORY ==========
  trajectory: router({
    setVision: protectedProcedure
      .input(z.object({
        mission: z.string(),
        coreValues: z.string().optional(),
        longTermGoals: z.string().optional(),
        oneYearVision: z.string().optional(),
        fiveYearVision: z.string().optional(),
        tenYearVision: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Upsert (insert or update if exists)
        await db.execute(
          sql`INSERT INTO life_vision 
              (userId, mission, coreValues, longTermGoals, oneYearVision, fiveYearVision, tenYearVision) 
              VALUES (${ctx.user.id}, ${input.mission}, ${input.coreValues || null}, 
                      ${input.longTermGoals || null}, ${input.oneYearVision || null}, 
                      ${input.fiveYearVision || null}, ${input.tenYearVision || null})
              ON DUPLICATE KEY UPDATE 
                mission = VALUES(mission),
                coreValues = VALUES(coreValues),
                longTermGoals = VALUES(longTermGoals),
                oneYearVision = VALUES(oneYearVision),
                fiveYearVision = VALUES(fiveYearVision),
                tenYearVision = VALUES(tenYearVision),
                updatedAt = NOW()`
        );

        return { success: true };
      }),

    getVision: protectedProcedure.query(async ({ ctx }) => {
      const result = await db.execute(
        sql`SELECT * FROM life_vision WHERE userId = ${ctx.user.id} LIMIT 1`
      );

      return result.rows[0] || null;
    }),

    getAlignment: protectedProcedure.query(async ({ ctx }) => {
      // Get recent identity alignment scores
      const identityResult = await db.execute(
        sql`SELECT AVG(alignmentScore) as avgIdentityAlignment 
            FROM identity_snapshots 
            WHERE userId = ${ctx.user.id} 
            AND snapshotDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      );

      // Get milestone completion rate
      const milestoneResult = await db.execute(
        sql`SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM milestones 
            WHERE userId = ${ctx.user.id}`
      );

      const identity = identityResult.rows[0] as any;
      const milestones = milestoneResult.rows[0] as any;

      const identityAlignment = Number(identity?.avgIdentityAlignment || 0);
      const milestoneCompletion = milestones?.total > 0 
        ? (Number(milestones.completed) / Number(milestones.total)) * 100 
        : 0;

      return {
        identityAlignment: identityAlignment.toFixed(1),
        milestoneCompletion: milestoneCompletion.toFixed(1),
        overallAlignment: ((identityAlignment * 10 + milestoneCompletion) / 2).toFixed(1),
      };
    }),
  }),
});
