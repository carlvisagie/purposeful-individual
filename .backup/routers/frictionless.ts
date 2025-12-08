/**
 * Frictionless Onboarding Router
 * Handles anonymous sessions, AI chat, data extraction, and seamless conversion
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { anonymousSessions, users, clients, clientFolders, magicLinks } from "../../drizzle/schema";
import { eq, and, lt, sql } from "drizzle-orm";
import crypto from "crypto";
import { OpenAI } from "openai";
import { detectCrisis, generateCrisisResponse, logCrisisAlert } from "../services/crisisDetection";
import { safetyCheck } from "../safetyGuardrails";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to generate secure tokens
function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

// Helper function to calculate engagement score
function calculateEngagementScore(
  messageCount: number,
  sessionDurationSeconds: number,
  valueDelivered: boolean
): number {
  let score = 0;
  
  // Messages: 5 points each (max 50 points for 10+ messages)
  score += Math.min(messageCount * 5, 50);
  
  // Duration: 1 point per minute (max 30 points for 30+ minutes)
  score += Math.min(Math.floor(sessionDurationSeconds / 60), 30);
  
  // Value delivered: 20 points bonus
  if (valueDelivered) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

// Helper function to extract structured data from conversation using AI
async function extractDataFromConversation(
  messages: Array<{ role: string; content: string }>
): Promise<any> {
  try {
    const conversationText = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const extractionPrompt = `Analyze this conversation and extract structured information. Return ONLY valid JSON with these fields (use null for missing data):

{
  "firstName": string | null,
  "lastName": string | null,
  "email": string | null,
  "phone": string | null,
  "hasAutisticChild": boolean | null,
  "childName": string | null,
  "childAge": number | null,
  "childDiagnosis": string | null,
  "challenges": string[] | null,
  "currentInterventions": string[] | null,
  "primaryGoal": string | null,
  "painPoints": string[] | null,
  "motivationLevel": number | null (1-10)
}

Conversation:
${conversationText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a data extraction assistant. Extract information from conversations and return ONLY valid JSON. Be conservative - only extract information that is explicitly stated.",
        },
        {
          role: "user",
          content: extractionPrompt,
        },
      ],
      temperature: 0.1,
    });

    const extracted = JSON.parse(response.choices[0].message.content || "{}");
    return extracted;
  } catch (error) {
    console.error("Error extracting data:", error);
    return {};
  }
}

// Helper function to determine if value has been delivered
function hasDeliveredValue(messages: Array<{ role: string; content: string }>): boolean {
  // Check if AI has provided substantial responses (not just greetings)
  const aiMessages = messages.filter((m) => m.role === "assistant");
  
  // Value is delivered if:
  // - AI has sent 3+ messages
  // - At least one message is longer than 200 characters (substantial response)
  const hasSubstantialResponse = aiMessages.some((m) => m.content.length > 200);
  
  return aiMessages.length >= 3 && hasSubstantialResponse;
}

// Helper function to determine if conversion prompt should be shown
function shouldShowConversionPrompt(
  engagementScore: number,
  messageCount: number,
  sessionDurationSeconds: number,
  conversionPromptCount: number
): boolean {
  // Don't show if already shown 3+ times
  if (conversionPromptCount >= 3) return false;
  
  // High engagement (61-100): Show after 10 messages or 10 minutes
  if (engagementScore >= 61) {
    return messageCount >= 10 || sessionDurationSeconds >= 600;
  }
  
  // Medium engagement (31-60): Show after 15 messages or 15 minutes
  if (engagementScore >= 31) {
    return messageCount >= 15 || sessionDurationSeconds >= 900;
  }
  
  // Low engagement (0-30): Don't push conversion
  return false;
}

// Helper function to generate AI coaching response
async function generateAIResponse(
  messages: Array<{ role: string; content: string }>,
  extractedData: any,
  shouldPromptConversion: boolean
): Promise<string> {
  try {
    const systemPrompt = `You are a compassionate, evidence-based AI coach for Purposeful Live Coaching. 

Your approach:
- Ask thoughtful questions to understand their situation
- Provide evidence-based insights (cite researchers like Huberman, Attia, Walker when relevant)
- Be warm and supportive, especially for parents of autistic children
- Extract information naturally through conversation (don't use forms)
- Build trust before discussing payment

Current extracted data: ${JSON.stringify(extractedData, null, 2)}

${shouldPromptConversion ? `
IMPORTANT: After your response, naturally transition to offering to save their progress. Say something like:

"[Your coaching response here]

By the way, I can see we're making real progress here. Would you like me to save everything we've discussed so you can access it anytime? I just need your email to create your free account."
` : ""}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I'm here to help. Could you tell me more?";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm here to help you. Could you tell me more about what brings you here today?";
  }
}

export const frictionlessRouter = router({
  // Create anonymous session
  createSession: publicProcedure
    .input(
      z.object({
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        referrer: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const sessionToken = generateToken(32);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        console.log("[createSession] Attempting to insert:", { sessionToken, expiresAt, ...input });

        // Use raw SQL with explicit casting to avoid Drizzle issues
        const result = await db.execute(sql`
          INSERT INTO anonymous_sessions (
            session_token, expires_at, ip_address, user_agent, referrer,
            conversation_data, extracted_data, media_files
          )
          VALUES (
            ${sessionToken}::varchar, 
            ${expiresAt.toISOString()}::timestamp, 
            ${input.ipAddress || null}::varchar, 
            ${input.userAgent || null}::text, 
            ${input.referrer || null}::text,
            '[]'::jsonb, 
            '{}'::jsonb, 
            '[]'::jsonb
          )
          RETURNING *
        `);
        
        const session = result.rows[0] as any;

        console.log("[createSession] Success! Session created:", session.id);

        return {
          sessionToken: session.sessionToken,
          sessionId: session.id,
        };
      } catch (error) {
        console.error("[createSession] ERROR:", error);
        console.error("[createSession] Error details:", JSON.stringify(error, null, 2));
        throw error;
      }
    }),

  // Get session data
  getSession: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [session] = await db
        .select()
        .from(anonymousSessions)
        .where(eq(anonymousSessions.sessionToken, input.sessionToken))
        .limit(1);

      if (!session) {
        throw new Error("Session not found");
      }

      // Check if expired
      if (new Date() > session.expiresAt) {
        throw new Error("Session expired");
      }

      return session;
    }),

  // Send message and get AI response
  sendMessage: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Get session
      const [session] = await db
        .select()
        .from(anonymousSessions)
        .where(eq(anonymousSessions.sessionToken, input.sessionToken))
        .limit(1);

      if (!session) {
        throw new Error("Session not found");
      }

      // Check if expired
      if (new Date() > session.expiresAt) {
        throw new Error("Session expired");
      }

      // SAFETY GUARDRAILS - Check BEFORE processing
      const safetyResult = safetyCheck(input.message);
      if (!safetyResult.safe && safetyResult.redirect) {
        // Return safety redirect message immediately
        const conversationData = session.conversationData as Array<{ role: string; content: string }> || [];
        conversationData.push({
          role: "user",
          content: input.message,
        });
        conversationData.push({
          role: "assistant",
          content: safetyResult.output || "I can only help with wellness coaching and lifestyle support. For medical, legal, or crisis situations, please consult appropriate professionals.",
        });
        
        await db
          .update(anonymousSessions)
          .set({
            conversationData,
            messageCount: conversationData.filter((m) => m.role === "user").length,
            lastActiveAt: new Date(),
          })
          .where(eq(anonymousSessions.id, session.id));
        
        return {
          message: safetyResult.output || "I can only help with wellness coaching.",
          shouldPromptConversion: false,
          safetyBlocked: true,
        };
      }

      // Add user message to conversation
      const conversationData = session.conversationData as Array<{ role: string; content: string }> || [];
      conversationData.push({
        role: "user",
        content: input.message,
      });

      // Check for crisis indicators
      const crisisAlert = detectCrisis(input.message);
      if (crisisAlert) {
        console.log("[CRISIS DETECTED]", crisisAlert);
        await logCrisisAlert(session.id, session.convertedToUserId, crisisAlert);
        
        // Return crisis response immediately
        const crisisResponse = generateCrisisResponse(crisisAlert);
        conversationData.push({
          role: "assistant",
          content: crisisResponse,
        });
        
        await db
          .update(anonymousSessions)
          .set({
            conversationData,
            messageCount: conversationData.filter((m) => m.role === "user").length,
            lastActiveAt: new Date(),
          })
          .where(eq(anonymousSessions.id, session.id));
        
        return {
          message: crisisResponse,
          shouldPromptConversion: false,
          crisisDetected: true,
        };
      }

      // Extract data from conversation
      const extractedData = await extractDataFromConversation(conversationData);

      // Calculate session duration (simplified - would need more accurate tracking)
      const sessionDurationSeconds = Math.floor(
        (Date.now() - new Date(session.createdAt).getTime()) / 1000
      );

      // Check if value has been delivered
      const valueDelivered = hasDeliveredValue(conversationData);

      // Calculate engagement score
      const messageCount = conversationData.filter((m) => m.role === "user").length;
      const engagementScore = calculateEngagementScore(
        messageCount,
        sessionDurationSeconds,
        valueDelivered
      );

      // Determine if we should show conversion prompt
      const shouldPromptConversion = shouldShowConversionPrompt(
        engagementScore,
        messageCount,
        sessionDurationSeconds,
        session.conversionPromptCount
      );

      // Generate AI response
      const aiResponse = await generateAIResponse(
        conversationData,
        extractedData,
        shouldPromptConversion
      );

      // Add AI response to conversation
      conversationData.push({
        role: "assistant",
        content: aiResponse,
      });

      // Update session
      await db
        .update(anonymousSessions)
        .set({
          conversationData,
          extractedData,
          engagementScore,
          messageCount,
          sessionDurationSeconds,
          valueDelivered,
          conversionPromptShown: shouldPromptConversion ? true : session.conversionPromptShown,
          conversionPromptCount: shouldPromptConversion
            ? session.conversionPromptCount + 1
            : session.conversionPromptCount,
          lastActiveAt: new Date(),
        })
        .where(eq(anonymousSessions.id, session.id));

      return {
        message: aiResponse,
        engagementScore,
        shouldShowConversionPrompt: shouldPromptConversion,
        extractedData,
      };
    }),

  // Convert anonymous session to user account
  convertToAccount: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      // Get session
      const [session] = await db
        .select()
        .from(anonymousSessions)
        .where(eq(anonymousSessions.sessionToken, input.sessionToken))
        .limit(1);

      if (!session) {
        throw new Error("Session not found");
      }

      // Check if already converted
      if (session.convertedToUserId) {
        throw new Error("Session already converted");
      }

      // Check if user with this email already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      let userId: number;

      if (existingUser) {
        // User exists, link session to existing user
        userId = existingUser.id;
      } else {
        // Create new user
        const extractedData = session.extractedData as any;
        const [newUser] = await db
          .insert(users)
          .values({
            email: input.email,
            name: extractedData?.firstName
              ? `${extractedData.firstName} ${extractedData.lastName || ""}`.trim()
              : null,
            loginMethod: "magic_link",
            subscriptionTier: "free",
          })
          .returning();

        userId = newUser.id;

        // Create client profile
        const [client] = await db
          .insert(clients)
          .values({
            userId,
            goals: extractedData?.primaryGoal || null,
            importedFromSessionId: session.id,
          })
          .returning();

        // Create client folder
        await db.insert(clientFolders).values({
          clientId: client.id,
          anonymousSessionId: session.id,
          folderPath: `/client-data/${client.id}/`,
        });
      }

      // Mark session as converted
      await db
        .update(anonymousSessions)
        .set({
          convertedToUserId: userId,
          convertedAt: new Date(),
        })
        .where(eq(anonymousSessions.id, session.id));

      // Create magic link for passwordless login
      const magicToken = generateToken(32);
      const magicExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await db.insert(magicLinks).values({
        email: input.email,
        token: magicToken,
        expiresAt: magicExpiresAt,
      });

      // TODO: Send email with magic link
      // For now, return the token (in production, only send via email)
      const magicLinkUrl = `${process.env.BASE_URL || "http://localhost:5000"}/auth/magic?token=${magicToken}`;

      return {
        success: true,
        userId,
        magicLinkUrl, // Remove this in production
        message: "Account created! Check your email for login link.",
      };
    }),

  // Cleanup expired sessions (should be called periodically)
  cleanupExpiredSessions: publicProcedure.mutation(async () => {
    const result = await db
      .delete(anonymousSessions)
      .where(
        and(
          lt(anonymousSessions.expiresAt, new Date()),
          eq(anonymousSessions.convertedToUserId, null)
        )
      );

    return {
      deletedCount: result.rowCount || 0,
    };
  }),
});
