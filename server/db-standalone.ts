/**
 * Standalone Database Functions (PostgreSQL)
 * NO Manus dependencies
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, lt } from "drizzle-orm";
import * as schema from "../drizzle/schema-postgresql";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// ============================================================================
// USER FUNCTIONS
// ============================================================================

export async function getUserByEmail(email: string) {
  const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserById(id: number) {
  const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
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
  const result = await db.insert(schema.users).values(data).returning();
  return result[0];
}

export async function updateUserLastSignedIn(userId: number) {
  await db.update(schema.users)
    .set({ lastSignedIn: new Date(), updatedAt: new Date() })
    .where(eq(schema.users.id, userId));
}

// ============================================================================
// AUTH SESSION FUNCTIONS
// ============================================================================

export async function createAuthSession(data: {
  userId: number;
  token: string;
  expiresAt: Date;
}) {
  const result = await db.insert(schema.authSessions).values(data).returning();
  return result[0];
}

export async function getAuthSessionByToken(token: string) {
  const result = await db.select().from(schema.authSessions).where(eq(schema.authSessions.token, token)).limit(1);
  return result[0] || null;
}

export async function deleteAuthSession(token: string) {
  await db.delete(schema.authSessions).where(eq(schema.authSessions.token, token));
}

export async function cleanupExpiredAuthSessions() {
  await db.delete(schema.authSessions).where(lt(schema.authSessions.expiresAt, new Date()));
}

// ============================================================================
// CLIENT FUNCTIONS
// ============================================================================

export async function getClientByUserId(userId: number) {
  const result = await db.select().from(schema.clients).where(eq(schema.clients.userId, userId)).limit(1);
  return result[0] || null;
}

export async function createClient(data: {
  userId: number;
  goals?: string;
  preferences?: string;
}) {
  const result = await db.insert(schema.clients).values(data).returning();
  return result[0];
}

// ============================================================================
// SUBSCRIPTION FUNCTIONS
// ============================================================================

export async function getActiveSubscriptionByClientId(clientId: number) {
  const result = await db.select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.clientId, clientId))
    .limit(1);
  return result[0] || null;
}

export async function createSubscription(data: schema.InsertSubscription) {
  const result = await db.insert(schema.subscriptions).values(data).returning();
  return result[0];
}

export async function updateSubscription(id: number, data: Partial<schema.InsertSubscription>) {
  const result = await db.update(schema.subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.subscriptions.id, id))
    .returning();
  return result[0];
}

// ============================================================================
// AI CHAT FUNCTIONS
// ============================================================================

export async function createAiConversation(clientId: number, title?: string) {
  const result = await db.insert(schema.aiChatConversations)
    .values({ clientId, title: title || "New Conversation" })
    .returning();
  return result[0];
}

export async function getAiConversationsByClientId(clientId: number) {
  return await db.select()
    .from(schema.aiChatConversations)
    .where(eq(schema.aiChatConversations.clientId, clientId))
    .orderBy(schema.aiChatConversations.updatedAt);
}

export async function addAiChatMessage(data: {
  conversationId: number;
  role: string;
  content: string;
}) {
  const result = await db.insert(schema.aiChatMessages).values(data).returning();
  
  // Update conversation timestamp
  await db.update(schema.aiChatConversations)
    .set({ updatedAt: new Date() })
    .where(eq(schema.aiChatConversations.id, data.conversationId));
  
  return result[0];
}

export async function getAiChatMessagesByConversationId(conversationId: number) {
  return await db.select()
    .from(schema.aiChatMessages)
    .where(eq(schema.aiChatMessages.conversationId, conversationId))
    .orderBy(schema.aiChatMessages.createdAt);
}

// ============================================================================
// SESSION FUNCTIONS
// ============================================================================

export async function getSessionTypeById(id: number) {
  const result = await db.select().from(schema.sessionTypes).where(eq(schema.sessionTypes.id, id)).limit(1);
  return result[0] || null;
}

export async function getAllActiveSessionTypes() {
  return await db.select()
    .from(schema.sessionTypes)
    .where(eq(schema.sessionTypes.isActive, true));
}

export async function createCoachingSession(data: schema.InsertSession) {
  const result = await db.insert(schema.sessions).values(data).returning();
  return result[0];
}

export async function getSessionsByClientId(clientId: number) {
  return await db.select()
    .from(schema.sessions)
    .where(eq(schema.sessions.clientId, clientId))
    .orderBy(schema.sessions.scheduledDate);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export async function upsertUser(data: {
  email: string;
  name?: string | null;
  passwordHash?: string;
  passwordSalt?: string;
  loginMethod?: string;
  lastSignedIn?: Date;
}) {
  const existing = await getUserByEmail(data.email);
  
  if (existing) {
    const result = await db.update(schema.users)
      .set({
        name: data.name ?? existing.name,
        lastSignedIn: data.lastSignedIn ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, existing.id))
      .returning();
    return result[0];
  } else {
    return await createUser({
      email: data.email,
      name: data.name || null,
      passwordHash: data.passwordHash || "",
      passwordSalt: data.passwordSalt || "",
      loginMethod: data.loginMethod || "email",
      lastSignedIn: data.lastSignedIn || new Date(),
    });
  }
}
