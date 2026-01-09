import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { aiInsights, journalEntries, emotionLogs } from "../../drizzle/schema-postgresql";
import { eq, desc, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

/**
 * AI Insights Router
 * 
 * Generates AI-powered insights from client emotional data
 * Includes crisis detection, pattern analysis, and coaching recommendations
 * 
 * REQUIRES: OPENAI_API_KEY environment variable
 */

export const aiInsightsRouter = router({
  /**
   * List all AI insights for a client
   */
  list: protectedProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const insights = await db
        .select()
        .from(aiInsights)
        .where(eq(aiInsights.clientId, input.clientId))
        .orderBy(desc(aiInsights.insightDate));

      return insights;
    }),

  /**
   * Generate new AI insights for a client
   * Analyzes recent journal entries and emotion logs
   */
  generate: protectedProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get recent journal entries (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentJournals = await db
        .select()
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.clientId, input.clientId),
          )
        )
        .orderBy(desc(journalEntries.createdAt))
        .limit(20);

      const recentEmotions = await db
        .select()
        .from(emotionLogs)
        .where(eq(emotionLogs.clientId, input.clientId))
        .orderBy(desc(emotionLogs.logDate))
        .limit(50);

      if (recentJournals.length === 0 && recentEmotions.length === 0) {
        throw new Error("No data available to generate insights");
      }

      // Prepare data for AI analysis
      const journalSummary = recentJournals.map(j => ({
        date: j.createdAt,
        mood: j.mood,
        content: j.content?.substring(0, 500), // Limit to save tokens
        emotions: j.emotions,
        triggers: j.triggers,
      }));

      const emotionSummary = recentEmotions.map(e => ({
        date: e.logDate,
        emotion: e.emotionType,
        intensity: e.intensity,
        trigger: e.trigger,
      }));

      // Call OpenAI for analysis
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert emotional resilience coach analyzing client data. 
              
Your task is to:
1. Identify emotional patterns and trends
2. Detect potential crisis indicators (suicidal ideation, self-harm, severe depression)
3. Recognize triggers and their impact
4. Provide actionable coaching recommendations
5. Calculate a resilience score (0-100)

Respond in JSON format with this structure:
{
  "patterns": ["pattern1", "pattern2"],
  "crisisIndicators": ["indicator1"] or [],
  "triggers": ["trigger1", "trigger2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "resilienceScore": 75,
  "summary": "Brief overall assessment",
  "severity": "low" | "medium" | "high" | "critical"
}`
            },
            {
              role: "user",
              content: `Analyze this client's emotional data:

JOURNAL ENTRIES (last 30 days):
${JSON.stringify(journalSummary, null, 2)}

EMOTION LOGS (last 50 entries):
${JSON.stringify(emotionSummary, null, 2)}

Provide comprehensive insights focusing on patterns, crisis indicators, and actionable recommendations.`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "emotional_insights",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  patterns: {
                    type: "array",
                    items: { type: "string" },
                    description: "Identified emotional patterns"
                  },
                  crisisIndicators: {
                    type: "array",
                    items: { type: "string" },
                    description: "Crisis warning signs detected"
                  },
                  triggers: {
                    type: "array",
                    items: { type: "string" },
                    description: "Common emotional triggers"
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Coaching recommendations"
                  },
                  resilienceScore: {
                    type: "integer",
                    description: "Overall resilience score 0-100"
                  },
                  summary: {
                    type: "string",
                    description: "Brief overall assessment"
                  },
                  severity: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    description: "Severity level of concerns"
                  }
                },
                required: ["patterns", "crisisIndicators", "triggers", "recommendations", "resilienceScore", "summary", "severity"],
                additionalProperties: false
              }
            }
          }
        });

        const aiResponse = JSON.parse(response.choices[0].message.content as string);

        // Save insights to database
        await db.insert(aiInsights).values({
          clientId: input.clientId,
          insightType: aiResponse.severity === "critical" ? "crisis_alert" : "pattern_analysis",
          title: `AI Analysis - ${aiResponse.severity.toUpperCase()}`,
          description: aiResponse.summary,
          severity: aiResponse.severity,
          actionable: aiResponse.recommendations.join("\n"),
          insightDate: new Date(),
        });

        return {
          details: aiResponse,
          tokensUsed: response.usage?.total_tokens || 0,
        };

      } catch (error: any) {
        // Handle OpenAI API errors gracefully
        if (error.message?.includes("OPENAI_API_KEY is not configured")) {
          throw new Error("AI features require OpenAI API key. Please add OPENAI_API_KEY to environment variables.");
        }
        throw error;
      }
    }),

  /**
   * Analyze a single journal entry for crisis indicators
   * Used for real-time monitoring as entries are created
   */
  analyzeCrisisRisk: protectedProcedure
    .input(z.object({
      journalEntryId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [entry] = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, input.journalEntryId))
        .limit(1);

      if (!entry) {
        throw new Error("Journal entry not found");
      }

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a crisis detection system for emotional resilience coaching.

Analyze the journal entry for:
- Suicidal ideation
- Self-harm indicators
- Severe depression
- Immediate danger to self or others

Respond with JSON:
{
  "riskLevel": "none" | "low" | "medium" | "high" | "critical",
  "indicators": ["indicator1", "indicator2"],
  "requiresEscalation": true/false,
  "recommendedAction": "description of recommended action"
}`
            },
            {
              role: "user",
              content: `Analyze this journal entry for crisis indicators:

Mood: ${entry.mood}/10
Content: ${entry.content}
Emotions: ${entry.emotions}
Triggers: ${entry.triggers}

Provide crisis risk assessment.`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "crisis_assessment",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  riskLevel: {
                    type: "string",
                    enum: ["none", "low", "medium", "high", "critical"]
                  },
                  indicators: {
                    type: "array",
                    items: { type: "string" }
                  },
                  requiresEscalation: {
                    type: "boolean"
                  },
                  recommendedAction: {
                    type: "string"
                  }
                },
                required: ["riskLevel", "indicators", "requiresEscalation", "recommendedAction"],
                additionalProperties: false
              }
            }
          }
        });

        const assessment = JSON.parse(response.choices[0].message.content as string);

        // If critical, create crisis alert insight
        if (assessment.requiresEscalation) {
          await db.insert(aiInsights).values({
            clientId: entry.clientId,
            insightType: "crisis_alert",
            title: "CRISIS ALERT",
            description: assessment.recommendedAction,
            severity: "critical",
            actionable: assessment.indicators.join("\n"),
            insightDate: new Date(),
          });
        }

        return {
          assessment,
          tokensUsed: response.usage?.total_tokens || 0,
        };

      } catch (error: any) {
        if (error.message?.includes("OPENAI_API_KEY is not configured")) {
          // Fail gracefully - return no risk if AI not configured
          return {
            assessment: {
              riskLevel: "none",
              indicators: [],
              requiresEscalation: false,
              recommendedAction: "AI crisis detection not configured. Manual review recommended."
            },
            tokensUsed: 0,
          };
        }
        throw error;
      }
    }),
});
