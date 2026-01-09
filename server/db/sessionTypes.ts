/**
 * Database helpers for session types management
 */

import { eq, and, asc } from "drizzle-orm";
import { getDb } from "../db";
import {
  sessionTypes,
  InsertSessionType,
} from "../../drizzle/schema-postgresql";

/**
 * Get all session types for a coach
 */
export async function getCoachSessionTypes(coachId: number, activeOnly = false) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(sessionTypes.coachId, coachId)];
  
  if (activeOnly) {
    conditions.push(eq(sessionTypes.isActive, "true"));
  }

  return await db
    .select()
    .from(sessionTypes)
    .where(and(...conditions))
    .orderBy(asc(sessionTypes.displayOrder), asc(sessionTypes.name));
}

/**
 * Get session type by ID
 */
export async function getSessionTypeById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(sessionTypes)
    .where(eq(sessionTypes.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Create a new session type
 */
export async function createSessionType(sessionType: InsertSessionType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sessionTypes).values(sessionType);
  return result;
}

/**
 * Update session type
 */
export async function updateSessionType(
  id: number,
  updates: Partial<InsertSessionType>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(sessionTypes)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(sessionTypes.id, id));
}

/**
 * Delete session type
 */
export async function deleteSessionType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(sessionTypes).where(eq(sessionTypes.id, id));
}

/**
 * Toggle session type active status
 */
export async function toggleSessionTypeStatus(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(sessionTypes)
    .set({
      isActive: isActive ? "true" : "false",
      updatedAt: new Date(),
    })
    .where(eq(sessionTypes.id, id));
}
