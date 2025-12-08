/**
 * Database functions for standalone authentication
 * Add these to your existing db.ts file
 */

import { db } from "./db";
import { users, authSessions } from "../drizzle/schema";
import { eq, lt } from "drizzle-orm";

// User functions
export async function getUserByEmail(email: string): Promise<typeof users.$inferSelect | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserById(id: number): Promise<typeof users.$inferSelect | null> {
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
}): Promise<typeof users.$inferSelect | null> {
  const result = await db.insert(users).values(data);
  // MySQL doesn't support .returning(), so we fetch the inserted user
  const insertedUser = await getUserByEmail(data.email);
  return insertedUser;
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
}): Promise<typeof authSessions.$inferSelect | null> {
  await db.insert(authSessions).values(data);
  // MySQL doesn't support .returning(), so we fetch the inserted session
  const insertedSession = await getSessionByToken(data.token);
  return insertedSession;
}

export async function getSessionByToken(token: string): Promise<typeof authSessions.$inferSelect | null> {
  const result = await db.select().from(authSessions).where(eq(authSessions.token, token)).limit(1);
  return result[0] || null;
}

export async function deleteSession(token: string) {
  await db.delete(authSessions).where(eq(authSessions.token, token));
}

// Clean up expired sessions (run periodically)
export async function cleanupExpiredSessions() {
  await db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()));
}
