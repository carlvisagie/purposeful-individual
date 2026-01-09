/**
 * TRUTH KEEPERS ROUTER
 * Research validation and evidence-based recommendation system
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db-standalone";
import { 
  validatedResearch, 
  platformRecommendations, 
  pseudoscienceBlocklist,
  researchQualityReviews 
} from "../../drizzle/schema-postgresql";
import { eq, and, desc, sql } from "drizzle-orm";

export const truthKeepersRouter = router({
  
  // ============================================================================
  // GET VALIDATED RESEARCH
  // ============================================================================
  
  getValidatedResearch: publicProcedure
    .input(z.object({
      domain: z.string().optional(),
      evidenceLevel: z.enum(["level_a_high", "level_b_moderate", "level_c_low"]).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const conditions = [];
      
      if (input.domain) {
        conditions.push(eq(validatedResearch.domain, input.domain));
      }
      
      if (input.evidenceLevel) {
        conditions.push(eq(validatedResearch.evidenceLevel, input.evidenceLevel));
      }
      
      // Only approved research
      conditions.push(eq(validatedResearch.validationStatus, "approved"));
      
      const research = await db
        .select()
        .from(validatedResearch)
        .where(and(...conditions))
        .orderBy(desc(validatedResearch.publicationYear))
        .limit(input.limit);
      
      return research;
    }),
  
  // ============================================================================
  // GET PLATFORM RECOMMENDATIONS (Evidence-Based)
  // ============================================================================
  
  getRecommendations: publicProcedure
    .input(z.object({
      domain: z.string(),
      evidenceLevel: z.enum(["level_a_high", "level_b_moderate", "level_c_low"]).optional(),
    }))
    .query(async ({ input }) => {
      const conditions = [
        eq(platformRecommendations.domain, input.domain),
        eq(platformRecommendations.status, "active"),
      ];
      
      if (input.evidenceLevel) {
        conditions.push(eq(platformRecommendations.evidenceLevel, input.evidenceLevel));
      }
      
      const recommendations = await db
        .select()
        .from(platformRecommendations)
        .where(and(...conditions))
        .orderBy(desc(platformRecommendations.confidenceScore));
      
      return recommendations;
    }),
  
  // ============================================================================
  // CHECK IF CLAIM IS PSEUDOSCIENCE
  // ============================================================================
  
  checkPseudoscience: publicProcedure
    .input(z.object({
      claim: z.string(),
    }))
    .query(async ({ input }) => {
      // Check if claim contains blocked pseudoscience
      const blocked = await db
        .select()
        .from(pseudoscienceBlocklist)
        .where(sql`LOWER(${pseudoscienceBlocklist.claim}) LIKE LOWER(${`%${input.claim}%`})`);
      
      if (blocked.length > 0) {
        return {
          isPseudoscience: true,
          blockedClaims: blocked,
          action: blocked[0].action,
          severity: blocked[0].severity,
          reason: blocked[0].reason,
        };
      }
      
      return {
        isPseudoscience: false,
      };
    }),
  
  // ============================================================================
  // TRACK RECOMMENDATION EFFECTIVENESS (Self-Learning)
  // ============================================================================
  
  trackRecommendationEffectiveness: protectedProcedure
    .input(z.object({
      recommendationId: z.string(),
      wasEffective: z.boolean(),
      effectivenessRating: z.number().min(1).max(10),
    }))
    .mutation(async ({ input }) => {
      // Get current recommendation
      const [recommendation] = await db
        .select()
        .from(platformRecommendations)
        .where(eq(platformRecommendations.id, input.recommendationId))
        .limit(1);
      
      if (!recommendation) {
        throw new Error("Recommendation not found");
      }
      
      // Calculate new success rate and avg rating
      const totalUses = (recommendation.totalUses || 0) + 1;
      const currentSuccessCount = Math.round((recommendation.successRate || 0) * (recommendation.totalUses || 0) / 100);
      const newSuccessCount = currentSuccessCount + (input.wasEffective ? 1 : 0);
      const newSuccessRate = (newSuccessCount / totalUses) * 100;
      
      const currentRatingSum = (recommendation.avgEffectivenessRating || 0) * (recommendation.totalUses || 0);
      const newRatingSum = currentRatingSum + input.effectivenessRating;
      const newAvgRating = newRatingSum / totalUses;
      
      // Update recommendation
      await db
        .update(platformRecommendations)
        .set({
          totalUses,
          successRate: newSuccessRate.toString(),
          avgEffectivenessRating: newAvgRating.toString(),
          updatedAt: new Date(),
        })
        .where(eq(platformRecommendations.id, input.recommendationId));
      
      return {
        success: true,
        newSuccessRate,
        newAvgRating,
        totalUses,
      };
    }),
  
  // ============================================================================
  // ADMIN: ADD VALIDATED RESEARCH
  // ============================================================================
  
  addValidatedResearch: protectedProcedure
    .input(z.object({
      title: z.string(),
      authors: z.array(z.string()),
      journal: z.string(),
      publicationYear: z.number(),
      doi: z.string().optional(),
      pubmedId: z.string().optional(),
      url: z.string().optional(),
      studyType: z.enum([
        "meta_analysis",
        "systematic_review",
        "randomized_controlled_trial",
        "cohort_study",
        "case_control_study",
        "cross_sectional_study",
        "case_series",
        "expert_opinion"
      ]),
      evidenceLevel: z.enum(["level_a_high", "level_b_moderate", "level_c_low", "level_d_reject"]),
      domain: z.string(),
      keyFindings: z.string(),
      practicalApplication: z.string().optional(),
      sampleSize: z.number().optional(),
      hasControlGroup: z.boolean().optional(),
      isRandomized: z.boolean().optional(),
      effectSize: z.number().optional(),
      pValue: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(validatedResearch).values({
        id,
        title: input.title,
        authors: JSON.stringify(input.authors),
        journal: input.journal,
        publicationYear: input.publicationYear,
        doi: input.doi,
        pubmedId: input.pubmedId,
        url: input.url,
        studyType: input.studyType,
        evidenceLevel: input.evidenceLevel,
        domain: input.domain,
        keyFindings: input.keyFindings,
        practicalApplication: input.practicalApplication,
        sampleSize: input.sampleSize,
        hasControlGroup: input.hasControlGroup,
        isRandomized: input.isRandomized,
        effectSize: input.effectSize ? input.effectSize.toString() : undefined,
        pValue: input.pValue ? input.pValue.toString() : undefined,
        isPeerReviewed: true,
        validationStatus: "approved",
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return { success: true, id };
    }),
  
  // ============================================================================
  // ADMIN: ADD PLATFORM RECOMMENDATION
  // ============================================================================
  
  addRecommendation: protectedProcedure
    .input(z.object({
      type: z.enum([
        "intervention",
        "protocol",
        "habit",
        "nutrition_advice",
        "supplement",
        "behavior_change",
        "mindset_shift",
        "lifestyle_change"
      ]),
      title: z.string(),
      description: z.string(),
      howToImplement: z.string().optional(),
      evidenceLevel: z.enum(["level_a_high", "level_b_moderate", "level_c_low"]),
      primaryResearchId: z.string(),
      supportingResearchIds: z.array(z.string()).optional(),
      domain: z.string(),
      confidenceScore: z.number().min(0).max(100),
      targetAudience: z.string().optional(),
      contraindications: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(platformRecommendations).values({
        id,
        recommendationType: input.type,
        title: input.title,
        description: input.description,
        howToImplement: input.howToImplement,
        evidenceLevel: input.evidenceLevel,
        primaryResearchId: input.primaryResearchId,
        supportingResearchIds: input.supportingResearchIds ? JSON.stringify(input.supportingResearchIds) : undefined,
        domain: input.domain,
        confidenceScore: input.confidenceScore,
        targetAudience: input.targetAudience,
        contraindications: input.contraindications,
        status: "active",
        totalUses: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: ctx.user.id,
      });
      
      return { success: true, id };
    }),
  
  // ============================================================================
  // ADMIN: BLOCK PSEUDOSCIENCE
  // ============================================================================
  
  blockPseudoscience: protectedProcedure
    .input(z.object({
      claim: z.string(),
      category: z.enum([
        "unproven_supplement",
        "debunked_theory",
        "dangerous_practice",
        "misleading_claim",
        "anecdotal_only",
        "conflict_of_interest",
        "cherry_picked_data",
        "correlation_not_causation"
      ]),
      reason: z.string(),
      evidenceAgainst: z.string().optional(),
      severity: z.enum(["dangerous", "misleading", "unproven"]),
      action: z.enum(["hard_block", "flag_review", "show_warning"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = `pseudo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(pseudoscienceBlocklist).values({
        id,
        claim: input.claim,
        category: input.category,
        reason: input.reason,
        evidenceAgainst: input.evidenceAgainst,
        severity: input.severity,
        action: input.action,
        detectionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: ctx.user.id,
      });
      
      return { success: true, id };
    }),
});
