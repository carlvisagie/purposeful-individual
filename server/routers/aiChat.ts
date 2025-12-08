/**
 * AI Chat router - 24/7 AI coaching conversations
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { safetyCheck } from "../safetyGuardrails";
import {
  getUserConversations,
  getConversationWithMessages,
  createConversation,
  addMessage,
  updateConversationTitle,
  deleteConversation,
  detectCrisisLevel,
} from "../db/aiChat";

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

export const aiChatRouter = router({
  /**
   * Get all conversations for current user
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await getUserConversations(ctx.user.id);
    return { conversations };
  }),

  /**
   * Get a specific conversation with all messages
   */
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input, ctx }) => {
      const data = await getConversationWithMessages(input.conversationId);

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      // Verify user owns this conversation
      if (data.conversation.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
      }

      return data;
    }),

  /**
   * Create a new conversation
   */
  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        clientId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const conversationId = await createConversation({
        userId: ctx.user.id,
        clientId: input.clientId,
        title: input.title || "New Conversation",
      });

      return { conversationId };
    }),

  /**
   * Send a message and get AI response
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify conversation ownership
      const data = await getConversationWithMessages(input.conversationId);
      if (!data || data.conversation.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid conversation",
        });
      }

      // SAFETY GUARDRAILS - Check BEFORE processing
      const safetyResult = safetyCheck(input.message);
      if (!safetyResult.safe && safetyResult.redirect) {
        // Save user message
        await addMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.message,
          crisisFlag: safetyResult.type === "crisis" ? "critical" : "none",
        });
        
        // Save safety redirect response
        await addMessage({
          conversationId: input.conversationId,
          role: "assistant",
          content: safetyResult.output || "I can only help with wellness coaching and lifestyle support. For medical, legal, or crisis situations, please consult appropriate professionals.",
          crisisFlag: "none",
        });
        
        return {
          message: safetyResult.output,
          crisisFlag: safetyResult.type === "crisis" ? "critical" : "none",
          safetyBlocked: true,
        };
      }
      
      // Detect crisis level
      const crisisFlag = detectCrisisLevel(input.message);

      // Save user message
      await addMessage({
        conversationId: input.conversationId,
        role: "user",
        content: input.message,
        crisisFlag,
      });

      // Build conversation history for context
      const conversationHistory = data.messages.map((msg) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      }));

      // Add system prompt if first message
      if (conversationHistory.length === 0) {
        conversationHistory.unshift({
          role: "system",
          content: SYSTEM_PROMPT,
        });
      }

      // Add current user message
      conversationHistory.push({
        role: "user",
        content: input.message,
      });

      // Get AI response
      let aiResponse: string;
      try {
        const response = await invokeLLM({
          messages: conversationHistory,
        });

        const content = response.choices[0]?.message?.content;
        aiResponse = typeof content === 'string' ? content : "I'm here to help. Could you tell me more?";
      } catch (error) {
        console.error("[AI Chat] LLM error:", error);
        aiResponse = "I'm having trouble connecting right now. Please try again in a moment, or reach out to your coach directly if this is urgent.";
      }

      // Add crisis warning if detected
      if (crisisFlag === "critical" || crisisFlag === "high") {
        aiResponse = `⚠️ **I'm concerned about what you shared.** If you're in immediate danger, please call 988 (Suicide & Crisis Lifeline) or 911 right away.\n\n${aiResponse}\n\n**Your coach has been notified and will reach out to you as soon as possible.**`;
      }

      // Save AI response
      await addMessage({
        conversationId: input.conversationId,
        role: "assistant",
        content: aiResponse,
        crisisFlag: "none",
      });

      // Auto-generate title from first exchange
      if (data.messages.length === 0 && !data.conversation.title) {
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
          const title = typeof titleContent === 'string' ? titleContent.trim() : "New Conversation";
          await updateConversationTitle(input.conversationId, title);
        } catch (error) {
          console.error("[AI Chat] Title generation error:", error);
        }
      }

      return {
        response: aiResponse,
        crisisFlag,
      };
    }),

  /**
   * Delete a conversation
   */
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const data = await getConversationWithMessages(input.conversationId);
      if (!data || data.conversation.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid conversation",
        });
      }

      await deleteConversation(input.conversationId);

      return { success: true };
    }),
});
