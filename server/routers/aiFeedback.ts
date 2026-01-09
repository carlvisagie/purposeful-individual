import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { int, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * AI Feedback Router
 * Collects user feedback on AI coaching responses to enable continuous improvement
 */

// In-memory store for feedback (in production, this would be in the database)
const feedbackStore: Array<{
  id: string;
  userId: string;
  responseId: string;
  rating: number;
  comment?: string;
  timestamp: number;
  category: string;
}> = [];

// Analytics aggregation
const feedbackAnalytics = {
  totalResponses: 0,
  averageRating: 0,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  topComments: [] as string[],
  lastUpdated: Date.now(),
};

export const aiFeedbackRouter = router({
  /**
   * Submit feedback on an AI coaching response
   */
  submitFeedback: protectedProcedure
    .input(
      z.object({
        responseId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        category: z.enum([
          "accuracy",
          "helpfulness",
          "tone",
          "relevance",
          "clarity",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const feedback = {
        id: Math.random().toString(36).substr(2, 9),
        userId: ctx.user?.id?.toString() || "anonymous",
        responseId: input.responseId,
        rating: input.rating,
        comment: input.comment,
        timestamp: Date.now(),
        category: input.category,
      };

      feedbackStore.push(feedback);

      // Update analytics
      updateAnalytics();

      return {
        success: true,
        feedbackId: feedback.id,
      };
    }),

  /**
   * Get feedback analytics for improvement tracking
   */
  getAnalytics: publicProcedure.query(() => {
    return {
      totalResponses: feedbackAnalytics.totalResponses,
      averageRating: feedbackAnalytics.averageRating,
      ratingDistribution: feedbackAnalytics.ratingDistribution,
      improvementTrend: calculateTrend(),
      topIssues: identifyTopIssues(),
      lastUpdated: feedbackAnalytics.lastUpdated,
    };
  }),

  /**
   * Get feedback for a specific response
   */
  getResponseFeedback: publicProcedure
    .input(z.object({ responseId: z.string() }))
    .query(({ input }) => {
      const feedback = feedbackStore.filter(
        (f) => f.responseId === input.responseId
      );

      if (feedback.length === 0) {
        return null;
      }

      const ratings = feedback.map((f) => f.rating);
      const avgRating =
        ratings.reduce((a, b) => a + b, 0) / ratings.length;

      return {
        responseId: input.responseId,
        feedbackCount: feedback.length,
        averageRating: Math.round(avgRating * 10) / 10,
        comments: feedback
          .filter((f) => f.comment)
          .map((f) => ({ comment: f.comment, rating: f.rating })),
      };
    }),

  /**
   * Get improvement report (monthly)
   */
  getImprovementReport: publicProcedure.query(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const monthlyFeedback = feedbackStore.filter(
      (f) => f.timestamp >= thirtyDaysAgo
    );

    if (monthlyFeedback.length === 0) {
      return {
        period: "Last 30 days",
        feedbackCount: 0,
        averageRating: 0,
        improvements: [],
        recommendations: [],
      };
    }

    const ratings = monthlyFeedback.map((f) => f.rating);
    const avgRating =
      ratings.reduce((a, b) => a + b, 0) / ratings.length;

    // Identify categories with lowest ratings
    const categoryRatings = new Map<string, number[]>();
    monthlyFeedback.forEach((f) => {
      if (!categoryRatings.has(f.category)) {
        categoryRatings.set(f.category, []);
      }
      categoryRatings.get(f.category)!.push(f.rating);
    });

    const categoryAverages = Array.from(categoryRatings.entries()).map(
      ([category, ratings]) => ({
        category,
        average: Math.round((ratings.reduce((a, b) => a + b) / ratings.length) * 10) / 10,
        count: ratings.length,
      })
    );

    // Sort by lowest average first
    categoryAverages.sort((a, b) => a.average - b.average);

    return {
      period: "Last 30 days",
      feedbackCount: monthlyFeedback.length,
      averageRating: Math.round(avgRating * 10) / 10,
      categoryPerformance: categoryAverages,
      improvements: generateImprovements(categoryAverages),
      recommendations: generateRecommendations(categoryAverages),
    };
  }),

  /**
   * Get feedback summary for dashboard
   */
  getFeedbackSummary: publicProcedure.query(() => {
    if (feedbackStore.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        ratingTrend: "neutral",
        qualityScore: 0,
      };
    }

    const ratings = feedbackStore.map((f) => f.rating);
    const avgRating =
      ratings.reduce((a, b) => a + b, 0) / ratings.length;

    // Calculate trend (compare last 10 vs previous 10)
    const recent = feedbackStore.slice(-10);
    const previous = feedbackStore.slice(-20, -10);

    const recentAvg =
      recent.length > 0
        ? recent.reduce((a, b) => a + b.rating, 0) / recent.length
        : avgRating;

    const previousAvg =
      previous.length > 0
        ? previous.reduce((a, b) => a + b.rating, 0) / previous.length
        : avgRating;

    const trend =
      recentAvg > previousAvg + 0.2
        ? "improving"
        : recentAvg < previousAvg - 0.2
          ? "declining"
          : "stable";

    return {
      totalFeedback: feedbackStore.length,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingTrend: trend,
      qualityScore: Math.round(avgRating * 20), // 0-100 scale
    };
  }),
});

/**
 * Helper: Update analytics based on current feedback
 */
function updateAnalytics() {
  if (feedbackStore.length === 0) return;

  const ratings = feedbackStore.map((f) => f.rating);
  feedbackAnalytics.totalResponses = feedbackStore.length;
  feedbackAnalytics.averageRating =
    Math.round((ratings.reduce((a, b) => a + b) / ratings.length) * 10) / 10;

  // Reset distribution
  feedbackAnalytics.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r) => {
    feedbackAnalytics.ratingDistribution[r as 1 | 2 | 3 | 4 | 5]++;
  });

  feedbackAnalytics.lastUpdated = Date.now();
}

/**
 * Helper: Calculate rating trend
 */
function calculateTrend(): "improving" | "declining" | "stable" {
  if (feedbackStore.length < 20) return "stable";

  const recent = feedbackStore.slice(-10);
  const previous = feedbackStore.slice(-20, -10);

  const recentAvg =
    recent.reduce((a, b) => a + b.rating, 0) / recent.length;
  const previousAvg =
    previous.reduce((a, b) => a + b.rating, 0) / previous.length;

  if (recentAvg > previousAvg + 0.2) return "improving";
  if (recentAvg < previousAvg - 0.2) return "declining";
  return "stable";
}

/**
 * Helper: Identify top issues from feedback
 */
function identifyTopIssues(): string[] {
  const issues: Map<string, number> = new Map();

  feedbackStore
    .filter((f) => f.rating <= 2 && f.comment)
    .forEach((f) => {
      const issue = f.category;
      issues.set(issue, (issues.get(issue) || 0) + 1);
    });

  return Array.from(issues.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([issue]) => issue);
}

/**
 * Helper: Generate improvement suggestions
 */
function generateImprovements(
  categoryAverages: Array<{ category: string; average: number }>
): string[] {
  return categoryAverages
    .filter((c) => c.average < 3.5)
    .map((c) => `Improve ${c.category}: Currently averaging ${c.average}/5`);
}

/**
 * Helper: Generate recommendations
 */
function generateRecommendations(
  categoryAverages: Array<{ category: string; average: number }>
): string[] {
  const recommendations: string[] = [];

  categoryAverages.forEach(({ category, average }) => {
    if (average < 2.5) {
      recommendations.push(`Critical: ${category} needs urgent improvement`);
    } else if (average < 3.5) {
      recommendations.push(`Focus on improving ${category} responses`);
    }
  });

  if (recommendations.length === 0) {
    recommendations.push("Continue current approach - ratings are strong");
  }

  return recommendations;
}
