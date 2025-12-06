import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import {
  autismProfiles,
  interventionPlans,
  supplementTracking,
  dietaryInterventions,
  therapySessions,
  autismOutcomeTracking,
  autismPatternDetection,
  autismProviders,
  autismDailyLogs,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * AUTISM TRANSFORMATION MODULE - tRPC ROUTER
 * 
 * Implements the world-class autism transformation protocol
 * combining biomedical, behavioral, and cutting-edge interventions.
 */

export const autismRouter = router({
  // ========================================
  // CHILD PROFILE & ASSESSMENT
  // ========================================

  createProfile: protectedProcedure
    .input(
      z.object({
        childName: z.string(),
        dateOfBirth: z.date(),
        diagnosisDate: z.date().optional(),
        severity: z.enum(["mild", "moderate", "severe"]),
        atecScore: z.number().optional(),
        carsScore: z.number().optional(),
        communicationLevel: z.enum(["nonverbal", "minimally_verbal", "verbal"]),
        giSymptoms: z.array(z.string()).optional(),
        sleepIssues: z.array(z.string()).optional(),
        sensoryProfile: z.object({ hyper: z.array(z.string()), hypo: z.array(z.string()) }).optional(),
        behaviorChallenges: z.array(z.string()).optional(),
        familyResources: z.object({ time: z.string(), budget: z.string(), support: z.string() }).optional(),
        treatmentPriorities: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [profile] = await db.insert(autismProfiles).values({
        userId: ctx.user.id,
        childName: input.childName,
        dateOfBirth: input.dateOfBirth,
        diagnosisDate: input.diagnosisDate,
        severity: input.severity,
        atecScore: input.atecScore,
        carsScore: input.carsScore,
        communicationLevel: input.communicationLevel,
        giSymptoms: input.giSymptoms ? JSON.stringify(input.giSymptoms) : null,
        sleepIssues: input.sleepIssues ? JSON.stringify(input.sleepIssues) : null,
        sensoryProfile: input.sensoryProfile ? JSON.stringify(input.sensoryProfile) : null,
        behaviorChallenges: input.behaviorChallenges ? JSON.stringify(input.behaviorChallenges) : null,
        familyResources: input.familyResources ? JSON.stringify(input.familyResources) : null,
        treatmentPriorities: input.treatmentPriorities ? JSON.stringify(input.treatmentPriorities) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    }),

  getMyProfiles: protectedProcedure.query(async ({ ctx }) => {
    const profiles = await db
      .select()
      .from(autismProfiles)
      .where(eq(autismProfiles.userId, ctx.user.id))
      .orderBy(desc(autismProfiles.createdAt));

    return profiles.map((p) => ({
      ...p,
      giSymptoms: p.giSymptoms ? JSON.parse(p.giSymptoms) : [],
      sleepIssues: p.sleepIssues ? JSON.parse(p.sleepIssues) : [],
      sensoryProfile: p.sensoryProfile ? JSON.parse(p.sensoryProfile) : null,
      behaviorChallenges: p.behaviorChallenges ? JSON.parse(p.behaviorChallenges) : [],
      familyResources: p.familyResources ? JSON.parse(p.familyResources) : null,
      treatmentPriorities: p.treatmentPriorities ? JSON.parse(p.treatmentPriorities) : [],
    }));
  }),

  getProfile: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [profile] = await db
        .select()
        .from(autismProfiles)
        .where(and(eq(autismProfiles.id, input.profileId), eq(autismProfiles.userId, ctx.user.id)));

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      return {
        ...profile,
        giSymptoms: profile.giSymptoms ? JSON.parse(profile.giSymptoms) : [],
        sleepIssues: profile.sleepIssues ? JSON.parse(profile.sleepIssues) : [],
        sensoryProfile: profile.sensoryProfile ? JSON.parse(profile.sensoryProfile) : null,
        behaviorChallenges: profile.behaviorChallenges ? JSON.parse(profile.behaviorChallenges) : [],
        familyResources: profile.familyResources ? JSON.parse(profile.familyResources) : null,
        treatmentPriorities: profile.treatmentPriorities ? JSON.parse(profile.treatmentPriorities) : [],
      };
    }),

  // ========================================
  // INTERVENTION PLANS
  // ========================================

  createInterventionPlan: protectedProcedure
    .input(
      z.object({
        profileId: z.number(),
        tier1Interventions: z.array(z.string()),
        tier2Interventions: z.array(z.string()).optional(),
        tier3Interventions: z.array(z.string()).optional(),
        tier4Interventions: z.array(z.string()).optional(),
        currentPhase: z.enum(["foundation", "biomedical", "behavioral", "advanced"]),
        providerDirectory: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [plan] = await db.insert(interventionPlans).values({
        profileId: input.profileId,
        tier1Interventions: JSON.stringify(input.tier1Interventions),
        tier2Interventions: input.tier2Interventions ? JSON.stringify(input.tier2Interventions) : null,
        tier3Interventions: input.tier3Interventions ? JSON.stringify(input.tier3Interventions) : null,
        tier4Interventions: input.tier4Interventions ? JSON.stringify(input.tier4Interventions) : null,
        currentPhase: input.currentPhase,
        startDate: new Date(),
        providerDirectory: input.providerDirectory ? JSON.stringify(input.providerDirectory) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    }),

  getInterventionPlan: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .query(async ({ input }) => {
      const [plan] = await db
        .select()
        .from(interventionPlans)
        .where(eq(interventionPlans.profileId, input.profileId))
        .orderBy(desc(interventionPlans.createdAt))
        .limit(1);

      if (!plan) return null;

      return {
        ...plan,
        tier1Interventions: JSON.parse(plan.tier1Interventions),
        tier2Interventions: plan.tier2Interventions ? JSON.parse(plan.tier2Interventions) : [],
        tier3Interventions: plan.tier3Interventions ? JSON.parse(plan.tier3Interventions) : [],
        tier4Interventions: plan.tier4Interventions ? JSON.parse(plan.tier4Interventions) : [],
        providerDirectory: plan.providerDirectory ? JSON.parse(plan.providerDirectory) : {},
      };
    }),

  // ========================================
  // SUPPLEMENT TRACKING
  // ========================================

  addSupplement: protectedProcedure
    .input(
      z.object({
        profileId: z.number(),
        supplementName: z.string(),
        dosage: z.string(),
        frequency: z.enum(["daily", "twice_daily", "every_3_days"]),
      })
    )
    .mutation(async ({ input }) => {
      const [supplement] = await db.insert(supplementTracking).values({
        profileId: input.profileId,
        supplementName: input.supplementName,
        dosage: input.dosage,
        frequency: input.frequency,
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    }),

  updateSupplementTracking: protectedProcedure
    .input(
      z.object({
        supplementId: z.number(),
        adherence: z.number().min(0).max(100).optional(),
        sideEffects: z.array(z.string()).optional(),
        perceivedBenefit: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(supplementTracking)
        .set({
          adherence: input.adherence,
          sideEffects: input.sideEffects ? JSON.stringify(input.sideEffects) : undefined,
          perceivedBenefit: input.perceivedBenefit,
          updatedAt: new Date(),
        })
        .where(eq(supplementTracking.id, input.supplementId));

      return { success: true };
    }),

  getSupplements: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .query(async ({ input }) => {
      const supplements = await db
        .select()
        .from(supplementTracking)
        .where(eq(supplementTracking.profileId, input.profileId))
        .orderBy(desc(supplementTracking.startDate));

      return supplements.map((s) => ({
        ...s,
        sideEffects: s.sideEffects ? JSON.parse(s.sideEffects) : [],
      }));
    }),

  // ========================================
  // DIETARY INTERVENTIONS
  // ========================================

  startDiet: protectedProcedure
    .input(
      z.object({
        profileId: z.number(),
        dietType: z.enum(["GFCF", "ketogenic", "SCD"]),
      })
    )
    .mutation(async ({ input }) => {
      const [diet] = await db.insert(dietaryInterventions).values({
        profileId: input.profileId,
        dietType: input.dietType,
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    }),

  updateDietTracking: protectedProcedure
    .input(
      z.object({
        dietId: z.number(),
        adherence: z.number().min(0).max(100).optional(),
        giSymptomChanges: z.record(z.string(), z.any()).optional(),
        behaviorChanges: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(dietaryInterventions)
        .set({
          adherence: input.adherence,
          giSymptomChanges: input.giSymptomChanges ? JSON.stringify(input.giSymptomChanges) : undefined,
          behaviorChanges: input.behaviorChanges ? JSON.stringify(input.behaviorChanges) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(dietaryInterventions.id, input.dietId));

      return { success: true };
    }),

  getDiets: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .query(async ({ input }) => {
      const diets = await db
        .select()
        .from(dietaryInterventions)
        .where(eq(dietaryInterventions.profileId, input.profileId))
        .orderBy(desc(dietaryInterventions.startDate));

      return diets.map((d) => ({
        ...d,
        giSymptomChanges: d.giSymptomChanges ? JSON.parse(d.giSymptomChanges) : {},
        behaviorChanges: d.behaviorChanges ? JSON.parse(d.behaviorChanges) : {},
      }));
    }),

  // ========================================
  // THERAPY SESSIONS
  // ========================================

  logTherapySession: protectedProcedure
    .input(
      z.object({
        profileId: z.number(),
        therapyType: z.enum(["ABA", "OT", "speech", "Floortime", "neurofeedback"]),
        sessionDate: z.date(),
        duration: z.number(),
        goalsAddressed: z.array(z.string()).optional(),
        progress: z.record(z.string(), z.any()).optional(),
        parentFeedback: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [session] = await db.insert(therapySessions).values({
        profileId: input.profileId,
        therapyType: input.therapyType,
        sessionDate: input.sessionDate,
        duration: input.duration,
        goalsAddressed: input.goalsAddressed ? JSON.stringify(input.goalsAddressed) : null,
        progress: input.progress ? JSON.stringify(input.progress) : null,
        parentFeedback: input.parentFeedback,
        createdAt: new Date(),
      });

      return { success: true };
    }),

  getTherapySessions: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .query(async ({ input }) => {
      const sessions = await db
        .select()
        .from(therapySessions)
        .where(eq(therapySessions.profileId, input.profileId))
        .orderBy(desc(therapySessions.sessionDate));

      return sessions.map((s) => ({
        ...s,
        goalsAddressed: s.goalsAddressed ? JSON.parse(s.goalsAddressed) : [],
        progress: s.progress ? JSON.parse(s.progress) : {},
      }));
    }),

  // ========================================
  // OUTCOME TRACKING
  // ========================================

  recordOutcome: protectedProcedure
    .input(
      z.object({
        profileId: z.number(),
        atecScore: z.number().optional(),
        carsScore: z.number().optional(),
        communicationLevel: z.enum(["nonverbal", "minimally_verbal", "verbal"]).optional(),
        behaviorScore: z.number().min(1).max(10).optional(),
        adaptiveFunctionScore: z.number().min(1).max(10).optional(),
        giSymptomScore: z.number().min(1).max(10).optional(),
        sleepScore: z.number().min(1).max(10).optional(),
        familyQOL: z.number().min(1).max(10).optional(),
        parentStress: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [outcome] = await db.insert(autismOutcomeTracking).values({
        profileId: input.profileId,
        assessmentDate: new Date(),
        atecScore: input.atecScore,
        carsScore: input.carsScore,
        communicationLevel: input.communicationLevel,
        behaviorScore: input.behaviorScore,
        adaptiveFunctionScore: input.adaptiveFunctionScore,
        giSymptomScore: input.giSymptomScore,
        sleepScore: input.sleepScore,
        familyQOL: input.familyQOL,
        parentStress: input.parentStress,
        createdAt: new Date(),
      });

      return { success: true };
    }),

  getOutcomes: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(autismOutcomeTracking)
        .where(eq(autismOutcomeTracking.profileId, input.profileId))
        .orderBy(desc(autismOutcomeTracking.assessmentDate));
    }),

  // ========================================
  // PROVIDER DIRECTORY
  // ========================================

  searchProviders: protectedProcedure
    .input(
      z.object({
        providerType: z.enum(["ABA", "OT", "speech", "FMT_clinic", "neurofeedback"]).optional(),
        location: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = db.select().from(autismProviders);

      if (input.providerType) {
        query = query.where(eq(autismProviders.providerType, input.providerType)) as any;
      }

      return await query.orderBy(desc(autismProviders.rating));
    }),

  // ========================================
  // DAILY TRACKING LOGS
  // ========================================

  saveDailyLog: protectedProcedure
    .input(
      z.object({
        profileId: z.number(),
        date: z.date(),
        mood: z.number().min(1).max(10),
        sleepQuality: z.number().min(1).max(10),
        sleepHours: z.number().optional(),
        meltdownCount: z.number().min(0).default(0),
        communicationAttempts: z.number().min(0).default(0),
        wins: z.string().optional(),
        challenges: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(autismDailyLogs).values({
        profileId: input.profileId,
        date: input.date,
        mood: input.mood,
        sleepQuality: input.sleepQuality,
        sleepHours: input.sleepHours ? Math.round(input.sleepHours * 10) : null,
        meltdownCount: input.meltdownCount,
        communicationAttempts: input.communicationAttempts,
        wins: input.wins || null,
        challenges: input.challenges || null,
        notes: input.notes || null,
        createdAt: new Date(),
      });

      return { success: true };
    }),

  getDailyLogs: protectedProcedure
    .input(
      z.object({
        profileId: z.number(),
        limit: z.number().optional().default(30),
      })
    )
    .query(async ({ input }) => {
      const logs = await db
        .select()
        .from(autismDailyLogs)
        .where(eq(autismDailyLogs.profileId, input.profileId))
        .orderBy(desc(autismDailyLogs.date))
        .limit(input.limit);

      return logs.map((log) => ({
        ...log,
        sleepHours: log.sleepHours ? log.sleepHours / 10 : null,
      }));
    }),
});
