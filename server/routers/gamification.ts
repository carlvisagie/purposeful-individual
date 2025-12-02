import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * GAMIFICATION SYSTEM ROUTER
 * 
 * Motivation through game mechanics:
 * - Points for completing actions
 * - Badges for achievements
 * - Streaks for consistency
 * - Leaderboard for competition
 */

// Achievement definitions
const ACHIEVEMENTS = {
  // Health
  FIRST_HEALTH_LOG: { title: "Health Tracker", description: "Logged first health data", points: 10 },
  WEEK_HEALTH_STREAK: { title: "Healthy Week", description: "7-day health logging streak", points: 50 },
  MONTH_HEALTH_STREAK: { title: "Healthy Month", description: "30-day health logging streak", points: 200 },
  
  // Stress
  FIRST_STRESS_SESSION: { title: "Stress Warrior", description: "Completed first stress relief session", points: 10 },
  TEN_STRESS_SESSIONS: { title: "Calm Master", description: "Completed 10 stress relief sessions", points: 50 },
  
  // Daily OS
  FIRST_MORNING_ROUTINE: { title: "Early Bird", description: "Completed first morning routine", points: 10 },
  WEEK_MORNING_STREAK: { title: "Morning Champion", description: "7-day morning routine streak", points: 50 },
  FIRST_EVENING_REVIEW: { title: "Reflective Mind", description: "Completed first evening review", points: 10 },
  
  // Identity
  FIRST_IDENTITY_SNAPSHOT: { title: "Self-Aware", description: "Created first identity snapshot", points: 20 },
  FIVE_IDENTITY_SNAPSHOTS: { title: "Identity Architect", description: "Created 5 identity snapshots", points: 100 },
  
  // Milestones
  FIRST_MILESTONE: { title: "Goal Setter", description: "Created first milestone", points: 10 },
  FIRST_MILESTONE_COMPLETE: { title: "Achiever", description: "Completed first milestone", points: 50 },
  FIVE_MILESTONES_COMPLETE: { title: "High Performer", description: "Completed 5 milestones", points: 250 },
  
  // Vision
  VISION_SET: { title: "Visionary", description: "Defined life vision and mission", points: 30 },
  
  // AI Coach
  FIRST_AI_CHAT: { title: "Curious Mind", description: "First conversation with AI coach", points: 10 },
  TEN_AI_CHATS: { title: "Wisdom Seeker", description: "10 conversations with AI coach", points: 50 },
};

export const gamificationRouter = router({
  awardAchievement: protectedProcedure
    .input(z.object({
      achievementType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const achievement = ACHIEVEMENTS[input.achievementType as keyof typeof ACHIEVEMENTS];
      
      if (!achievement) {
        throw new Error("Invalid achievement type");
      }

      // Check if already earned
      const existing = await db.execute(
        sql`SELECT id FROM achievements 
            WHERE userId = ${ctx.user.id} AND achievementType = ${input.achievementType}`
      );

      if (existing.rows.length > 0) {
        return { alreadyEarned: true };
      }

      // Award achievement
      await db.execute(
        sql`INSERT INTO achievements (userId, achievementType, title, description, points) 
            VALUES (${ctx.user.id}, ${input.achievementType}, ${achievement.title}, 
                    ${achievement.description}, ${achievement.points})`
      );

      return {
        alreadyEarned: false,
        achievement: {
          ...achievement,
          type: input.achievementType,
        },
      };
    }),

  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.execute(
      sql`SELECT * FROM achievements WHERE userId = ${ctx.user.id} ORDER BY earnedAt DESC`
    );

    return result.rows;
  }),

  getTotalPoints: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.execute(
      sql`SELECT SUM(points) as total FROM achievements WHERE userId = ${ctx.user.id}`
    );

    const total = result.rows[0] as any;
    return Number(total?.total || 0);
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const achievements = await db.execute(
      sql`SELECT COUNT(*) as count, SUM(points) as points FROM achievements WHERE userId = ${ctx.user.id}`
    );

    const stats = achievements.rows[0] as any;

    return {
      totalAchievements: Number(stats?.count || 0),
      totalPoints: Number(stats?.points || 0),
      availableAchievements: Object.keys(ACHIEVEMENTS).length,
    };
  }),

  getLeaderboard: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(10) }))
    .query(async ({ input }) => {
      const result = await db.execute(
        sql`SELECT u.id, u.name, SUM(a.points) as totalPoints, COUNT(a.id) as achievementCount
            FROM users u
            LEFT JOIN achievements a ON u.id = a.userId
            GROUP BY u.id, u.name
            ORDER BY totalPoints DESC
            LIMIT ${input.limit}`
      );

      return result.rows.map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.id,
        name: row.name,
        totalPoints: Number(row.totalPoints || 0),
        achievementCount: Number(row.achievementCount || 0),
      }));
    }),
});
