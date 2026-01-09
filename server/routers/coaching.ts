import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { 
  coaches, 
  clients, 
  journalEntries, 
  emotionLogs, 
  copingStrategies, 
  aiInsights,
  sessions 
} from "../../drizzle/schema-postgresql";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Coaching platform API routers
 * Production-ready with comprehensive error handling and validation
 */

// ============================================================================
// COACHES ROUTER
// ============================================================================

export const coachesRouter = router({
  // Get current coach profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const coach = await db.query.coaches.findFirst({
      where: eq(coaches.userId, ctx.user.id),
    });
    return coach;
  }),

  // Create coach profile
  createProfile: protectedProcedure
    .input(z.object({
      specialization: z.string().optional(),
      bio: z.string().optional(),
      certifications: z.string().optional(),
      yearsExperience: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [coach] = await db.insert(coaches).values({
        userId: ctx.user.id,
        ...input,
      });
      return coach;
    }),

  // Update coach profile
  updateProfile: protectedProcedure
    .input(z.object({
      specialization: z.string().optional(),
      bio: z.string().optional(),
      certifications: z.string().optional(),
      yearsExperience: z.number().optional(),
      isActive: z.enum(["true", "false"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      await db.update(coaches)
        .set(input)
        .where(eq(coaches.id, coach.id));

      return { success: true };
    }),
});

// ============================================================================
// CLIENTS ROUTER
// ============================================================================

export const clientsRouter = router({
  // List all clients for current coach
  list: protectedProcedure.query(async ({ ctx }) => {
    const coach = await db.query.coaches.findFirst({
      where: eq(coaches.userId, ctx.user.id),
    });

    if (!coach) {
      throw new Error("Coach profile not found. Please create a coach profile first.");
    }

    const clientsList = await db.query.clients.findMany({
      where: eq(clients.coachId, coach.id),
      orderBy: [desc(clients.createdAt)],
    });

    return clientsList;
  }),

  // Get single client details
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.id),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found or access denied");
      }

      return client;
    }),

  // Create new client
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      dateOfBirth: z.date().optional(),
      goals: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found. Please create a coach profile first.");
      }

      const [client] = await db.insert(clients).values({
        coachId: coach.id,
        ...input,
      });

      return client;
    }),

  // Update client
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      dateOfBirth: z.date().optional(),
      goals: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["active", "inactive", "completed"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      const { id, ...updateData } = input;

      await db.update(clients)
        .set(updateData)
        .where(and(
          eq(clients.id, id),
          eq(clients.coachId, coach.id)
        ));

      return { success: true };
    }),

  // Delete client
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      await db.delete(clients)
        .where(and(
          eq(clients.id, input.id),
          eq(clients.coachId, coach.id)
        ));

      return { success: true };
    }),

  // Get client statistics
  getStats: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.id),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found");
      }

      // Get journal entry count
      const journalCount = await db.select({ count: sql<number>`count(*)` })
        .from(journalEntries)
        .where(eq(journalEntries.clientId, input.id));

      // Get emotion log count
      const emotionCount = await db.select({ count: sql<number>`count(*)` })
        .from(emotionLogs)
        .where(eq(emotionLogs.clientId, input.id));

      // Get average resilience score
      const avgResilience = await db.select({ 
        avg: sql<number>`AVG(${journalEntries.resilienceScore})` 
      })
        .from(journalEntries)
        .where(eq(journalEntries.clientId, input.id));

      return {
        journalEntries: journalCount[0]?.count || 0,
        emotionLogs: emotionCount[0]?.count || 0,
        averageResilienceScore: avgResilience[0]?.avg || 0,
      };
    }),
});

// ============================================================================
// JOURNAL ENTRIES ROUTER
// ============================================================================

export const journalRouter = router({
  // List journal entries for a client
  list: protectedProcedure
    .input(z.object({ 
      clientId: z.number(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      // Verify coach owns this client
      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found or access denied");
      }

      const entries = await db.query.journalEntries.findMany({
        where: eq(journalEntries.clientId, input.clientId),
        orderBy: [desc(journalEntries.entryDate)],
        limit: input.limit,
      });

      return entries;
    }),

  // Get single journal entry
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const entry = await db.query.journalEntries.findFirst({
        where: eq(journalEntries.id, input.id),
      });

      if (!entry) {
        throw new Error("Journal entry not found");
      }

      // Verify coach owns this client
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, entry.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Access denied");
      }

      return entry;
    }),

  // Create journal entry
  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      content: z.string().min(1, "Content is required"),
      mood: z.string().optional(),
      moodIntensity: z.number().min(1).max(10).optional(),
      emotions: z.string().optional(), // JSON string
      triggers: z.string().optional(),
      copingStrategies: z.string().optional(),
      copingEffectiveness: z.number().min(1).max(10).optional(),
      resilienceScore: z.number().min(1).max(100).optional(),
      isPrivate: z.enum(["true", "false"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      // Verify coach owns this client
      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found or access denied");
      }

      const [entry] = await db.insert(journalEntries).values(input);

      return entry;
    }),

  // Update journal entry
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      content: z.string().optional(),
      mood: z.string().optional(),
      moodIntensity: z.number().min(1).max(10).optional(),
      emotions: z.string().optional(),
      triggers: z.string().optional(),
      copingStrategies: z.string().optional(),
      copingEffectiveness: z.number().min(1).max(10).optional(),
      resilienceScore: z.number().min(1).max(100).optional(),
      isPrivate: z.enum(["true", "false"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const entry = await db.query.journalEntries.findFirst({
        where: eq(journalEntries.id, id),
      });

      if (!entry) {
        throw new Error("Journal entry not found");
      }

      // Verify coach owns this client
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, entry.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Access denied");
      }

      await db.update(journalEntries)
        .set(updateData)
        .where(eq(journalEntries.id, id));

      return { success: true };
    }),

  // Delete journal entry
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await db.query.journalEntries.findFirst({
        where: eq(journalEntries.id, input.id),
      });

      if (!entry) {
        throw new Error("Journal entry not found");
      }

      // Verify coach owns this client
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, entry.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Access denied");
      }

      await db.delete(journalEntries)
        .where(eq(journalEntries.id, input.id));

      return { success: true };
    }),
});

// ============================================================================
// EMOTION LOGS ROUTER
// ============================================================================

export const emotionLogsRouter = router({
  // List emotion logs for a client
  list: protectedProcedure
    .input(z.object({ 
      clientId: z.number(),
      limit: z.number().optional().default(100),
    }))
    .query(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      // Verify coach owns this client
      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found or access denied");
      }

      const logs = await db.query.emotionLogs.findMany({
        where: eq(emotionLogs.clientId, input.clientId),
        orderBy: [desc(emotionLogs.logDate)],
        limit: input.limit,
      });

      return logs;
    }),

  // Create emotion log
  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      journalEntryId: z.number().optional(),
      emotionType: z.string().min(1, "Emotion type is required"),
      intensity: z.number().min(1).max(10),
      trigger: z.string().optional(),
      physicalSensations: z.string().optional(),
      thoughts: z.string().optional(),
      behaviors: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      // Verify coach owns this client
      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found or access denied");
      }

      const [log] = await db.insert(emotionLogs).values(input);

      return log;
    }),

  // Get emotion trends for a client
  getTrends: protectedProcedure
    .input(z.object({ 
      clientId: z.number(),
      days: z.number().optional().default(30),
    }))
    .query(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      // Verify coach owns this client
      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found or access denied");
      }

      // Get emotion logs from the last N days
      const logs = await db.query.emotionLogs.findMany({
        where: and(
          eq(emotionLogs.clientId, input.clientId),
          sql`${emotionLogs.logDate} >= DATE_SUB(NOW(), INTERVAL ${input.days} DAY)`
        ),
        orderBy: [desc(emotionLogs.logDate)],
      });

      // Group by emotion type and calculate averages
      const emotionMap = new Map<string, { count: number; totalIntensity: number }>();
      
      logs.forEach((log: typeof emotionLogs.$inferSelect) => {
        const current = emotionMap.get(log.emotionType) || { count: 0, totalIntensity: 0 };
        emotionMap.set(log.emotionType, {
          count: current.count + 1,
          totalIntensity: current.totalIntensity + log.intensity,
        });
      });

      const trends = Array.from(emotionMap.entries()).map(([emotionType, data]) => ({
        emotionType,
        count: data.count,
        averageIntensity: data.totalIntensity / data.count,
      }));

      return trends;
    }),
});

// ============================================================================
// COPING STRATEGIES ROUTER
// ============================================================================

export const copingStrategiesRouter = router({
  // List coping strategies for a client
  list: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      // Verify coach owns this client
      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found or access denied");
      }

      const strategies = await db.query.copingStrategies.findMany({
        where: eq(copingStrategies.clientId, input.clientId),
        orderBy: [desc(copingStrategies.averageEffectiveness)],
      });

      return strategies;
    }),

  // Create coping strategy
  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      strategyName: z.string().min(1, "Strategy name is required"),
      description: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      // Verify coach owns this client
      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found or access denied");
      }

      const [strategy] = await db.insert(copingStrategies).values(input);

      return strategy;
    }),

  // Update coping strategy effectiveness
  updateEffectiveness: protectedProcedure
    .input(z.object({
      id: z.number(),
      effectiveness: z.number().min(1).max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const strategy = await db.query.copingStrategies.findFirst({
        where: eq(copingStrategies.id, input.id),
      });

      if (!strategy) {
        throw new Error("Coping strategy not found");
      }

      // Verify coach owns this client
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, strategy.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Access denied");
      }

      // Calculate new average
      const newTimesUsed = strategy.timesUsed + 1;
      const currentTotal = (strategy.averageEffectiveness || 0) * strategy.timesUsed;
      const newAverage = (currentTotal + input.effectiveness) / newTimesUsed;

      await db.update(copingStrategies)
        .set({
          timesUsed: newTimesUsed,
          averageEffectiveness: Math.round(newAverage),
          lastUsed: new Date(),
        })
        .where(eq(copingStrategies.id, input.id));

      return { success: true };
    }),
});

// ============================================================================
// AI INSIGHTS ROUTER
// ============================================================================

export const aiInsightsRouter = router({
  // List AI insights for a client
  list: protectedProcedure
    .input(z.object({ 
      clientId: z.number(),
      limit: z.number().optional().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      // Verify coach owns this client
      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found or access denied");
      }

      const insights = await db.query.aiInsights.findMany({
        where: eq(aiInsights.clientId, input.clientId),
        orderBy: [desc(aiInsights.insightDate)],
        limit: input.limit,
      });

      return insights;
    }),

  // Mark insight as read
  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const insight = await db.query.aiInsights.findFirst({
        where: eq(aiInsights.id, input.id),
      });

      if (!insight) {
        throw new Error("Insight not found");
      }

      // Verify coach owns this client
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, insight.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Access denied");
      }

      await db.update(aiInsights)
        .set({ isRead: "true" })
        .where(eq(aiInsights.id, input.id));

      return { success: true };
    }),
});

// ============================================================================
// SESSIONS ROUTER
// ============================================================================

export const sessionsRouter = router({
  // List sessions for a client
  list: protectedProcedure
    .input(z.object({ 
      clientId: z.number(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      const sessionsList = await db.query.sessions.findMany({
        where: and(
          eq(sessions.clientId, input.clientId),
          eq(sessions.coachId, coach.id)
        ),
        orderBy: [desc(sessions.scheduledDate)],
        limit: input.limit,
      });

      return sessionsList;
    }),

  // Create session
  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      scheduledDate: z.date(),
      duration: z.number().min(15).max(480), // 15 min to 8 hours
      sessionType: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach) {
        throw new Error("Coach profile not found");
      }

      // Verify coach owns this client
      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.id, input.clientId),
          eq(clients.coachId, coach.id)
        ),
      });

      if (!client) {
        throw new Error("Client not found or access denied");
      }

      const [session] = await db.insert(sessions).values({
        coachId: coach.id,
        ...input,
      });

      return session;
    }),

  // Update session
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      scheduledDate: z.date().optional(),
      duration: z.number().min(15).max(480).optional(),
      sessionType: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, id),
      });

      if (!session) {
        throw new Error("Session not found");
      }

      const coach = await db.query.coaches.findFirst({
        where: eq(coaches.userId, ctx.user.id),
      });

      if (!coach || session.coachId !== coach.id) {
        throw new Error("Access denied");
      }

      await db.update(sessions)
        .set(updateData)
        .where(eq(sessions.id, id));

      return { success: true };
    }),
});
