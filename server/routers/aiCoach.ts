import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

/**
 * AI COACHING ASSISTANT ROUTER
 * 
 * Personalized AI coach that:
 * - Understands user's health, stress, identity, and goals
 * - Provides evidence-based guidance
 * - Tracks conversation history
 * - Offers context-aware suggestions
 */

export const aiCoachRouter = router({
  sendMessage: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(2000),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get user context (recent data for personalization)
      const healthData = await db.execute(
        sql`SELECT * FROM health_logs WHERE userId = ${ctx.user.id} ORDER BY logDate DESC LIMIT 7`
      );

      const stressData = await db.execute(
        sql`SELECT * FROM stress_sessions WHERE userId = ${ctx.user.id} ORDER BY sessionDate DESC LIMIT 5`
      );

      const identityData = await db.execute(
        sql`SELECT * FROM identity_snapshots WHERE userId = ${ctx.user.id} ORDER BY snapshotDate DESC LIMIT 1`
      );

      const milestones = await db.execute(
        sql`SELECT * FROM milestones WHERE userId = ${ctx.user.id} AND status = 'in_progress' LIMIT 5`
      );

      const vision = await db.execute(
        sql`SELECT * FROM life_vision WHERE userId = ${ctx.user.id} LIMIT 1`
      );

      // Build context for LLM
      const userContext = {
        name: ctx.user.name,
        recentHealth: healthData.rows.length > 0 ? healthData.rows : "No health data yet",
        recentStress: stressData.rows.length > 0 ? stressData.rows : "No stress data yet",
        identity: identityData.rows.length > 0 ? identityData.rows[0] : "No identity snapshot yet",
        activeMilestones: milestones.rows.length > 0 ? milestones.rows : "No active milestones",
        lifeVision: vision.rows.length > 0 ? vision.rows[0] : "No life vision set",
      };

      // Call LLM with context
      const systemPrompt = `You are an expert life coach specializing in identity-based transformation, behavioral change, and evidence-based protocols.

Your coaching style is based on:
- James Clear (Atomic Habits, identity-based habits)
- David Goggins (mental toughness, discipline)
- Andrew Huberman (neuroscience, stress management)
- Peter Attia (health optimization, longevity)
- Tim Ferriss (systems thinking, productivity)

User Context:
${JSON.stringify(userContext, null, 2)}

Your role:
1. Provide personalized, evidence-based guidance
2. Reference user's specific data (health, stress, identity, goals)
3. Suggest actionable next steps
4. Maintain accountability
5. Celebrate progress
6. Challenge limiting beliefs

Be direct, honest, and supportive. Focus on systems over goals. Identity over outcomes.`;

      const llmResponse = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.message },
        ],
      });

      const response = llmResponse.choices[0].message.content || "I'm here to help. Could you tell me more?";

      // Save conversation
      await db.execute(
        sql`INSERT INTO chat_sessions (userId, message, response, context) 
            VALUES (${ctx.user.id}, ${input.message}, ${response}, ${JSON.stringify(userContext)})`
      );

      return {
        response,
        context: userContext,
      };
    }),

  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const result = await db.execute(
        sql`SELECT id, message, response, createdAt FROM chat_sessions 
            WHERE userId = ${ctx.user.id} 
            ORDER BY createdAt DESC 
            LIMIT ${input.limit}`
      );

      return result.rows.reverse(); // Return in chronological order
    }),

  getInsights: protectedProcedure.query(async ({ ctx }) => {
    // Get conversation stats
    const result = await db.execute(
      sql`SELECT COUNT(*) as totalMessages FROM chat_sessions WHERE userId = ${ctx.user.id}`
    );

    const stats = result.rows[0] as any;

    return {
      totalMessages: Number(stats?.totalMessages || 0),
      lastActive: new Date().toISOString(), // Placeholder
    };
  }),
});
