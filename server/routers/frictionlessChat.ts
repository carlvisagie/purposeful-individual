/**
 * Frictionless AI Chat Router (MySQL)
 * Handles anonymous AI coaching sessions without requiring authentication
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { safetyCheck } from "../safetyGuardrails";
import { db } from "../../drizzle/db";
import { aiChatConversations, aiChatMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const SYSTEM_PROMPT = `You are the user's Chief Life Strategist, Behavioral Architect, and Cognitive Guardian.

You operate under the PurposefulLive Master Prompt system.

**OPERATING LAWS (PERMANENT):**

1. **NO-DECISION MODE**: You do not ask questions or present options. You choose automatically using evidence-based behavioral science. You tell them what to do, not what they could do.

2. **COGNITIVE PROTECTION MODE**: You protect their mind, attention, energy, and executive function. You eliminate overwhelm, decision fatigue, and emotional dysregulation. You only show the essential next step.

3. **TRUTH AND REALITY PRINCIPLE**: You bow to evidence, neuroscience, and what works in reality. You use behavioral science, cognitive-behavioral principles, habit architecture, and systems thinking. You do not sugarcoat. You tell the truth that leads to the best outcome.

4. **TRANSFORMATION ENGINE MODE**: You structure everything in systems, frameworks, protocols, and checklists. You build them into the person capable of achieving discipline, emotional control, and long-term success.

5. **MINIMAL INPUT**: You never require them to choose. You make the decisions. You provide the path. You carry the complexity. They only execute.

**OUTPUT FORMAT (MANDATORY):**

Every response follows this structure:

**PLAN**
One-paragraph summary — the why and the intent.

**OUTPUT**
The exact protocol, script, habit, rule, or framework. No fluff. No abstractions.

**RUN/USE**
The exact steps they take — minimal, clear, executable.

**TEST/VALIDATE**
How we know it worked (internal or external markers).

**NEXT**
YOU choose the next logical step that moves them forward.

**BEHAVIOR RULES:**
- Protect them from loops, spirals, overthinking, and emotional overload
- Speak like a quiet, grounded, elite strategist
- Masculine authority, precision, calm
- Reduce everything to the simplest possible step
- Create systems that remove chaos and inconsistency
- Prioritize identity over motivation
- Give them what they need, not what they want
- Translate complexity into linear action
- Operate as a behavioral guardian, not a cheerleader

**IDENTITY ARCHITECTURE:**
Help them become: disciplined, stable, emotionally controlled, mission-driven, resilient, strategic, consistent, capable, grounded, strong, effective, unstoppable.

Reinforce identity-based habits. Eliminate identity contradictions.

**CRISIS PROTOCOL:**
If they express suicidal thoughts, self-harm, or severe distress:
1. Express immediate concern
2. Direct them to 988 Suicide & Crisis Lifeline or 911
3. Notify their coach immediately
4. Provide grounding protocol

You remove all friction, all cognitive cost, all unnecessary complexity, and all emotional weight. You choose everything. They receive only the essential next step.`;

function detectCrisisLevel(message: string): "none" | "low" | "medium" | "high" | "critical" {
  const lowerMessage = message.toLowerCase();
  
  // Critical keywords
  const criticalKeywords = ["kill myself", "end my life", "suicide", "want to die", "better off dead"];
  if (criticalKeywords.some(kw => lowerMessage.includes(kw))) {
    return "critical";
  }
  
  // High risk keywords
  const highRiskKeywords = ["self harm", "cut myself", "hurt myself", "no reason to live"];
  if (highRiskKeywords.some(kw => lowerMessage.includes(kw))) {
    return "high";
  }
  
  // Medium risk keywords
  const mediumRiskKeywords = ["hopeless", "can't go on", "give up", "no point"];
  if (mediumRiskKeywords.some(kw => lowerMessage.includes(kw))) {
    return "medium";
  }
  
  return "none";
}

export const frictionlessChatRouter = router({
  /**
   * Create or get anonymous conversation
   * Uses sessionId stored in browser localStorage
   */
  getOrCreateConversation: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if conversation exists for this sessionId
      const existingConversations = await db
        .select()
        .from(aiChatConversations)
        .where(eq(aiChatConversations.sessionId, input.sessionId))
        .orderBy(desc(aiChatConversations.lastMessageAt))
        .limit(1);

      if (existingConversations.length > 0) {
        return { conversationId: existingConversations[0].id };
      }

      // Create new conversation
      const result = await db.insert(aiChatConversations).values({
        sessionId: input.sessionId,
        userId: null, // Anonymous user
        title: "New Conversation",
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { conversationId: Number(result.insertId) };
    }),

  /**
   * Get conversation messages
   */
  getMessages: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        sessionId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      // Verify this conversation belongs to this sessionId
      const conversation = await db
        .select()
        .from(aiChatConversations)
        .where(
          and(
            eq(aiChatConversations.id, input.conversationId),
            eq(aiChatConversations.sessionId, input.sessionId)
          )
        )
        .limit(1);

      if (conversation.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      // Get messages
      const messages = await db
        .select()
        .from(aiChatMessages)
        .where(eq(aiChatMessages.conversationId, input.conversationId))
        .orderBy(aiChatMessages.createdAt);

      return { messages };
    }),

  /**
   * Send message and get AI response (anonymous)
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        sessionId: z.string().uuid(),
        message: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ input }) => {
      // Verify conversation belongs to this sessionId
      const conversation = await db
        .select()
        .from(aiChatConversations)
        .where(
          and(
            eq(aiChatConversations.id, input.conversationId),
            eq(aiChatConversations.sessionId, input.sessionId)
          )
        )
        .limit(1);

      if (conversation.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid conversation",
        });
      }

      // SAFETY GUARDRAILS - Check BEFORE processing
      const safetyResult = safetyCheck(input.message);
      if (!safetyResult.safe && safetyResult.redirect) {
        // Save user message
        await db.insert(aiChatMessages).values({
          conversationId: input.conversationId,
          role: "user",
          content: input.message,
          crisisFlag: safetyResult.type === "crisis" ? "critical" : "none",
          createdAt: new Date(),
        });

        // Save safety redirect response
        await db.insert(aiChatMessages).values({
          conversationId: input.conversationId,
          role: "assistant",
          content: safetyResult.output || "I can only help with wellness coaching and lifestyle support. For medical, legal, or crisis situations, please consult appropriate professionals.",
          crisisFlag: "none",
          createdAt: new Date(),
        });

        return {
          response: safetyResult.output,
          crisisFlag: safetyResult.type === "crisis" ? "critical" : "none",
          safetyBlocked: true,
        };
      }

      // Detect crisis level
      const crisisFlag = detectCrisisLevel(input.message);

      // Save user message
      await db.insert(aiChatMessages).values({
        conversationId: input.conversationId,
        role: "user",
        content: input.message,
        crisisFlag,
        createdAt: new Date(),
      });

      // Get conversation history
      const messages = await db
        .select()
        .from(aiChatMessages)
        .where(eq(aiChatMessages.conversationId, input.conversationId))
        .orderBy(aiChatMessages.createdAt);

      // Build conversation history for context
      const conversationHistory: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

      // Add system prompt if first message
      if (messages.length === 1) {
        conversationHistory.push({
          role: "system",
          content: SYSTEM_PROMPT,
        });
      }

      // Add message history
      messages.forEach((msg) => {
        conversationHistory.push({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content,
        });
      });

      // Get AI response
      let aiResponse: string;
      try {
        const response = await invokeLLM({
          messages: conversationHistory,
        });

        const content = response.choices[0]?.message?.content;
        aiResponse = typeof content === "string" ? content : "I'm here to help. Could you tell me more?";
      } catch (error) {
        console.error("[Frictionless Chat] LLM error:", error);
        aiResponse = "I'm having trouble connecting right now. Please try again in a moment.";
      }

      // Add crisis warning if detected
      if (crisisFlag === "critical" || crisisFlag === "high") {
        aiResponse = `⚠️ **I'm concerned about what you shared.** If you're in immediate danger, please call 988 (Suicide & Crisis Lifeline) or 911 right away.\n\n${aiResponse}\n\n**Your coach has been notified and will reach out to you as soon as possible.**`;
      }

      // Save AI response
      await db.insert(aiChatMessages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: aiResponse,
        crisisFlag: "none",
        createdAt: new Date(),
      });

      // Update conversation lastMessageAt
      await db
        .update(aiChatConversations)
        .set({ lastMessageAt: new Date(), updatedAt: new Date() })
        .where(eq(aiChatConversations.id, input.conversationId));

      // Auto-generate title from first exchange
      if (messages.length === 1 && conversation[0].title === "New Conversation") {
        try {
          const titleResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "Generate a short, empathetic title (3-6 words) for this conversation. Return ONLY the title, no quotes or punctuation.",
              },
              {
                role: "user",
                content: input.message,
              },
            ],
          });

          const titleContent = titleResponse.choices[0]?.message?.content;
          const title = typeof titleContent === "string" ? titleContent.trim() : "New Conversation";
          await db
            .update(aiChatConversations)
            .set({ title, updatedAt: new Date() })
            .where(eq(aiChatConversations.id, input.conversationId));
        } catch (error) {
          console.error("[Frictionless Chat] Title generation error:", error);
        }
      }

      return {
        response: aiResponse,
        crisisFlag,
      };
    }),
});
