/**
 * Database helpers for AI chat conversations
 */

import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../db";
import {
  aiChatConversations,
  aiChatMessages,
  InsertAiChatConversation,
  InsertAiChatMessage,
} from "../../drizzle/schema-postgresql";

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(aiChatConversations)
    .where(eq(aiChatConversations.userId, userId))
    .orderBy(desc(aiChatConversations.lastMessageAt));
}

/**
 * Get a specific conversation with all messages
 */
export async function getConversationWithMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return null;

  const [conversation] = await db
    .select()
    .from(aiChatConversations)
    .where(eq(aiChatConversations.id, conversationId))
    .limit(1);

  if (!conversation) return null;

  const messages = await db
    .select()
    .from(aiChatMessages)
    .where(eq(aiChatMessages.conversationId, conversationId))
    .orderBy(aiChatMessages.createdAt);

  return {
    conversation,
    messages,
  };
}

/**
 * Create a new conversation
 */
export async function createConversation(data: InsertAiChatConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(aiChatConversations).values(data);
  return result.insertId;
}

/**
 * Add a message to a conversation
 */
export async function addMessage(data: InsertAiChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Insert message
  const [result] = await db.insert(aiChatMessages).values(data);

  // Update conversation's lastMessageAt
  await db
    .update(aiChatConversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(aiChatConversations.id, data.conversationId));

  return result.insertId;
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(conversationId: number, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(aiChatConversations)
    .set({ title })
    .where(eq(aiChatConversations.id, conversationId));
}

/**
 * Get messages from a conversation
 */
export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(aiChatMessages)
    .where(eq(aiChatMessages.conversationId, conversationId))
    .orderBy(aiChatMessages.createdAt);
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Messages are deleted automatically via CASCADE
  await db
    .delete(aiChatConversations)
    .where(eq(aiChatConversations.id, conversationId));
}

/**
 * Check for crisis keywords in message
 */
export function detectCrisisLevel(message: string): "none" | "low" | "medium" | "high" | "critical" {
  const lowerMessage = message.toLowerCase();

  // Critical keywords
  const criticalKeywords = [
    "suicide", "kill myself", "end my life", "want to die",
    "better off dead", "no reason to live"
  ];

  // High risk keywords
  const highKeywords = [
    "self harm", "cut myself", "hurt myself", "can't go on",
    "giving up", "hopeless", "worthless"
  ];

  // Medium risk keywords
  const mediumKeywords = [
    "depressed", "anxiety attack", "panic attack", "overwhelming",
    "can't cope", "breaking down"
  ];

  // Low risk keywords
  const lowKeywords = [
    "stressed", "worried", "anxious", "sad", "upset", "frustrated"
  ];

  for (const keyword of criticalKeywords) {
    if (lowerMessage.includes(keyword)) return "critical";
  }

  for (const keyword of highKeywords) {
    if (lowerMessage.includes(keyword)) return "high";
  }

  for (const keyword of mediumKeywords) {
    if (lowerMessage.includes(keyword)) return "medium";
  }

  for (const keyword of lowKeywords) {
    if (lowerMessage.includes(keyword)) return "low";
  }

  return "none";
}
