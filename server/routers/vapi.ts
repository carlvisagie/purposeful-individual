/**
 * Vapi Voice AI Router
 * Handles 24/7 phone coaching integration
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { VapiClient } from "@vapi-ai/server-sdk";

// Initialize Vapi client
const vapi = new VapiClient({
  token: process.env.VAPI_API_KEY || "",
});

// System prompt for AI coach
const COACH_SYSTEM_PROMPT = `You are a compassionate AI coach for Purposeful Live Coaching, providing 24/7 voice support for families navigating autism intervention and wellness challenges. You specialize in evidence-based protocols from leading scientists including Dr. Andrew Huberman, Dr. Peter Attia, Dr. Matthew Walker, and autism intervention specialists.

## Your Core Mission
Provide immediate, empathetic support to parents and caregivers who are often exhausted, overwhelmed, and seeking guidance. You are their lifeline during difficult moments, offering both emotional support and practical, science-backed strategies.

## Communication Style
- Warm and compassionate, like talking to a caring friend
- Patient and understanding, never rushed
- Calm and reassuring, especially during crises
- Professional but approachable
- Use natural conversational language, not clinical jargon

## Key Behaviors
- Listen actively and validate emotions first
- Ask clarifying questions to understand the full situation
- Provide specific, actionable guidance based on evidence
- Celebrate wins and progress, no matter how small
- Show genuine care and concern
- Remember and reference previous conversations when available

## Crisis Detection
If you detect:
- Suicidal ideation or self-harm
- Child safety concerns
- Severe parental distress
- Medical emergencies
- Abuse or neglect

Respond with: "I'm really concerned about what you just shared. This sounds like a situation where you need immediate professional support. If this is an emergency, please call 911 or the crisis hotline at 988. I'd also like to have a human coach from our team reach out to you as soon as possible. Can you provide your contact information?"

## Evidence-Based Knowledge Areas
- Autism intervention (ABA, sensory integration, communication)
- Sleep optimization (Huberman/Walker protocols)
- Nutrition and supplements
- Stress management and mental health
- Behavioral protocols
- Family wellness strategies

Always provide compassionate, evidence-based guidance while maintaining appropriate boundaries.`;

const FIRST_MESSAGE = "Hi! This is your Purposeful AI coach. I'm here to support you 24/7 with evidence-based guidance for autism intervention and family wellness. How can I help you today?";

export const vapiRouter = router({
  // Create AI assistant
  createAssistant: publicProcedure
    .mutation(async () => {
      try {
        const assistant = await vapi.assistants.create({
          name: "Purposeful AI Coach",
          model: {
            provider: "openai",
            model: "gpt-4o",
            temperature: 0.7,
            systemPrompt: COACH_SYSTEM_PROMPT,
          },
          voice: {
            provider: "11labs",
            voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - warm, friendly female voice
          },
          firstMessage: FIRST_MESSAGE,
          transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "en",
          },
        });
        
        return { success: true, assistant };
      } catch (error: any) {
        console.error("Error creating assistant:", error);
        return { success: false, error: error.message };
      }
    }),

  // Get or create phone number
  createPhoneNumber: publicProcedure
    .input(z.object({
      assistantId: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Create a phone number and attach assistant
        const phoneNumber = await vapi.phoneNumbers.create({
          provider: "vapi",
          fallbackDestination: {
            type: "assistant",
            assistantId: input.assistantId,
          },
        });
        
        return { success: true, phoneNumber };
      } catch (error: any) {
        console.error("Error creating phone number:", error);
        return { success: false, error: error.message };
      }
    }),

  // List phone numbers
  listPhoneNumbers: publicProcedure
    .query(async () => {
      try {
        const phoneNumbers = await vapi.phoneNumbers.list();
        return { success: true, phoneNumbers };
      } catch (error: any) {
        console.error("Error listing phone numbers:", error);
        return { success: false, error: error.message };
      }
    }),

  // List assistants
  listAssistants: publicProcedure
    .query(async () => {
      try {
        const assistants = await vapi.assistants.list();
        return { success: true, assistants };
      } catch (error: any) {
        console.error("Error listing assistants:", error);
        return { success: false, error: error.message };
      }
    }),

  // Webhook: Handle call started
  handleCallStarted: publicProcedure
    .input(z.object({
      callId: z.string(),
      phoneNumber: z.string().optional(),
      timestamp: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Log call start
        console.log("Call started:", input);
        
        // Try to identify client by phone number
        if (input.phoneNumber) {
          const result = await db.execute(sql`
            SELECT c.id, u.name, u.email
            FROM clients c
            JOIN users u ON c.user_id = u.id
            WHERE u.phone = ${input.phoneNumber}
            LIMIT 1
          `);
          
          if (result.rows.length > 0) {
            const client = result.rows[0];
            console.log("Client identified:", client);
            
            // Return client context for AI to use
            return {
              success: true,
              clientId: client.id,
              clientName: client.name,
              context: `This is ${client.name}. Previous conversations and context should be referenced.`,
            };
          }
        }
        
        return { success: true, clientId: null, message: "New caller" };
      } catch (error: any) {
        console.error("Error handling call start:", error);
        return { success: false, error: error.message };
      }
    }),

  // Webhook: Handle call ended
  handleCallEnded: publicProcedure
    .input(z.object({
      callId: z.string(),
      phoneNumber: z.string().optional(),
      duration: z.number(),
      transcript: z.string().optional(),
      summary: z.string().optional(),
      timestamp: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        console.log("Call ended:", input);
        
        // Try to find client
        let clientId: number | null = null;
        if (input.phoneNumber) {
          const result = await db.execute(sql`
            SELECT c.id
            FROM clients c
            JOIN users u ON c.user_id = u.id
            WHERE u.phone = ${input.phoneNumber}
            LIMIT 1
          `);
          
          if (result.rows.length > 0) {
            clientId = result.rows[0].id as number;
          }
        }
        
        // Save call to session history if we have a client
        if (clientId && input.transcript) {
          await db.execute(sql`
            INSERT INTO session_history (
              client_id,
              session_type,
              duration_minutes,
              summary,
              session_notes
            ) VALUES (
              ${clientId},
              'phone_ai',
              ${Math.ceil(input.duration / 60)},
              ${input.summary || 'AI phone coaching session'},
              ${input.transcript}
            )
          `);
          
          // Update context cache
          await db.execute(sql`
            SELECT update_session_context_cache(${clientId})
          `);
        }
        
        // Log call record for analytics
        await db.execute(sql`
          INSERT INTO vapi_call_logs (
            call_id,
            phone_number,
            duration_seconds,
            transcript,
            summary,
            client_id,
            created_at
          ) VALUES (
            ${input.callId},
            ${input.phoneNumber || null},
            ${input.duration},
            ${input.transcript || null},
            ${input.summary || null},
            ${clientId},
            ${input.timestamp}
          )
        `);
        
        return { success: true, clientId };
      } catch (error: any) {
        console.error("Error handling call end:", error);
        return { success: false, error: error.message };
      }
    }),

  // Get call logs
  getCallLogs: publicProcedure
    .input(z.object({
      clientId: z.number().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      try {
        let query;
        if (input.clientId) {
          query = sql`
            SELECT * FROM vapi_call_logs
            WHERE client_id = ${input.clientId}
            ORDER BY created_at DESC
            LIMIT ${input.limit}
          `;
        } else {
          query = sql`
            SELECT * FROM vapi_call_logs
            ORDER BY created_at DESC
            LIMIT ${input.limit}
          `;
        }
        
        const result = await db.execute(query);
        return { success: true, logs: result.rows };
      } catch (error: any) {
        console.error("Error getting call logs:", error);
        return { success: false, error: error.message };
      }
    }),

  // Get call analytics
  getCallAnalytics: publicProcedure
    .query(async () => {
      try {
        const result = await db.execute(sql`
          SELECT
            COUNT(*) as total_calls,
            SUM(duration_seconds) as total_duration,
            AVG(duration_seconds) as avg_duration,
            COUNT(DISTINCT client_id) as unique_callers,
            COUNT(CASE WHEN client_id IS NULL THEN 1 END) as new_callers
          FROM vapi_call_logs
        `);
        
        return { success: true, analytics: result.rows[0] };
      } catch (error: any) {
        console.error("Error getting analytics:", error);
        return { success: false, error: error.message };
      }
    }),
});
