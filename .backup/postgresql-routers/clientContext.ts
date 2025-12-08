/**
 * Client Context Router
 * Handles session history, important dates, alerts, and context display
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { sql } from "drizzle-orm";

// Types for context data
const SessionSummarySchema = z.object({
  summary: z.string(),
  keyTopics: z.array(z.string()),
  emotionalState: z.string().optional(),
  actionItems: z.array(z.string()),
});

const ImportantDateSchema = z.object({
  dateType: z.enum(["birthday", "anniversary", "diagnosis", "treatment_start", "therapy_day", "other"]),
  personName: z.string().optional(),
  dateValue: z.string(), // ISO date string
  recurring: z.boolean().default(true),
  importance: z.number().min(1).max(10).default(5),
  alertDaysBefore: z.number().default(1),
  notes: z.string().optional(),
  celebrationMessage: z.string().optional(),
});

const CriticalAlertSchema = z.object({
  alertType: z.enum(["follow_up", "birthday", "concern", "action_item", "celebration"]),
  priority: z.number().min(1).max(10).default(5),
  title: z.string(),
  message: z.string(),
  showFrom: z.string().optional(), // ISO date string
  showUntil: z.string().optional(), // ISO date string
});

const PersonalDetailSchema = z.object({
  category: z.enum(["family", "interest", "preference", "value", "trigger", "other"]),
  detailKey: z.string(),
  detailValue: z.string(),
  importance: z.number().min(1).max(10).default(5),
  context: z.string().optional(),
});

export const clientContextRouter = router({
  // Get complete context for a client (instant display)
  getClientContext: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input }) => {
      // Get cached context
      const result = await db.execute(sql`
        SELECT * FROM session_context_cache
        WHERE client_id = ${input.clientId}
      `);
      
      if (result.length === 0) {
        // Cache doesn't exist, create it
        await db.execute(sql`
          SELECT update_session_context_cache(${input.clientId})
        `);
        
        // Fetch again
        const newResult = await db.execute(sql`
          SELECT * FROM session_context_cache
          WHERE client_id = ${input.clientId}
        `);
        
        return newResult.rows[0] || null;
      }
      
      return result[0];
    }),

  // Search clients (for quick-select)
  searchClients: publicProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT 
          c.id,
          u.name,
          u.email,
          c.goals,
          (SELECT COUNT(*) FROM session_history WHERE client_id = c.id) as session_count,
          (SELECT MAX(session_date) FROM session_history WHERE client_id = c.id) as last_session
        FROM clients c
        JOIN users u ON c.user_id = u.id
        WHERE 
          u.name ILIKE ${`%${input.query}%`}
          OR u.email ILIKE ${`%${input.query}%`}
        ORDER BY last_session DESC NULLS LAST
        LIMIT ${input.limit}
      `);
      
      return result;
    }),

  // Get recent clients (for quick access)
  getRecentClients: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT 
          c.id,
          u.name,
          u.email,
          c.goals,
          (SELECT COUNT(*) FROM session_history WHERE client_id = c.id) as session_count,
          (SELECT MAX(session_date) FROM session_history WHERE client_id = c.id) as last_session
        FROM clients c
        JOIN users u ON c.user_id = u.id
        WHERE EXISTS (SELECT 1 FROM session_history WHERE client_id = c.id)
        ORDER BY (SELECT MAX(session_date) FROM session_history WHERE client_id = c.id) DESC
        LIMIT ${input.limit}
      `);
      
      return result;
    }),

  // Add session history
  addSessionHistory: publicProcedure
    .input(z.object({
      clientId: z.number(),
      coachId: z.number().optional(),
      sessionType: z.string().default("coaching"),
      durationMinutes: z.number().optional(),
      summary: z.string(),
      keyTopics: z.array(z.string()).default([]),
      emotionalState: z.string().optional(),
      energyLevel: z.number().min(1).max(10).optional(),
      actionItems: z.array(z.string()).default([]),
      homeworkAssigned: z.string().optional(),
      breakthroughs: z.string().optional(),
      concernsRaised: z.string().optional(),
      nextSessionFocus: z.string().optional(),
      sessionNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        INSERT INTO session_history (
          client_id, coach_id, session_type, duration_minutes,
          summary, key_topics, emotional_state, energy_level,
          action_items, homework_assigned, breakthroughs,
          concerns_raised, next_session_focus, session_notes
        ) VALUES (
          ${input.clientId}, ${input.coachId || null}, ${input.sessionType}, ${input.durationMinutes || null},
          ${input.summary}, ${JSON.stringify(input.keyTopics)}::jsonb, ${input.emotionalState || null}, ${input.energyLevel || null},
          ${JSON.stringify(input.actionItems)}::jsonb, ${input.homeworkAssigned || null}, ${input.breakthroughs || null},
          ${input.concernsRaised || null}, ${input.nextSessionFocus || null}, ${input.sessionNotes || null}
        )
        RETURNING *
      `);
      
      return result[0];
    }),

  // Get session history for a client
  getSessionHistory: publicProcedure
    .input(z.object({
      clientId: z.number(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT * FROM session_history
        WHERE client_id = ${input.clientId}
        ORDER BY session_date DESC
        LIMIT ${input.limit}
      `);
      
      return result;
    }),

  // Add important date
  addImportantDate: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }).merge(ImportantDateSchema))
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        INSERT INTO important_dates (
          client_id, date_type, person_name, date_value,
          recurring, importance, alert_days_before, notes, celebration_message
        ) VALUES (
          ${input.clientId}, ${input.dateType}, ${input.personName || null}, ${input.dateValue},
          ${input.recurring}, ${input.importance}, ${input.alertDaysBefore},
          ${input.notes || null}, ${input.celebrationMessage || null}
        )
        RETURNING *
      `);
      
      return result[0];
    }),

  // Get important dates for a client
  getImportantDates: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT * FROM important_dates
        WHERE client_id = ${input.clientId}
        ORDER BY date_value
      `);
      
      return result;
    }),

  // Get upcoming birthdays (all clients)
  getUpcomingBirthdays: publicProcedure
    .input(z.object({
      daysAhead: z.number().default(7),
    }))
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT * FROM get_upcoming_birthdays(${input.daysAhead})
      `);
      
      return result;
    }),

  // Add critical alert
  addCriticalAlert: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }).merge(CriticalAlertSchema))
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        INSERT INTO critical_alerts (
          client_id, alert_type, priority, title, message,
          show_from, show_until
        ) VALUES (
          ${input.clientId}, ${input.alertType}, ${input.priority},
          ${input.title}, ${input.message},
          ${input.showFrom || null}, ${input.showUntil || null}
        )
        RETURNING *
      `);
      
      return result[0];
    }),

  // Get active alerts for a client
  getActiveAlerts: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT * FROM critical_alerts
        WHERE client_id = ${input.clientId}
          AND status = 'active'
          AND (show_from IS NULL OR show_from <= CURRENT_DATE)
          AND (show_until IS NULL OR show_until >= CURRENT_DATE)
        ORDER BY priority DESC, created_at DESC
      `);
      
      return result;
    }),

  // Acknowledge alert
  acknowledgeAlert: publicProcedure
    .input(z.object({
      alertId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        UPDATE critical_alerts
        SET status = 'acknowledged', acknowledged_at = NOW()
        WHERE id = ${input.alertId}
        RETURNING *
      `);
      
      return result[0];
    }),

  // Resolve alert
  resolveAlert: publicProcedure
    .input(z.object({
      alertId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        UPDATE critical_alerts
        SET status = 'resolved', resolved_at = NOW()
        WHERE id = ${input.alertId}
        RETURNING *
      `);
      
      return result[0];
    }),

  // Add personal detail
  addPersonalDetail: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }).merge(PersonalDetailSchema))
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        INSERT INTO personal_details (
          client_id, category, detail_key, detail_value,
          importance, context
        ) VALUES (
          ${input.clientId}, ${input.category}, ${input.detailKey},
          ${input.detailValue}, ${input.importance}, ${input.context || null}
        )
        RETURNING *
      `);
      
      return result[0];
    }),

  // Get personal details for a client
  getPersonalDetails: publicProcedure
    .input(z.object({
      clientId: z.number(),
      category: z.string().optional(),
    }))
    .query(async ({ input }) => {
      if (input.category) {
        const result = await db.execute(sql`
          SELECT * FROM personal_details
          WHERE client_id = ${input.clientId}
            AND category = ${input.category}
          ORDER BY importance DESC, created_at DESC
        `);
        return result;
      } else {
        const result = await db.execute(sql`
          SELECT * FROM personal_details
          WHERE client_id = ${input.clientId}
          ORDER BY importance DESC, created_at DESC
        `);
        return result;
      }
    }),

  // Quick note (adds to session notes or creates alert)
  addQuickNote: publicProcedure
    .input(z.object({
      clientId: z.number(),
      note: z.string(),
      createAlert: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      if (input.createAlert) {
        // Create alert
        const result = await db.execute(sql`
          INSERT INTO critical_alerts (
            client_id, alert_type, priority, title, message
          ) VALUES (
            ${input.clientId}, 'follow_up', 5, 'Quick Note', ${input.note}
          )
          RETURNING *
        `);
        return { type: 'alert', data: result[0] };
      } else {
        // Add to most recent session notes
        const result = await db.execute(sql`
          UPDATE session_history
          SET session_notes = COALESCE(session_notes, '') || E'\n' || ${input.note},
              updated_at = NOW()
          WHERE client_id = ${input.clientId}
            AND id = (
              SELECT id FROM session_history
              WHERE client_id = ${input.clientId}
              ORDER BY session_date DESC
              LIMIT 1
            )
          RETURNING *
        `);
        return { type: 'note', data: result[0] };
      }
    }),

  // Refresh context cache
  refreshContextCache: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.execute(sql`
        SELECT update_session_context_cache(${input.clientId})
      `);
      
      const result = await db.execute(sql`
        SELECT * FROM session_context_cache
        WHERE client_id = ${input.clientId}
      `);
      
      return result[0];
    }),
});
