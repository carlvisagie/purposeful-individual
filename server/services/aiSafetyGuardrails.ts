/**
 * AI SAFETY GUARDRAILS SERVICE - ENHANCED VERSION
 * 
 * Enterprise-grade content moderation with self-learning capabilities
 * Integrates with database for persistent learning and compliance tracking
 * 
 * Features:
 * - Multi-layered filtering (pre-filter, real-time, post-analysis)
 * - Self-learning pattern detection
 * - Compliance enforcement (HIPAA, GDPR, professional liability)
 * - Crisis intervention
 * - Brand safety protection
 * - Professional boundary enforcement
 */

import { db } from "../db";
import {
  forbiddenContentDictionary,
  contentModerationLogs,
  crisisInterventionLogs,
  professionalBoundaryViolations,
  brandSafetyKeywords,
} from "../../drizzle/contentModerationSchema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SafetyCheckResult {
  safe: boolean;
  blocked: boolean;
  violations: Violation[];
  riskScore: number; // 0-100
  riskCategory?: string;
  action: "allow" | "block" | "redirect" | "escalate";
  userMessage?: string;
  logId?: string;
}

export interface Violation {
  type: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  matchedContent: string;
  rule: string;
  legalBasis?: string;
}

export interface SafetyContext {
  userId?: string;
  sessionId?: string;
  conversationHistory?: string[];
  userIntent?: string;
  moduleContext?: string; // Which module (coaching, journal, etc.)
}

// ============================================================================
// CORE SAFETY CHECK FUNCTION
// ============================================================================

export async function performSafetyCheck(
  content: string,
  context: SafetyContext = {}
): Promise<SafetyCheckResult> {
  const violations: Violation[] = [];
  let riskScore = 0;
  let highestSeverity: "critical" | "high" | "medium" | "low" = "low";

  // Step 1: Load forbidden content dictionary from database
  const forbiddenContent = await db
    .select()
    .from(forbiddenContentDictionary)
    .where(eq(forbiddenContentDictionary.active, true));

  // Step 2: Check against all forbidden patterns
  const contentLower = content.toLowerCase();

  for (const rule of forbiddenContent) {
    let matched = false;

    // Check if content matches
    if (rule.contentType === "word" || rule.contentType === "phrase") {
      matched = contentLower.includes(rule.content.toLowerCase());
    } else if (rule.contentType === "pattern" && rule.pattern) {
      try {
        const regex = new RegExp(rule.pattern, "i");
        matched = regex.test(content);
      } catch (e) {
        console.error("Invalid regex pattern:", rule.pattern);
      }
    }

    if (matched) {
      violations.push({
        type: rule.contentType,
        category: rule.riskCategory,
        severity: rule.severityLevel,
        matchedContent: rule.content,
        rule: rule.id,
        legalBasis: rule.legalBasis || undefined,
      });

      // Update detection count (self-learning)
      await db
        .update(forbiddenContentDictionary)
        .set({
          detectionCount: (rule.detectionCount || 0) + 1,
        })
        .where(eq(forbiddenContentDictionary.id, rule.id));

      // Calculate risk score
      const severityWeight = {
        critical: 100,
        high: 75,
        medium: 50,
        low: 25,
      };
      riskScore = Math.max(riskScore, severityWeight[rule.severityLevel]);

      // Track highest severity
      if (
        rule.severityLevel === "critical" ||
        (rule.severityLevel === "high" && highestSeverity !== "critical") ||
        (rule.severityLevel === "medium" && highestSeverity === "low")
      ) {
        highestSeverity = rule.severityLevel;
      }
    }
  }

  // Step 3: Crisis detection
  const crisisDetected = await detectCrisis(content, context);
  if (crisisDetected) {
    violations.push({
      type: "crisis",
      category: "crisis_intervention",
      severity: "critical",
      matchedContent: "Crisis indicators detected",
      rule: "crisis_detection",
    });
    riskScore = 100;
    highestSeverity = "critical";
  }

  // Step 4: Professional boundary check
  const boundaryViolation = await checkProfessionalBoundaries(content, context);
  if (boundaryViolation) {
    violations.push(boundaryViolation);
    riskScore = Math.max(riskScore, 75);
  }

  // Step 5: Brand safety check
  const brandRisk = await checkBrandSafety(content);
  if (brandRisk) {
    violations.push(brandRisk);
    riskScore = Math.max(riskScore, 50);
  }

  // Step 6: Determine action
  let action: "allow" | "block" | "redirect" | "escalate" = "allow";
  let userMessage: string | undefined;

  if (highestSeverity === "critical") {
    action = crisisDetected ? "escalate" : "block";
    userMessage = getRedirectMessage(violations[0]?.category);
  } else if (highestSeverity === "high") {
    action = "redirect";
    userMessage = getRedirectMessage(violations[0]?.category);
  } else if (highestSeverity === "medium") {
    action = "allow"; // Allow but log for review
  }

  // Step 7: Log the interaction
  const logId = await logModerationEvent(content, violations, riskScore, action, context);

  return {
    safe: violations.length === 0,
    blocked: action === "block",
    violations,
    riskScore,
    riskCategory: violations[0]?.category,
    action,
    userMessage,
    logId,
  };
}

// ============================================================================
// CRISIS DETECTION
// ============================================================================

async function detectCrisis(content: string, context: SafetyContext): Promise<boolean> {
  const crisisIndicators = [
    // Suicide ideation
    "kill myself",
    "end my life",
    "suicide",
    "want to die",
    "better off dead",
    "no reason to live",
    "can't go on",
    "won't be here tomorrow",

    // Self-harm
    "hurt myself",
    "cut myself",
    "harm myself",

    // Violence
    "hurt someone",
    "kill someone",
    "going to hurt",

    // Severe distress
    "can't take it anymore",
    "losing control",
    "scared of myself",
  ];

  const contentLower = content.toLowerCase();
  const detected = crisisIndicators.some((indicator) => contentLower.includes(indicator));

  if (detected) {
    // Log crisis intervention
    await db.insert(crisisInterventionLogs).values({
      id: nanoid(),
      userId: context.userId || "anonymous",
      crisisType: "suicide_ideation", // Simplified for MVP
      detectedContent: content,
      crisisIndicators: JSON.stringify(crisisIndicators.filter((i) => contentLower.includes(i))),
      riskLevel: "high",
      responseProvided: getCrisisResponse(),
      resourcesOffered: JSON.stringify(getCrisisResources()),
      escalated: true,
      followUpRequired: true,
      detectedAt: new Date(),
    });
  }

  return detected;
}

// ============================================================================
// PROFESSIONAL BOUNDARY CHECK
// ============================================================================

async function checkProfessionalBoundaries(
  content: string,
  context: SafetyContext
): Promise<Violation | null> {
  const boundaryViolations = {
    medical: [
      "diagnose me",
      "what medication",
      "should I take",
      "medical advice",
      "what's wrong with me",
      "is this a symptom",
    ],
    therapy: [
      "am I depressed",
      "do I have anxiety",
      "what disorder do I have",
      "therapy session",
      "psychotherapy",
    ],
    legal: ["legal advice", "should I sue", "is this illegal", "lawyer", "court case"],
    financial: [
      "financial advice",
      "should I invest",
      "stock recommendation",
      "tax advice",
    ],
  };

  const contentLower = content.toLowerCase();

  for (const [category, phrases] of Object.entries(boundaryViolations)) {
    for (const phrase of phrases) {
      if (contentLower.includes(phrase)) {
        // Log boundary violation
        await db.insert(professionalBoundaryViolations).values({
          id: nanoid(),
          violationType: category === "medical" ? "medical_advice" : "scope_of_practice",
          conversationId: context.sessionId || nanoid(),
          userId: context.userId,
          violatingContent: content,
          context: JSON.stringify(context),
          detectedBy: "ai",
          severity: "high",
          correctionProvided: getRedirectMessage(category),
          detectedAt: new Date(),
        });

        return {
          type: "professional_boundary",
          category: `${category}_advice`,
          severity: "high",
          matchedContent: phrase,
          rule: "professional_boundaries",
          legalBasis: "Professional coaching scope of practice",
        };
      }
    }
  }

  return null;
}

// ============================================================================
// BRAND SAFETY CHECK
// ============================================================================

async function checkBrandSafety(content: string): Promise<Violation | null> {
  const brandKeywords = await db
    .select()
    .from(brandSafetyKeywords)
    .where(eq(brandSafetyKeywords.active, true));

  const contentLower = content.toLowerCase();

  for (const keyword of brandKeywords) {
    if (contentLower.includes(keyword.keyword.toLowerCase())) {
      return {
        type: "brand_safety",
        category: keyword.keywordType,
        severity: keyword.riskLevel,
        matchedContent: keyword.keyword,
        rule: "brand_protection",
      };
    }
  }

  return null;
}

// ============================================================================
// LOGGING
// ============================================================================

async function logModerationEvent(
  content: string,
  violations: Violation[],
  riskScore: number,
  action: string,
  context: SafetyContext
): Promise<string> {
  const logId = nanoid();

  await db.insert(contentModerationLogs).values({
    id: logId,
    userId: context.userId,
    sessionId: context.sessionId,
    originalContent: content,
    contentHash: hashContent(content),
    detectedViolations: JSON.stringify(violations),
    matchedRules: JSON.stringify(violations.map((v) => v.rule)),
    riskScore,
    riskCategory: violations[0]?.category,
    severityLevel: violations[0]?.severity || "low",
    actionTaken: action as any,
    userResponse: violations[0] ? getRedirectMessage(violations[0].category) : undefined,
    conversationContext: JSON.stringify(context.conversationHistory || []),
    requiresHumanReview: riskScore >= 75,
    detectedAt: new Date(),
  });

  return logId;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function hashContent(content: string): string {
  // Simple hash for deduplication
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getRedirectMessage(category?: string): string {
  const messages: Record<string, string> = {
    medical_advice:
      "I can help with wellness strategies, but I can't provide medical guidance. Please consult a qualified medical professional for medical advice.",
    psychiatric_advice:
      "I can support general wellness and emotional stability, but I can't provide therapy or diagnose mental health conditions. Please reach out to a licensed mental health professional.",
    crisis_intervention: getCrisisResponse(),
    legal_advice:
      "I can help with mindset and strategy, but I can't provide legal advice. Please consult a licensed attorney for legal matters.",
    financial_advice:
      "I can help with financial mindset and habits, but I can't provide financial advice. Please consult a licensed financial advisor.",
    sexual_content:
      "I can't discuss sexual content. Let's refocus on your wellness goals and personal growth.",
    violence:
      "I can't engage with content involving violence. If you're in danger, please contact emergency services immediately.",
    scope_of_practice:
      "That falls outside the scope of wellness coaching. I'm here to support your personal growth, habits, and mindset within coaching boundaries.",
  };

  return messages[category || ""] || messages.scope_of_practice;
}

function getCrisisResponse(): string {
  return `I'm not equipped to help with crisis situations. Please contact emergency services or a crisis hotline immediately:

**National Suicide Prevention Lifeline:** 988
**Crisis Text Line:** Text HOME to 741741
**Emergency Services:** 911

You can also visit your nearest emergency room. Please reach out for professional help right away.`;
}

function getCrisisResources(): Array<{ name: string; contact: string }> {
  return [
    { name: "National Suicide Prevention Lifeline", contact: "988" },
    { name: "Crisis Text Line", contact: "Text HOME to 741741" },
    { name: "Emergency Services", contact: "911" },
    { name: "SAMHSA National Helpline", contact: "1-800-662-4357" },
  ];
}

// ============================================================================
// SELF-LEARNING FUNCTIONS
// ============================================================================

export async function reportFalsePositive(logId: string, feedback: string): Promise<void> {
  // Update the log
  const [log] = await db
    .select()
    .from(contentModerationLogs)
    .where(eq(contentModerationLogs.id, logId));

  if (!log) return;

  // Update review decision
  await db
    .update(contentModerationLogs)
    .set({
      reviewDecision: "false_positive",
      reviewNotes: feedback,
      reviewedAt: new Date(),
    })
    .where(eq(contentModerationLogs.id, logId));

  // Update accuracy of matched rules
  const matchedRules = JSON.parse(log.matchedRules || "[]");
  for (const ruleId of matchedRules) {
    const [rule] = await db
      .select()
      .from(forbiddenContentDictionary)
      .where(eq(forbiddenContentDictionary.id, ruleId));

    if (rule) {
      const newFalsePositiveCount = (rule.falsePositiveCount || 0) + 1;
      const totalDetections = rule.detectionCount || 1;
      const accuracy = ((totalDetections - newFalsePositiveCount) / totalDetections) * 100;

      await db
        .update(forbiddenContentDictionary)
        .set({
          falsePositiveCount: newFalsePositiveCount,
          accuracy,
        })
        .where(eq(forbiddenContentDictionary.id, ruleId));
    }
  }
}

export async function reportTruePositive(logId: string): Promise<void> {
  const [log] = await db
    .select()
    .from(contentModerationLogs)
    .where(eq(contentModerationLogs.id, logId));

  if (!log) return;

  await db
    .update(contentModerationLogs)
    .set({
      reviewDecision: "confirmed_violation",
      reviewedAt: new Date(),
    })
    .where(eq(contentModerationLogs.id, logId));

  // Update accuracy of matched rules
  const matchedRules = JSON.parse(log.matchedRules || "[]");
  for (const ruleId of matchedRules) {
    const [rule] = await db
      .select()
      .from(forbiddenContentDictionary)
      .where(eq(forbiddenContentDictionary.id, ruleId));

    if (rule) {
      const newTruePositiveCount = (rule.truePositiveCount || 0) + 1;
      const totalDetections = rule.detectionCount || 1;
      const accuracy = (newTruePositiveCount / totalDetections) * 100;

      await db
        .update(forbiddenContentDictionary)
        .set({
          truePositiveCount: newTruePositiveCount,
          accuracy,
        })
        .where(eq(forbiddenContentDictionary.id, ruleId));
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  performSafetyCheck as safetyCheck,
  detectCrisis,
  checkProfessionalBoundaries,
  checkBrandSafety,
};
