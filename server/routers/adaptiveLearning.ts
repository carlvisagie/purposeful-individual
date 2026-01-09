/**
 * Adaptive Learning Engine Router
 * Platform learns from all clients and evolves coaching strategies
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  techniqueEffectiveness,
  clientPatterns,
  recommendationFeedback,
  adaptiveOutcomeTracking,
  trendDetection,
  strategyAdjustments,
} from "../../drizzle/schema-postgresql";
import { eq, desc, gte, sql } from "drizzle-orm";

export const adaptiveLearningRouter = router({
  /**
   * Record technique usage and effectiveness
   */
  recordTechniqueUsage: protectedProcedure
    .input(
      z.object({
        techniqueName: z.string(),
        techniqueCategory: z.string(),
        problemType: z.string(),
        wasSuccessful: z.boolean(),
        rating: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Find existing technique record
      const existing = await db
        .select()
        .from(techniqueEffectiveness)
        .where(
          sql`${techniqueEffectiveness.techniqueName} = ${input.techniqueName} 
              AND ${techniqueEffectiveness.problemType} = ${input.problemType}`
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing record
        const record = existing[0];
        await db
          .update(techniqueEffectiveness)
          .set({
            timesUsed: (record.timesUsed || 0) + 1,
            successCount: input.wasSuccessful ? (record.successCount || 0) + 1 : record.successCount,
            failureCount: !input.wasSuccessful ? (record.failureCount || 0) + 1 : record.failureCount,
            averageRating: input.rating || record.averageRating,
            lastRecommended: new Date(),
            // Increase confidence as we get more data
            confidenceScore: Math.min(100, (record.confidenceScore || 50) + 2),
          })
          .where(eq(techniqueEffectiveness.id, record.id));
      } else {
        // Create new record
        await db.insert(techniqueEffectiveness).values({
          techniqueName: input.techniqueName,
          techniqueCategory: input.techniqueCategory,
          problemType: input.problemType,
          timesUsed: 1,
          successCount: input.wasSuccessful ? 1 : 0,
          failureCount: input.wasSuccessful ? 0 : 1,
          averageRating: input.rating,
          confidenceScore: 30, // Low confidence with limited data
        });
      }

      return { success: true };
    }),

  /**
   * Get most effective techniques for a problem type
   */
  getMostEffectiveTechniques: protectedProcedure
    .input(
      z.object({
        problemType: z.string(),
        limit: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      const techniques = await db
        .select()
        .from(techniqueEffectiveness)
        .where(eq(techniqueEffectiveness.problemType, input.problemType))
        .orderBy(
          desc(sql`(${techniqueEffectiveness.successCount} * 1.0 / GREATEST(${techniqueEffectiveness.timesUsed}, 1)) * (${techniqueEffectiveness.confidenceScore} / 100.0)`)
        )
        .limit(input.limit);

      return { techniques };
    }),

  /**
   * Record client feedback on recommendation
   */
  recordFeedback: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        recommendationType: z.string(),
        recommendationContent: z.string(),
        context: z.string().optional(),
        wasUsed: z.enum(["yes", "no"]),
        wasHelpful: z.enum(["yes", "no", "somewhat"]).optional(),
        rating: z.number().min(1).max(10).optional(),
        feedbackNotes: z.string().optional(),
        problemResolved: z.enum(["yes", "no", "partially"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(recommendationFeedback).values(input);
      return { success: true };
    }),

  /**
   * Detect patterns across clients
   */
  detectPatterns: protectedProcedure.query(async () => {
    // This would run complex analytics queries
    // For now, return existing patterns
    const patterns = await db
      .select()
      .from(clientPatterns)
      .where(eq(clientPatterns.isValidated, "true"))
      .orderBy(desc(clientPatterns.occurrenceCount))
      .limit(10);

    return { patterns };
  }),

  /**
   * Create or update outcome tracking
   */
  updateOutcome: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        currentEmotionalState: z.number().min(1).max(10),
        currentFunctioning: z.number().min(1).max(10),
        goalsAchieved: z.array(z.string()).optional(),
        sleepImproved: z.enum(["yes", "no", "unknown"]).optional(),
        relationshipsImproved: z.enum(["yes", "no", "unknown"]).optional(),
        workPerformanceImproved: z.enum(["yes", "no", "unknown"]).optional(),
        physicalHealthImproved: z.enum(["yes", "no", "unknown"]).optional(),
        attributedToCoaching: z.enum(["yes", "no", "partially"]).optional(),
        mostHelpfulAspect: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { clientId, ...updates } = input;

      // Check if outcome tracking exists
      const existing = await db
        .select()
        .from(adaptiveOutcomeTracking)
        .where(eq(adaptiveOutcomeTracking.clientId, clientId))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        const record = existing[0];
        const emotionalImprovement = updates.currentEmotionalState - (record.baselineEmotionalState || 0);
        const functioningImprovement = updates.currentFunctioning - (record.baselineFunctioning || 0);
        
        const baselineDate = record.baselineDate || new Date();
        const daysInCoaching = Math.floor((Date.now() - baselineDate.getTime()) / (1000 * 60 * 60 * 24));

        await db
          .update(adaptiveOutcomeTracking)
          .set({
            ...updates,
            goalsAchieved: updates.goalsAchieved ? JSON.stringify(updates.goalsAchieved) : record.goalsAchieved,
            emotionalImprovement,
            functioningImprovement,
            daysInCoaching,
          })
          .where(eq(adaptiveOutcomeTracking.id, record.id));
      } else {
        // Create baseline
        await db.insert(adaptiveOutcomeTracking).values({
          clientId,
          baselineDate: new Date(),
          baselineEmotionalState: updates.currentEmotionalState,
          baselineFunctioning: updates.currentFunctioning,
          baselineGoals: updates.goalsAchieved ? JSON.stringify(updates.goalsAchieved) : JSON.stringify([]),
          currentEmotionalState: updates.currentEmotionalState,
          currentFunctioning: updates.currentFunctioning,
          emotionalImprovement: 0,
          functioningImprovement: 0,
          daysInCoaching: 0,
        });
      }

      return { success: true };
    }),

  /**
   * Get outcome tracking for client
   */
  getOutcome: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      const outcomes = await db
        .select()
        .from(adaptiveOutcomeTracking)
        .where(eq(adaptiveOutcomeTracking.clientId, input.clientId))
        .limit(1);

      return { outcome: outcomes[0] || null };
    }),

  /**
   * Get active trends
   */
  getActiveTrends: protectedProcedure.query(async () => {
    const trends = await db
      .select()
      .from(trendDetection)
      .where(eq(trendDetection.isActive, "true"))
      .orderBy(desc(trendDetection.affectedPercentage))
      .limit(10);

    return { trends };
  }),

  /**
   * Get strategy adjustments history
   */
  getStrategyAdjustments: protectedProcedure.query(async () => {
    const adjustments = await db
      .select()
      .from(strategyAdjustments)
      .orderBy(desc(strategyAdjustments.implementedAt))
      .limit(20);

    return { adjustments };
  }),

  /**
   * Record new strategy adjustment
   */
  recordStrategyAdjustment: protectedProcedure
    .input(
      z.object({
        adjustmentType: z.string(),
        adjustmentDescription: z.string(),
        triggeringData: z.string(),
        expectedImprovement: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(strategyAdjustments).values(input);
      return { success: true };
    }),

  /**
   * Get platform learning summary
   */
  getLearningSummary: protectedProcedure.query(async () => {
    // Get counts and stats
    const [techniqueCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(techniqueEffectiveness);

    const [patternCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientPatterns)
      .where(eq(clientPatterns.isValidated, "true"));

    const [feedbackCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(recommendationFeedback);

    const [outcomeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(adaptiveOutcomeTracking);

    const [trendCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trendDetection)
      .where(eq(trendDetection.isActive, "true"));

    const [adjustmentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(strategyAdjustments);

    return {
      summary: {
        techniquesTracked: techniqueCount?.count || 0,
        patternsDetected: patternCount?.count || 0,
        feedbackReceived: feedbackCount?.count || 0,
        outcomesTracked: outcomeCount?.count || 0,
        activeTrends: trendCount?.count || 0,
        strategyAdjustments: adjustmentCount?.count || 0,
      },
    };
  }),
});
