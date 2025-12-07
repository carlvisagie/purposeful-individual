/**
 * CONTENT MODERATION & AI SAFETY SYSTEM
 * 
 * Enterprise-grade content moderation with self-learning capabilities
 * Protects against legal, ethical, financial, and reputational risks
 * 
 * COMPLIANCE FRAMEWORKS:
 * - HIPAA (Health Insurance Portability and Accountability Act)
 * - GDPR (General Data Protection Regulation)
 * - Professional Liability Protection
 * - Insurance Requirements
 * - Brand Safety
 * 
 * CORE PRINCIPLES:
 * 1. Self-Learning: Automatically updates from flagged content
 * 2. Multi-Layered: Pre-filter, real-time, post-analysis
 * 3. Context-Aware: Understands coaching vs therapy boundaries
 * 4. Evolving: Learns new patterns and threats
 * 5. Auditable: Complete trail for legal protection
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// ============================================================================
// FORBIDDEN CONTENT DICTIONARY (Self-Learning)
// ============================================================================

export const forbiddenContentDictionary = mysqlTable("forbidden_content_dictionary", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Content Details
  contentType: mysqlEnum("content_type", [
    "word",
    "phrase",
    "pattern",
    "domain",
    "topic",
    "context"
  ]).notNull(),
  
  content: text("content").notNull(), // The actual forbidden content
  pattern: text("pattern"), // Regex pattern for matching
  
  // Risk Category
  riskCategory: mysqlEnum("risk_category", [
    "legal_liability",
    "medical_advice",
    "psychiatric_advice",
    "financial_advice",
    "crisis_intervention",
    "sexual_content",
    "violence",
    "hate_speech",
    "criminal_activity",
    "brand_damage",
    "professional_boundary",
    "insurance_violation",
    "hipaa_violation",
    "gdpr_violation",
    "emotional_dependency",
    "manipulation",
    "misinformation",
    "spam",
    "harassment"
  ]).notNull(),
  
  // Severity
  severityLevel: mysqlEnum("severity_level", [
    "critical", // Immediate block, legal risk
    "high", // Block, professional risk
    "medium", // Flag for review
    "low" // Log only
  ]).notNull(),
  
  // Action
  action: mysqlEnum("action", [
    "hard_block", // Prevent message entirely
    "soft_block", // Warn and redirect
    "flag_review", // Allow but flag for human review
    "log_only" // Track but allow
  ]).notNull(),
  
  // Source
  source: mysqlEnum("source", [
    "manual", // Added by admin
    "ai_detected", // Detected by AI
    "user_report", // Reported by user
    "pattern_learning", // Learned from patterns
    "regulatory_update", // From legal/compliance update
    "incident_response" // Added after incident
  ]).notNull(),
  
  // Learning Data
  detectionCount: int("detection_count").default(0), // How many times detected
  falsePositiveCount: int("false_positive_count").default(0), // How many false positives
  truePositiveCount: int("true_positive_count").default(0), // How many true positives
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // % accuracy
  
  // Status
  active: boolean("active").default(true),
  
  // Metadata
  description: text("description"), // Why this is forbidden
  legalBasis: text("legal_basis"), // Legal reason (HIPAA, etc.)
  redirectMessage: text("redirect_message"), // What to tell user
  
  // Version Control
  version: int("version").default(1),
  replacedBy: varchar("replaced_by", { length: 255 }), // If updated
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }),
});

// ============================================================================
// CONTENT MODERATION LOGS
// ============================================================================

export const contentModerationLogs = mysqlTable("content_moderation_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // User & Session
  userId: varchar("user_id", { length: 255 }),
  sessionId: varchar("session_id", { length: 255 }),
  
  // Content
  originalContent: text("original_content").notNull(),
  contentHash: varchar("content_hash", { length: 255 }), // For deduplication
  
  // Detection
  detectedViolations: text("detected_violations"), // JSON: array of violations
  matchedRules: text("matched_rules"), // JSON: which rules triggered
  
  // Risk Assessment
  riskScore: int("risk_score"), // 0-100
  riskCategory: varchar("risk_category", { length: 100 }),
  severityLevel: mysqlEnum("severity_level", ["critical", "high", "medium", "low"]),
  
  // Action Taken
  actionTaken: mysqlEnum("action_taken", [
    "blocked",
    "redirected",
    "flagged",
    "allowed",
    "escalated"
  ]).notNull(),
  
  // Response
  userResponse: text("user_response"), // What we told the user
  
  // Context
  conversationContext: text("conversation_context"), // Previous messages
  userIntent: text("user_intent"), // AI-detected intent
  
  // Review
  requiresHumanReview: boolean("requires_human_review").default(false),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  reviewedAt: timestamp("reviewed_at"),
  reviewDecision: mysqlEnum("review_decision", [
    "confirmed_violation",
    "false_positive",
    "needs_escalation",
    "user_educated"
  ]),
  reviewNotes: text("review_notes"),
  
  // Learning
  feedbackProvided: boolean("feedback_provided").default(false),
  improvedAccuracy: boolean("improved_accuracy").default(false),
  
  detectedAt: timestamp("detected_at").defaultNow(),
});

// ============================================================================
// AI SAFETY RULES (Dynamic System Prompts)
// ============================================================================

export const aiSafetyRules = mysqlTable("ai_safety_rules", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Rule Details
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  ruleType: mysqlEnum("rule_type", [
    "boundary_enforcement",
    "crisis_detection",
    "compliance_check",
    "ethical_guideline",
    "brand_protection",
    "professional_standard"
  ]).notNull(),
  
  // Rule Content
  systemPromptAddition: text("system_prompt_addition"), // Added to AI system prompt
  validationLogic: text("validation_logic"), // How to validate
  
  // Scope
  appliesTo: mysqlEnum("applies_to", [
    "all_ai_interactions",
    "coaching_sessions",
    "ai_coach_only",
    "community_posts",
    "journal_entries",
    "chat_messages"
  ]).notNull(),
  
  // Priority
  priority: int("priority").default(100), // Higher = more important
  
  // Status
  active: boolean("active").default(true),
  
  // Effectiveness
  violationsPrevented: int("violations_prevented").default(0),
  effectiveness: decimal("effectiveness", { precision: 5, scale: 2 }), // %
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// BRAND SAFETY KEYWORDS
// ============================================================================

export const brandSafetyKeywords = mysqlTable("brand_safety_keywords", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Keyword
  keyword: varchar("keyword", { length: 500 }).notNull(),
  keywordType: mysqlEnum("keyword_type", [
    "brand_damaging",
    "competitor_mention",
    "negative_sentiment",
    "lawsuit_risk",
    "pr_crisis",
    "customer_complaint",
    "refund_request",
    "cancellation_intent"
  ]).notNull(),
  
  // Risk
  riskLevel: mysqlEnum("risk_level", ["critical", "high", "medium", "low"]).notNull(),
  
  // Action
  alertTeam: boolean("alert_team").default(false),
  escalateToHuman: boolean("escalate_to_human").default(false),
  
  // Context
  context: text("context"), // When this is/isn't a problem
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// COMPLIANCE CHECKPOINTS
// ============================================================================

export const complianceCheckpoints = mysqlTable("compliance_checkpoints", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Checkpoint Details
  checkpointName: varchar("checkpoint_name", { length: 255 }).notNull(),
  complianceFramework: mysqlEnum("compliance_framework", [
    "hipaa",
    "gdpr",
    "professional_liability",
    "insurance_requirements",
    "state_regulations",
    "industry_standards"
  ]).notNull(),
  
  // Requirement
  requirement: text("requirement").notNull(),
  validationCriteria: text("validation_criteria"), // How to check compliance
  
  // Enforcement
  mandatory: boolean("mandatory").default(true),
  
  // Violation Handling
  violationSeverity: mysqlEnum("violation_severity", ["critical", "high", "medium", "low"]),
  violationAction: text("violation_action"), // What to do if violated
  
  // Documentation
  legalReference: text("legal_reference"), // Citation of law/regulation
  documentationRequired: text("documentation_required"), // What docs needed
  
  // Audit
  lastAuditDate: timestamp("last_audit_date"),
  nextAuditDate: timestamp("next_audit_date"),
  auditFrequency: mysqlEnum("audit_frequency", ["daily", "weekly", "monthly", "quarterly", "annually"]),
  
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// PATTERN LEARNING ENGINE
// ============================================================================

export const patternLearning = mysqlTable("pattern_learning", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Pattern Details
  patternType: mysqlEnum("pattern_type", [
    "violation_pattern",
    "user_behavior_pattern",
    "crisis_indicator_pattern",
    "manipulation_pattern",
    "spam_pattern"
  ]).notNull(),
  
  // Pattern Data
  patternSignature: text("pattern_signature"), // What the pattern looks like
  detectionAlgorithm: text("detection_algorithm"), // How to detect
  
  // Learning Metrics
  occurrences: int("occurrences").default(0),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  
  // Evolution
  learnedFrom: text("learned_from"), // JSON: source incidents
  improvedBy: text("improved_by"), // JSON: refinements
  
  // Status
  validated: boolean("validated").default(false),
  active: boolean("active").default(false), // Only active after validation
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// CRISIS INTERVENTION LOGS
// ============================================================================

export const crisisInterventionLogs = mysqlTable("crisis_intervention_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // User
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Crisis Details
  crisisType: mysqlEnum("crisis_type", [
    "suicide_ideation",
    "self_harm",
    "violence_threat",
    "severe_distress",
    "psychotic_episode",
    "substance_abuse_crisis"
  ]).notNull(),
  
  // Detection
  detectedContent: text("detected_content"),
  crisisIndicators: text("crisis_indicators"), // JSON: what triggered
  riskLevel: mysqlEnum("risk_level", ["imminent", "high", "moderate", "low"]).notNull(),
  
  // Response
  responseProvided: text("response_provided"),
  resourcesOffered: text("resources_offered"), // JSON: hotlines, etc.
  
  // Escalation
  escalated: boolean("escalated").default(false),
  escalatedTo: varchar("escalated_to", { length: 255 }), // Who was notified
  escalatedAt: timestamp("escalated_at"),
  
  // Follow-up
  followUpRequired: boolean("follow_up_required").default(true),
  followUpCompleted: boolean("follow_up_completed").default(false),
  followUpNotes: text("follow_up_notes"),
  
  // Outcome
  outcome: mysqlEnum("outcome", [
    "user_safe",
    "emergency_services_contacted",
    "referred_to_professional",
    "user_unresponsive",
    "false_alarm"
  ]),
  
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// ============================================================================
// PROFESSIONAL BOUNDARY VIOLATIONS
// ============================================================================

export const professionalBoundaryViolations = mysqlTable("professional_boundary_violations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Violation Details
  violationType: mysqlEnum("violation_type", [
    "therapy_vs_coaching",
    "medical_advice",
    "legal_advice",
    "financial_advice",
    "dual_relationship",
    "emotional_dependency",
    "inappropriate_disclosure",
    "scope_of_practice"
  ]).notNull(),
  
  // Context
  conversationId: varchar("conversation_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }),
  coachId: varchar("coach_id", { length: 255 }),
  
  // Content
  violatingContent: text("violating_content"),
  context: text("context"),
  
  // Detection
  detectedBy: mysqlEnum("detected_by", ["ai", "human_review", "user_report", "compliance_audit"]),
  
  // Severity
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
  
  // Response
  correctionProvided: text("correction_provided"),
  educationProvided: text("education_provided"),
  
  // Accountability
  coachNotified: boolean("coach_notified").default(false),
  trainingRequired: boolean("training_required").default(false),
  
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// ============================================================================
// SAFETY ANALYTICS
// ============================================================================

export const safetyAnalytics = mysqlTable("safety_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Time Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Metrics
  totalInteractions: int("total_interactions"),
  violationsDetected: int("violations_detected"),
  violationRate: decimal("violation_rate", { precision: 5, scale: 2 }), // %
  
  // By Category
  legalViolations: int("legal_violations"),
  ethicalViolations: int("ethical_violations"),
  brandSafetyIssues: int("brand_safety_issues"),
  crisisInterventions: int("crisis_interventions"),
  
  // Actions
  contentBlocked: int("content_blocked"),
  contentFlagged: int("content_flagged"),
  usersEscalated: int("users_escalated"),
  
  // Accuracy
  falsePositiveRate: decimal("false_positive_rate", { precision: 5, scale: 2 }),
  falseNegativeRate: decimal("false_negative_rate", { precision: 5, scale: 2 }),
  
  // Learning
  newPatternsDetected: int("new_patterns_detected"),
  rulesUpdated: int("rules_updated"),
  dictionaryExpanded: int("dictionary_expanded"),
  
  generatedAt: timestamp("generated_at").defaultNow(),
});
