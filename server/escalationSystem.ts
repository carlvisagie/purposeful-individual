import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { escalationQueue, coachNotifications, aiChatMessages, coaches } from "../drizzle/schema-postgresql";
import { desc, eq } from "drizzle-orm";

/**
 * Escalation System - Handles AI to human coach handoff
 * 
 * Triggers escalation when:
 * - Crisis keywords detected
 * - Client explicitly requests human coach
 * - AI expresses uncertainty
 * - Compliance flags raised
 * - Complex issues beyond AI scope
 */

export interface EscalationTrigger {
  conversationId: number;
  userId: number;
  clientId?: number;
  type: "crisis" | "client_request" | "ai_uncertainty" | "compliance_flag" | "complex_issue";
  priority: "low" | "medium" | "high" | "urgent";
  reason: string;
  context: string;
}

const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "self-harm",
  "hurt myself",
  "cutting",
  "overdose",
  "can't go on",
  "no reason to live",
  "better off dead",
];

const UNCERTAINTY_PHRASES = [
  "I'm not sure",
  "I don't know",
  "beyond my expertise",
  "outside my scope",
  "I recommend speaking with",
  "you should consult",
  "I can't help with",
];

/**
 * Analyze a message to determine if escalation is needed
 */
export async function analyzeForEscalation(
  userMessage: string,
  aiResponse: string,
  conversationId: number,
  userId: number,
  clientId?: number
): Promise<EscalationTrigger | null> {
  
  // 1. Check for crisis keywords (HIGHEST PRIORITY)
  const lowerMessage = userMessage.toLowerCase();
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      return {
        conversationId,
        userId,
        clientId,
        type: "crisis",
        priority: "urgent",
        reason: `Crisis keyword detected: "${keyword}"`,
        context: `User: ${userMessage}\nAI: ${aiResponse}`,
      };
    }
  }

  // 2. Check if client explicitly requested human coach
  if (
    lowerMessage.includes("speak to a person") ||
    lowerMessage.includes("talk to a human") ||
    lowerMessage.includes("real coach") ||
    lowerMessage.includes("human coach") ||
    lowerMessage.includes("not helping") ||
    lowerMessage.includes("want to talk to someone")
  ) {
    return {
      conversationId,
      userId,
      clientId,
      type: "client_request",
      priority: "high",
      reason: "Client requested human coach",
      context: `User: ${userMessage}\nAI: ${aiResponse}`,
    };
  }

  // 3. Check if AI expressed uncertainty
  const lowerResponse = aiResponse.toLowerCase();
  for (const phrase of UNCERTAINTY_PHRASES) {
    if (lowerResponse.includes(phrase)) {
      return {
        conversationId,
        userId,
        clientId,
        type: "ai_uncertainty",
        priority: "medium",
        reason: `AI expressed uncertainty: "${phrase}"`,
        context: `User: ${userMessage}\nAI: ${aiResponse}`,
      };
    }
  }

  // 4. Check for complex issues (relationship problems, trauma, etc.)
  if (
    lowerMessage.includes("trauma") ||
    lowerMessage.includes("abuse") ||
    lowerMessage.includes("assault") ||
    lowerMessage.includes("ptsd") ||
    lowerMessage.includes("flashback")
  ) {
    return {
      conversationId,
      userId,
      clientId,
      type: "complex_issue",
      priority: "high",
      reason: "Complex trauma-related issue detected",
      context: `User: ${userMessage}\nAI: ${aiResponse}`,
    };
  }

  return null;
}

/**
 * Create an escalation in the queue and notify coaches
 */
export async function createEscalation(trigger: EscalationTrigger): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.error("[Escalation] Database not available");
    return 0;
  }

  try {
    // Insert escalation into queue
    const result = await db.insert(escalationQueue).values({
      conversationId: trigger.conversationId,
      userId: trigger.userId,
      clientId: trigger.clientId || null,
      escalationType: trigger.type,
      priority: trigger.priority,
      reason: trigger.reason,
      context: trigger.context,
      status: "pending",
      notificationSent: "false",
    });

    const escalationId = Number(result[0].insertId);

    // Notify coaches (both you and your wife)
    await notifyCoaches(escalationId, trigger);

    // For urgent escalations, also notify platform owner
    if (trigger.priority === "urgent") {
      await notifyOwner({
        title: "🚨 URGENT: Crisis Escalation",
        content: `${trigger.reason}\n\nContext:\n${trigger.context}\n\nPlease respond immediately.`,
      });
    }

    return escalationId;
  } catch (error) {
    console.error("[Escalation] Failed to create escalation:", error);
    return 0;
  }
}

/**
 * Notify all active coaches about an escalation
 */
async function notifyCoaches(escalationId: number, trigger: EscalationTrigger): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Get all active coaches
    const activeCoaches = await db.select().from(coaches).where(eq(coaches.isActive, "true"));

    // Create notification for each coach
    for (const coach of activeCoaches) {
      await db.insert(coachNotifications).values({
        coachId: coach.id,
        notificationType: trigger.type === "crisis" ? "crisis_alert" : "escalation",
        title: getNotificationTitle(trigger),
        message: getNotificationMessage(trigger),
        priority: trigger.priority,
        relatedId: escalationId,
        isRead: "false",
      });
    }

    // Mark escalation as notified
    await db
      .update(escalationQueue)
      .set({ notificationSent: "true" })
      .where(eq(escalationQueue.id, escalationId));

  } catch (error) {
    console.error("[Escalation] Failed to notify coaches:", error);
  }
}

/**
 * Get notification title based on escalation type
 */
function getNotificationTitle(trigger: EscalationTrigger): string {
  switch (trigger.type) {
    case "crisis":
      return "🚨 CRISIS ALERT - Immediate Action Required";
    case "client_request":
      return "👤 Client Requesting Human Coach";
    case "ai_uncertainty":
      return "🤔 AI Needs Human Guidance";
    case "compliance_flag":
      return "⚠️ Compliance Flag Raised";
    case "complex_issue":
      return "🧠 Complex Issue Escalation";
    default:
      return "Escalation Required";
  }
}

/**
 * Get notification message based on escalation type
 */
function getNotificationMessage(trigger: EscalationTrigger): string {
  return `${trigger.reason}\n\nPriority: ${trigger.priority.toUpperCase()}\n\nRecent context:\n${trigger.context.substring(0, 300)}${trigger.context.length > 300 ? "..." : ""}`;
}

/**
 * Get recent conversation context for escalation
 */
export async function getConversationContext(conversationId: number, messageCount: number = 10): Promise<string> {
  const db = await getDb();
  if (!db) return "";

  try {
    const messages = await db
      .select()
      .from(aiChatMessages)
      .where(eq(aiChatMessages.conversationId, conversationId))
      .orderBy(desc(aiChatMessages.createdAt))
      .limit(messageCount);

    return messages
      .reverse()
      .map(m => `${m.role === "user" ? "Client" : "AI"}: ${m.content}`)
      .join("\n\n");
  } catch (error) {
    console.error("[Escalation] Failed to get conversation context:", error);
    return "";
  }
}

/**
 * Assign escalation to a specific coach
 */
export async function assignEscalation(escalationId: number, coachId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(escalationQueue)
      .set({
        assignedTo: coachId,
        assignedAt: new Date(),
        status: "assigned",
      })
      .where(eq(escalationQueue.id, escalationId));

    return true;
  } catch (error) {
    console.error("[Escalation] Failed to assign escalation:", error);
    return false;
  }
}

/**
 * Resolve an escalation
 */
export async function resolveEscalation(
  escalationId: number,
  resolutionNotes: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(escalationQueue)
      .set({
        status: "resolved",
        resolvedAt: new Date(),
        resolutionNotes,
      })
      .where(eq(escalationQueue.id, escalationId));

    return true;
  } catch (error) {
    console.error("[Escalation] Failed to resolve escalation:", error);
    return false;
  }
}
