/**
 * Standalone Auth Database Functions (MySQL)
 * For session-based authentication without Manus OAuth
 */

import { db } from "./db";
import { users, authSessions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ============================================================================
// USER FUNCTIONS
// ============================================================================

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
}): Promise<typeof users.$inferSelect | null> {
  // MySQL insert doesn't return the inserted row
  await db.insert(users).values({
    email: data.email,
    name: data.name,
    passwordHash: data.passwordHash,
    passwordSalt: data.passwordSalt,
    loginMethod: data.loginMethod,
    openId: null, // No OAuth
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: data.lastSignedIn,
  });
  
  // Fetch the inserted user
  return getUserByEmail(data.email);
}

export async function updateUserLastSignedIn(userId: number) {
  await db.update(users)
    .set({ lastSignedIn: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ============================================================================
// SESSION FUNCTIONS
// ============================================================================

export async function createSession(data: {
  userId: number;
  token: string;
  expiresAt: Date;
}): Promise<typeof authSessions.$inferSelect | null> {
  // MySQL insert doesn't return the inserted row
  await db.insert(authSessions).values({
    userId: data.userId,
    token: data.token,
    expiresAt: data.expiresAt,
    createdAt: new Date(),
  });
  
  // Fetch the inserted session
  return getSessionByToken(data.token);
}

export async function getSessionByToken(token: string) {
  const result = await db.select().from(authSessions).where(eq(authSessions.token, token)).limit(1);
  return result[0] || null;
}

export async function deleteSession(token: string) {
  await db.delete(authSessions).where(eq(authSessions.token, token));
}
