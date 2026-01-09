import { invokeLLM } from "./_core/llm";
import { safetyCheck, COACH_ASSISTANT_SYSTEM_PROMPT } from "./safetyGuardrails";
import { getDb } from "./db";
import { liveSessionTranscripts, coachGuidance, similarCases } from "../drizzle/schema-postgresql";
import { desc, eq, and } from "drizzle-orm";

/**
 * AI Coach Assistant - Real-Time Session Guidance
 * 
 * This system listens to live coaching sessions and provides real-time guidance
 * to coaches (Carl & wife) via headset. The client cannot hear these suggestions.
 * 
 * Features:
 * - Live transcription of client conversation
 * - Real-time AI suggestions whispered to coach
 * - Compliance alerts (if coach approaches prohibited territory)
 * - Similar case recommendations
 * - Intervention suggestions (when to probe, when to redirect)
 * - Post-session AI summary and insights
 */

export interface SessionContext {
  sessionId: number;
  clientId: number;
  coachId: number;
  clientName: string;
  clientGoals: string[];
  previousSessions: number;
  lastSessionSummary?: string;
}

export interface TranscriptSegment {
  speaker: "client" | "coach";
  text: string;
  timestamp: Date;
}

export interface CoachGuidance {
  type: "suggest" | "alert" | "reference" | "technique" | "crisis";
  priority: "low" | "medium" | "high" | "urgent";
  message: string;
  context?: string;
}

/**
 * Process a new transcript segment and generate coach guidance
 */
export async function processTranscriptSegment(
  sessionContext: SessionContext,
  segment: TranscriptSegment
): Promise<CoachGuidance[]> {
  const guidances: CoachGuidance[] = [];

  // 1. Safety check on client's statement
  if (segment.speaker === "client") {
    const safety = safetyCheck(segment.text);
    
    if (!safety.safe) {
      if (safety.type === "crisis") {
        guidances.push({
          type: "crisis",
          priority: "urgent",
          message: `🚨 CRISIS SIGNAL: Client mentioned potential harm. Recommend: Acknowledge concern, provide crisis resources (988), consider immediate escalation.`,
          context: segment.text,
        });
      } else if (safety.type === "restricted-domain") {
        guidances.push({
          type: "alert",
          priority: "high",
          message: `⚠️ Client entering ${safety.category}. Stay in wellness coaching scope. Redirect to appropriate professional if needed.`,
          context: segment.text,
        });
      }
    }
  }

  // 2. Check if coach's response is approaching prohibited territory
  if (segment.speaker === "coach") {
    const safety = safetyCheck(segment.text);
    
    if (!safety.safe) {
      guidances.push({
        type: "alert",
        priority: "urgent",
        message: `⚠️ COMPLIANCE ALERT: You're approaching ${safety.category}. ${safety.output}`,
        context: segment.text,
      });
    }
  }

  // 3. Get AI suggestions for coach (only for client statements)
  if (segment.speaker === "client") {
    const suggestions = await generateCoachSuggestions(sessionContext, segment);
    guidances.push(...suggestions);
  }

  // 4. Save transcript segment to database
  await saveTranscriptSegment(sessionContext.sessionId, segment);

  // 5. Save guidances to database
  for (const guidance of guidances) {
    await saveCoachGuidance(sessionContext.sessionId, guidance);
  }

  return guidances;
}

/**
 * Generate AI suggestions for the coach based on client's statement
 */
async function generateCoachSuggestions(
  sessionContext: SessionContext,
  segment: TranscriptSegment
): Promise<CoachGuidance[]> {
  const guidances: CoachGuidance[] = [];

  try {
    // Get recent conversation context
    const recentTranscript = await getRecentTranscript(sessionContext.sessionId, 10);
    
    // Get similar cases
    const similarCasesData = await findSimilarCases(segment.text);

    // Build context for AI
    const contextPrompt = `
**SESSION CONTEXT:**
Client: ${sessionContext.clientName}
Goals: ${sessionContext.clientGoals.join(", ")}
Previous Sessions: ${sessionContext.previousSessions}
${sessionContext.lastSessionSummary ? `Last Session: ${sessionContext.lastSessionSummary}` : ""}

**RECENT CONVERSATION:**
${recentTranscript}

**CLIENT JUST SAID:**
"${segment.text}"

**SIMILAR CASES:**
${similarCasesData.map((c, i) => `${i + 1}. ${c.situation} → ${c.outcome} (${c.technique})`).join("\n")}

Provide 2-3 brief, actionable suggestions for the coach. Focus on:
1. What question to ask next
2. What technique to use
3. Any concerns or opportunities you notice
`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: COACH_ASSISTANT_SYSTEM_PROMPT },
        { role: "user", content: contextPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const aiSuggestion = typeof content === 'string' ? content : '';

    if (aiSuggestion) {
      // Parse AI response into structured guidances
      const lines = aiSuggestion.split("\n").filter((l) => l.trim());
      
      for (const line of lines) {
        if (line.includes("**Suggest**") || line.includes("**Question**")) {
          guidances.push({
            type: "suggest",
            priority: "medium",
            message: line.replace(/\*\*/g, "").trim(),
          });
        } else if (line.includes("**Alert**") || line.includes("⚠️")) {
          guidances.push({
            type: "alert",
            priority: "high",
            message: line.replace(/\*\*/g, "").trim(),
          });
        } else if (line.includes("**Reference**") || line.includes("Similar")) {
          guidances.push({
            type: "reference",
            priority: "low",
            message: line.replace(/\*\*/g, "").trim(),
          });
        } else if (line.includes("**Technique**") || line.includes("Try:")) {
          guidances.push({
            type: "technique",
            priority: "medium",
            message: line.replace(/\*\*/g, "").trim(),
          });
        }
      }
    }
  } catch (error) {
    console.error("[Coach Assistant] Failed to generate suggestions:", error);
  }

  return guidances;
}

/**
 * Get recent transcript for context
 */
async function getRecentTranscript(sessionId: number, count: number = 10): Promise<string> {
  const db = await getDb();
  if (!db) return "";

  try {
    const segments = await db
      .select()
      .from(liveSessionTranscripts)
      .where(eq(liveSessionTranscripts.sessionId, sessionId))
      .orderBy(desc(liveSessionTranscripts.timestamp))
      .limit(count);

    return segments
      .reverse()
      .map((s) => `${s.speaker === "client" ? "Client" : "Coach"}: ${s.text}`)
      .join("\n");
  } catch (error) {
    console.error("[Coach Assistant] Failed to get recent transcript:", error);
    return "";
  }
}

/**
 * Find similar cases from the database
 */
async function findSimilarCases(clientStatement: string): Promise<Array<{
  situation: string;
  outcome: string;
  technique: string;
}>> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Simple keyword matching for MVP
    // TODO: Implement vector similarity search for better matching
    const keywords = clientStatement.toLowerCase().split(" ").filter((w) => w.length > 4);
    
    const cases = await db
      .select()
      .from(similarCases)
      .limit(3);

    return cases.map((c) => ({
      situation: c.caseDescription,
      outcome: c.outcome || "Positive progress",
      technique: c.interventions || "Active listening",
    }));
  } catch (error) {
    console.error("[Coach Assistant] Failed to find similar cases:", error);
    return [];
  }
}

/**
 * Save transcript segment to database
 */
async function saveTranscriptSegment(sessionId: number, segment: TranscriptSegment): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(liveSessionTranscripts).values({
      sessionId,
      speaker: segment.speaker,
      text: segment.text,
      timestamp: segment.timestamp,
    });
  } catch (error) {
    console.error("[Coach Assistant] Failed to save transcript:", error);
  }
}

/**
 * Save coach guidance to database
 */
async function saveCoachGuidance(sessionId: number, guidance: CoachGuidance): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(coachGuidance).values({
      sessionId,
      guidanceType: guidance.type,
      priority: guidance.priority,
      message: guidance.message,
      context: guidance.context || null,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("[Coach Assistant] Failed to save guidance:", error);
  }
}

/**
 * Generate post-session AI summary
 */
export async function generateSessionSummary(sessionId: number): Promise<{
  summary: string;
  keyInsights: string[];
  breakthroughs: string[];
  concerns: string[];
  recommendations: string[];
  coachPerformance: string;
}> {
  const db = await getDb();
  if (!db) {
    return {
      summary: "Unable to generate summary",
      keyInsights: [],
      breakthroughs: [],
      concerns: [],
      recommendations: [],
      coachPerformance: "",
    };
  }

  try {
    // Get full transcript
    const transcript = await getRecentTranscript(sessionId, 1000);
    
    // Get all guidances
    const guidances = await db
      .select()
      .from(coachGuidance)
      .where(eq(coachGuidance.sessionId, sessionId))
      .orderBy(desc(coachGuidance.timestamp));

    const summaryPrompt = `
**FULL SESSION TRANSCRIPT:**
${transcript}

**AI GUIDANCES PROVIDED:**
${guidances.map((g) => `[${g.guidanceType}] ${g.message}`).join("\n")}

Generate a comprehensive post-session summary in JSON format:
{
  "summary": "2-3 sentence overview of the session",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "breakthroughs": ["breakthrough 1", "breakthrough 2"],
  "concerns": ["concern 1", "concern 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "coachPerformance": "Brief feedback on coach's performance and areas for improvement"
}
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert coaching supervisor analyzing session transcripts to provide actionable insights.",
        },
        { role: "user", content: summaryPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "session_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              keyInsights: { type: "array", items: { type: "string" } },
              breakthroughs: { type: "array", items: { type: "string" } },
              concerns: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              coachPerformance: { type: "string" },
            },
            required: ["summary", "keyInsights", "breakthroughs", "concerns", "recommendations", "coachPerformance"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    const contentString = typeof content === 'string' ? content : '{}';
    return JSON.parse(contentString);
  } catch (error) {
    console.error("[Coach Assistant] Failed to generate session summary:", error);
    return {
      summary: "Error generating summary",
      keyInsights: [],
      breakthroughs: [],
      concerns: [],
      recommendations: [],
      coachPerformance: "",
    };
  }
}
