/**
 * Database helpers for scheduling system
 */

import { and, eq, gte, lte, or, desc, asc } from "drizzle-orm";
import { getDb } from "../db";
import {
  sessions,
  coachAvailability,
  availabilityExceptions,
  sessionReminders,
  coaches,
  clients,
  InsertSession,
  InsertCoachAvailability,
  InsertAvailabilityException,
  InsertSessionReminder,
} from "../../drizzle/schema-postgresql";

/**
 * Get coach availability for a specific day of week
 */
export async function getCoachAvailability(coachId: number, dayOfWeek?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(coachAvailability.coachId, coachId), eq(coachAvailability.isActive, "true")];
  
  if (dayOfWeek !== undefined) {
    conditions.push(eq(coachAvailability.dayOfWeek, dayOfWeek));
  }

  return await db
    .select()
    .from(coachAvailability)
    .where(and(...conditions))
    .orderBy(asc(coachAvailability.dayOfWeek), asc(coachAvailability.startTime));
}

/**
 * Create or update coach availability
 */
export async function upsertCoachAvailability(availability: InsertCoachAvailability) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(coachAvailability).values(availability);
}

/**
 * Delete coach availability slot
 */
export async function deleteCoachAvailability(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(coachAvailability).where(eq(coachAvailability.id, id));
}

/**
 * Get availability exceptions for a coach in a date range
 */
export async function getAvailabilityExceptions(
  coachId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(availabilityExceptions)
    .where(
      and(
        eq(availabilityExceptions.coachId, coachId),
        or(
          // Exception overlaps with requested range
          and(
            lte(availabilityExceptions.startDate, endDate),
            gte(availabilityExceptions.endDate, startDate)
          )
        )
      )
    );
}

/**
 * Create availability exception (time off)
 */
export async function createAvailabilityException(exception: InsertAvailabilityException) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(availabilityExceptions).values(exception);
}

/**
 * Delete availability exception
 */
export async function deleteAvailabilityException(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(availabilityExceptions).where(eq(availabilityExceptions.id, id));
}

/**
 * Get sessions for a coach in a date range
 */
export async function getCoachSessions(
  coachId: number,
  startDate: Date,
  endDate: Date,
  status?: string[]
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(sessions.coachId, coachId),
    gte(sessions.scheduledDate, startDate),
    lte(sessions.scheduledDate, endDate),
  ];

  if (status && status.length > 0) {
    // Filter by status if provided
    const statusConditions = status.map(s => eq(sessions.status, s as any));
    conditions.push(or(...statusConditions) as any);
  }

  return await db
    .select({
      session: sessions,
      client: clients,
    })
    .from(sessions)
    .leftJoin(clients, eq(sessions.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(asc(sessions.scheduledDate));
}

/**
 * Get sessions for a client
 */
export async function getClientSessions(clientId: number, status?: string[]) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(sessions.clientId, clientId)];

  if (status && status.length > 0) {
    const statusConditions = status.map(s => eq(sessions.status, s as any));
    conditions.push(or(...statusConditions) as any);
  }

  return await db
    .select({
      session: sessions,
      coach: coaches,
    })
    .from(sessions)
    .leftJoin(coaches, eq(sessions.coachId, coaches.id))
    .where(and(...conditions))
    .orderBy(desc(sessions.scheduledDate));
}

/**
 * Get upcoming sessions for a client
 */
export async function getUpcomingClientSessions(clientId: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();

  return await db
    .select({
      session: sessions,
      coach: coaches,
    })
    .from(sessions)
    .leftJoin(coaches, eq(sessions.coachId, coaches.id))
    .where(
      and(
        eq(sessions.clientId, clientId),
        gte(sessions.scheduledDate, now),
        eq(sessions.status, "scheduled")
      )
    )
    .orderBy(asc(sessions.scheduledDate));
}

/**
 * Create a new session
 */
export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sessions).values(session);
  return result;
}

/**
 * Update session
 */
export async function updateSession(
  id: number,
  updates: Partial<InsertSession>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(sessions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(sessions.id, id));
}

/**
 * Get session by ID with coach and client details
 */
export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      session: sessions,
      coach: coaches,
      client: clients,
    })
    .from(sessions)
    .leftJoin(coaches, eq(sessions.coachId, coaches.id))
    .leftJoin(clients, eq(sessions.clientId, clients.id))
    .where(eq(sessions.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Cancel a session
 */
export async function cancelSession(id: number, cancelledBy: "coach" | "client") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(sessions)
    .set({
      status: "cancelled",
      notes: `Cancelled by ${cancelledBy}`,
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, id));
}

/**
 * Check if a time slot is available
 */
export async function isTimeSlotAvailable(
  coachId: number,
  scheduledDate: Date,
  duration: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const endTime = new Date(scheduledDate.getTime() + duration * 60000);

  // Check for overlapping sessions
  const overlappingSessions = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.coachId, coachId),
        eq(sessions.status, "scheduled"),
        // Session overlaps with requested time
        lte(sessions.scheduledDate, endTime),
        gte(sessions.scheduledDate, scheduledDate)
      )
    );

  return overlappingSessions.length === 0;
}

/**
 * Record that a reminder was sent
 */
export async function recordReminderSent(reminder: InsertSessionReminder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(sessionReminders).values(reminder);
}

/**
 * Check if reminder was already sent
 */
export async function wasReminderSent(
  sessionId: number,
  reminderType: "24_hour" | "1_hour"
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(sessionReminders)
    .where(
      and(
        eq(sessionReminders.sessionId, sessionId),
        eq(sessionReminders.reminderType, reminderType)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Get sessions that need reminders
 */
export async function getSessionsNeedingReminders(
  reminderType: "24_hour" | "1_hour"
) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const hoursAhead = reminderType === "24_hour" ? 24 : 1;
  const reminderWindow = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

  // Get sessions scheduled within the reminder window that haven't been reminded yet
  const upcomingSessions = await db
    .select({
      session: sessions,
      coach: coaches,
      client: clients,
    })
    .from(sessions)
    .leftJoin(coaches, eq(sessions.coachId, coaches.id))
    .leftJoin(clients, eq(sessions.clientId, clients.id))
    .where(
      and(
        eq(sessions.status, "scheduled"),
        gte(sessions.scheduledDate, now),
        lte(sessions.scheduledDate, reminderWindow)
      )
    );

  // Filter out sessions that already have this reminder sent
  const sessionsNeedingReminder = [];
  for (const item of upcomingSessions) {
    if (item.session) {
      const alreadySent = await wasReminderSent(item.session.id, reminderType);
      if (!alreadySent) {
        sessionsNeedingReminder.push(item);
      }
    }
  }

  return sessionsNeedingReminder;
}
