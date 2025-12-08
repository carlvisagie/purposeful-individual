/**
 * Research tRPC Router
 * 
 * Endpoints for Truth Seekers 2.0 research scraping system
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
// Research schema tables - need to be added to main schema
// import { researchPapers, researchScrapingJobs, moduleResearchUpdates, userResearchNotifications } from "../../drizzle/researchSchema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { 
  searchPubMed, 
  fetchPubMedArticles, 
  savePubMedArticles,
  runPubMedScrapingJob,
  createDefaultScrapingJobs 
} from "../services/pubmedScraper";
import { analyzeResearchPaper, analyzeAllUnanalyzedPapers } from "../services/researchAnalyzer";

export const researchRouter = router({
  /**
   * Get latest research papers
   */
  getLatestResearch: publicProcedure
    .input(
      z.object({
        module: z.string().optional(),
        evidenceLevel: z.enum(["A", "B", "C"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const { module, evidenceLevel, limit, offset } = input;

      const papers = await db.query.researchPapers.findMany({
        where: (papers, { and, eq, arrayContains }) => {
          const conditions = [];
          
          if (module) {
            conditions.push(sql`${papers.relevantModules} @> ${JSON.stringify([module])}`);
          }
          
          if (evidenceLevel) {
            conditions.push(eq(papers.evidenceLevel, evidenceLevel));
          }

          return conditions.length > 0 ? and(...conditions) : undefined;
        },
        orderBy: (papers, { desc }) => [desc(papers.scrapedAt)],
        limit,
        offset,
      });

      return papers;
    }),

  /**
   * Get research paper by ID
   */
  getResearchPaper: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const paper = await db.query.researchPapers.findFirst({
        where: (papers, { eq }) => eq(papers.id, input.id),
      });

      return paper;
    }),

  /**
   * Get trending research (most relevant + highest quality)
   */
  getTrendingResearch: publicProcedure
    .input(
      z.object({
        daysBack: z.number().default(30),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const { daysBack, limit } = input;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      const papers = await db.query.researchPapers.findMany({
        where: (papers, { and, gte, isNotNull }) =>
          and(
            gte(papers.scrapedAt, cutoffDate),
            isNotNull(papers.evidenceLevel)
          ),
        orderBy: (papers, { desc }) => [
          desc(papers.studyQuality),
          desc(papers.practicalApplicability),
        ],
        limit,
      });

      return papers;
    }),

  /**
   * Get module-specific research updates
   */
  getModuleUpdates: publicProcedure
    .input(z.object({ module: z.string() }))
    .query(async ({ input }) => {
      const updates = await db.query.moduleResearchUpdates.findMany({
        where: (updates, { eq }) => eq(updates.moduleName, input.module),
        orderBy: (updates, { desc }) => [desc(updates.createdAt)],
        limit: 20,
        with: {
          researchPaper: true,
        },
      });

      return updates;
    }),

  /**
   * Get user research notifications
   */
  getUserNotifications: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { unreadOnly, limit } = input;
      const userId = ctx.user.id;

      const notifications = await db.query.userResearchNotifications.findMany({
        where: (notifs, { and, eq }) => {
          const conditions = [eq(notifs.userId, userId)];
          
          if (unreadOnly) {
            conditions.push(eq(notifs.isRead, false));
          }

          return and(...conditions);
        },
        orderBy: (notifs, { desc }) => [desc(notifs.createdAt)],
        limit,
      });

      return notifications;
    }),

  /**
   * Mark notification as read
   */
  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(userResearchNotifications)
        .set({ isRead: true, readAt: new Date() })
        .where(
          and(
            eq(userResearchNotifications.id, input.notificationId),
            eq(userResearchNotifications.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Search research papers
   */
  searchResearch: publicProcedure
    .input(
      z.object({
        query: z.string(),
        evidenceLevel: z.enum(["A", "B", "C"]).optional(),
        module: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const { query, evidenceLevel, module, limit } = input;

      // Simple text search on title and abstract
      const papers = await db.query.researchPapers.findMany({
        where: (papers, { and, eq, or, ilike }) => {
          const conditions = [
            or(
              ilike(papers.title, `%${query}%`),
              ilike(papers.abstract, `%${query}%`)
            ),
          ];

          if (evidenceLevel) {
            conditions.push(eq(papers.evidenceLevel, evidenceLevel));
          }

          if (module) {
            conditions.push(sql`${papers.relevantModules} @> ${JSON.stringify([module])}`);
          }

          return and(...conditions);
        },
        orderBy: (papers, { desc }) => [desc(papers.scrapedAt)],
        limit,
      });

      return papers;
    }),

  /**
   * Get research statistics
   */
  getResearchStats: publicProcedure.query(async () => {
    const totalPapers = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchPapers);

    const levelACounts = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchPapers)
      .where(eq(researchPapers.evidenceLevel, "A"));

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentPapers = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchPapers)
      .where(gte(researchPapers.scrapedAt, last30Days));

    const pendingUpdates = await db
      .select({ count: sql<number>`count(*)` })
      .from(moduleResearchUpdates)
      .where(eq(moduleResearchUpdates.isApplied, false));

    return {
      totalPapers: totalPapers[0]?.count || 0,
      levelAPapers: levelACounts[0]?.count || 0,
      recentPapers: recentPapers[0]?.count || 0,
      pendingUpdates: pendingUpdates[0]?.count || 0,
    };
  }),

  /**
   * ADMIN: Manually trigger PubMed scraping
   */
  triggerPubMedScraping: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        modules: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const { query, modules } = input;

      // Search PubMed
      const pmids = await searchPubMed(query, 20, 30);

      // Fetch articles
      const articles = await fetchPubMedArticles(pmids);

      // Save to database
      const savedCount = await savePubMedArticles(articles, modules);

      return {
        success: true,
        papersFound: pmids.length,
        papersSaved: savedCount,
      };
    }),

  /**
   * ADMIN: Analyze unanalyzed papers
   */
  analyzeUnanalyzedPapers: protectedProcedure.mutation(async () => {
    const analyzedCount = await analyzeAllUnanalyzedPapers();

    return {
      success: true,
      analyzedCount,
    };
  }),

  /**
   * ADMIN: Create default scraping jobs
   */
  createDefaultJobs: protectedProcedure.mutation(async () => {
    await createDefaultScrapingJobs();

    return { success: true };
  }),

  /**
   * ADMIN: Get all scraping jobs
   */
  getScrapingJobs: protectedProcedure.query(async () => {
    const jobs = await db.query.researchScrapingJobs.findMany({
      orderBy: (jobs, { desc }) => [desc(jobs.lastRunAt)],
    });

    return jobs;
  }),

  /**
   * ADMIN: Run scraping job
   */
  runScrapingJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      await runPubMedScrapingJob(input.jobId);

      return { success: true };
    }),

  /**
   * ADMIN: Approve module update
   */
  approveModuleUpdate: protectedProcedure
    .input(z.object({ updateId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(moduleResearchUpdates)
        .set({
          isApplied: true,
          appliedBy: ctx.user.id,
          appliedAt: new Date(),
        })
        .where(eq(moduleResearchUpdates.id, input.updateId));

      return { success: true };
    }),
});
