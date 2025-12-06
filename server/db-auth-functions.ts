/**
 * Database functions for standalone authentication
 * Add these to your existing db.ts file
 */

import { db } from "./db";
import { users, sessions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// User functions
export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserById(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function createUser(data: {
  email: string;
  name: string | null;
  passwordHash: string;
  passwordSalt: string;
  loginMethod: string;
  lastSignedIn: Date;
}) {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function updateUserLastSignedIn(userId: number) {
  await db.update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

// Session functions
export async function createSession(data: {
  userId: number;
  token: string;
  expiresAt: Date;
}) {
  const result = await db.insert(sessions).values(data).returning();
  return result[0];
}

export async function getSessionByToken(token: string) {
  const result = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  return result[0] || null;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

// Clean up expired sessions (run periodically)
export async function cleanupExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
