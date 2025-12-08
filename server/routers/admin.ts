/**
 * Admin Router
 * Comprehensive admin dashboard endpoints for monitoring and management
 */

import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db-standalone";
import { sql } from "drizzle-orm";
import { z } from "zod";

// TODO: Add admin role check middleware
// For now, using protectedProcedure (requires authentication)

export const adminRouter = router({
  // ============================================================================
  // DASHBOARD OVERVIEW
  // ============================================================================
  
  getDashboardMetrics: protectedProcedure
    .query(async () => {
      // Get key metrics for dashboard overview
      
      // Active sessions (last 30 minutes)
      const activeSessionsResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM anonymous_sessions
        WHERE last_active_at > NOW() - INTERVAL '30 minutes'
      `);
      
      // Total users
      const totalUsersResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM users
      `);
      
      // Crisis alerts (last 24h) - TODO: implement crisis_alerts table
      const crisisAlertsResult = { rows: [{ count: 0 }] };
      
      // AI responses (last 24h)
      const aiResponsesResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM anonymous_sessions
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);
      
      return {
        activeSessions: Number(activeSessionsResult.rows[0]?.count || 0),
        totalUsers: Number(totalUsersResult.rows[0]?.count || 0),
        crisisAlerts: Number(crisisAlertsResult.rows[0]?.count || 0),
        aiResponses: Number(aiResponsesResult.rows[0]?.count || 0),
      };
    }),
  
  getRecentActivity: protectedProcedure
    .query(async () => {
      // Get recent sessions
      const recentSessions = await db.execute(sql`
        SELECT 
          id, session_token, created_at, last_active_at,
          message_count, engagement_score
        FROM anonymous_sessions
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      return {
        recentSessions: recentSessions.rows,
      };
    }),
  
  // ============================================================================
  // LIVE SESSIONS
  // ============================================================================
  
  getActiveSessions: protectedProcedure
    .input(z.object({
      status: z.enum(["all", "active", "idle", "ended"]).optional(),
      riskLevel: z.enum(["all", "low", "medium", "high", "critical"]).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.pageSize;
      
      let whereClause = "";
      
      if (input.status && input.status !== "all") {
        if (input.status === "active") {
          whereClause += " AND last_active_at > NOW() - INTERVAL '5 minutes'";
        } else if (input.status === "idle") {
          whereClause += " AND last_active_at BETWEEN NOW() - INTERVAL '30 minutes' AND NOW() - INTERVAL '5 minutes'";
        } else if (input.status === "ended") {
          whereClause += " AND last_active_at < NOW() - INTERVAL '30 minutes'";
        }
      }
      
      const sessions = await db.execute(sql`
        SELECT 
          id, session_token, created_at, last_active_at, expires_at,
          ip_address, user_agent, referrer,
          message_count, engagement_score, value_delivered,
          converted_to_user_id, converted_at
        FROM anonymous_sessions
        WHERE 1=1 ${sql.raw(whereClause)}
        ORDER BY last_active_at DESC
        LIMIT ${input.pageSize}
        OFFSET ${offset}
      `);
      
      const totalResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM anonymous_sessions
        WHERE 1=1 ${sql.raw(whereClause)}
      `);
      
      return {
        sessions: sessions.rows,
        total: Number(totalResult.rows[0]?.count || 0),
        page: input.page,
        pageSize: input.pageSize,
      };
    }),
  
  // ============================================================================
  // SESSION DETAIL
  // ============================================================================
  
  getSessionDetail: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(async ({ input }) => {
      const session = await db.execute(sql`
        SELECT *
        FROM anonymous_sessions
        WHERE id = ${input.sessionId}
      `);
      
      if (!session.rows[0]) {
        throw new Error("Session not found");
      }
      
      return {
        session: session.rows[0],
      };
    }),
  
  endSession: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.execute(sql`
        UPDATE anonymous_sessions
        SET last_active_at = NOW() - INTERVAL '1 hour'
        WHERE id = ${input.sessionId}
      `);
      
      return { success: true };
    }),
  
  // ============================================================================
  // AI RESPONSES
  // ============================================================================
  
  getAIResponses: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(50),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.pageSize;
      
      // Get sessions with conversation data
      const responses = await db.execute(sql`
        SELECT 
          id, session_token, created_at, last_active_at,
          conversation_data, message_count, engagement_score
        FROM anonymous_sessions
        WHERE message_count > 0
        ORDER BY last_active_at DESC
        LIMIT ${input.pageSize}
        OFFSET ${offset}
      `);
      
      return {
        responses: responses.rows,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),
  
  // ============================================================================
  // USERS
  // ============================================================================
  
  getUsers: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(50),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.pageSize;
      
      let whereClause = "";
      if (input.search) {
        whereClause = ` AND (name ILIKE '%${input.search}%' OR email ILIKE '%${input.search}%')`;
      }
      
      const users = await db.execute(sql`
        SELECT 
          id, name, email, created_at, updated_at
        FROM users
        WHERE 1=1 ${sql.raw(whereClause)}
        ORDER BY created_at DESC
        LIMIT ${input.pageSize}
        OFFSET ${offset}
      `);
      
      const totalResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM users
        WHERE 1=1 ${sql.raw(whereClause)}
      `);
      
      return {
        users: users.rows,
        total: Number(totalResult.rows[0]?.count || 0),
        page: input.page,
        pageSize: input.pageSize,
      };
    }),
  
  getUserDetail: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ input }) => {
      const user = await db.execute(sql`
        SELECT *
        FROM users
        WHERE id = ${input.userId}
      `);
      
      if (!user.rows[0]) {
        throw new Error("User not found");
      }
      
      // Get user's sessions
      const sessions = await db.execute(sql`
        SELECT id, session_token, created_at, last_active_at, message_count
        FROM anonymous_sessions
        WHERE converted_to_user_id = ${input.userId}
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      return {
        user: user.rows[0],
        sessions: sessions.rows,
      };
    }),
  
  // ============================================================================
  // ANALYTICS
  // ============================================================================
  
  getSessionsOverTime: protectedProcedure
    .input(z.object({
      days: z.number().default(7),
    }))
    .query(async ({ input }) => {
      const data = await db.execute(sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM anonymous_sessions
        WHERE created_at > NOW() - INTERVAL '${sql.raw(input.days.toString())} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
      
      return {
        data: data.rows,
      };
    }),
  
  getUserGrowth: protectedProcedure
    .input(z.object({
      days: z.number().default(30),
    }))
    .query(async ({ input }) => {
      const data = await db.execute(sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at > NOW() - INTERVAL '${sql.raw(input.days.toString())} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
      
      return {
        data: data.rows,
      };
    }),
});
