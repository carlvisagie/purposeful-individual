/**
 * TRUTH KEEPERS - RESEARCH VALIDATION SYSTEM
 * Ensures all platform recommendations are backed by peer-reviewed, empirical science
 * 
 * CORE PRINCIPLES:
 * - Only evidence-based, empirical science allowed
 * - Every claim must have peer-reviewed citations
 * - Research quality rated using standardized criteria
 * - Pseudoscience and unproven claims blocked
 * - Continuous monitoring for new research
 * 
 * EVIDENCE LEVELS (Based on Oxford Centre for Evidence-Based Medicine):
 * - Level A (High): Systematic reviews, meta-analyses, multiple RCTs
 * - Level B (Moderate): Individual RCTs, cohort studies, strong observational data
 * - Level C (Low): Case-control studies, expert consensus, limited evidence
 * - Level D (Insufficient): Anecdotal, single studies, not peer-reviewed → REJECTED
 * 
 * RESEARCH QUALITY CRITERIA:
 * 1. Peer-reviewed publication in reputable journal
 * 2. Adequate sample size (statistical power)
 * 3. Proper study design (RCT > cohort > case-control > case series)
 * 4. Replication (multiple independent studies)
 * 5. Effect size (clinically significant, not just p < 0.05)
 * 6. Recent research (prefer last 5-10 years)
 * 7. No conflicts of interest
 * 8. Independent verification
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// ============================================================================
// VALIDATED RESEARCH DATABASE
// ============================================================================

export const validatedResearch = mysqlTable("validated_research", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Research Details
  title: varchar("title", { length: 500 }).notNull(),
  authors: text("authors").notNull(), // JSON array
  journal: varchar("journal", { length: 255 }).notNull(),
  publicationYear: int("publication_year").notNull(),
  doi: varchar("doi", { length: 255 }), // Digital Object Identifier
  pubmedId: varchar("pubmed_id", { length: 50 }),
  url: varchar("url", { length: 500 }),
  
  // Study Type
  studyType: mysqlEnum("study_type", [
    "meta_analysis",
    "systematic_review",
    "randomized_controlled_trial",
    "cohort_study",
    "case_control_study",
    "cross_sectional_study",
    "case_series",
    "expert_opinion"
  ]).notNull(),
  
  // Evidence Level (Oxford CEBM)
  evidenceLevel: mysqlEnum("evidence_level", [
    "level_a_high",      // Systematic reviews, meta-analyses, multiple RCTs
    "level_b_moderate",  // Individual RCTs, cohort studies
    "level_c_low",       // Case-control, expert consensus
    "level_d_reject"     // Insufficient evidence - REJECTED
  ]).notNull(),
  
  // Quality Metrics
  sampleSize: int("sample_size"),
  hasControlGroup: boolean("has_control_group"),
  isRandomized: boolean("is_randomized"),
  isBlinded: boolean("is_blinded"), // Single, double, or triple blind
  hasReplication: boolean("has_replication"), // Multiple independent studies
  effectSize: decimal("effect_size", { precision: 6, scale: 3 }), // Cohen's d, odds ratio, etc.
  pValue: decimal("p_value", { precision: 10, scale: 9 }),
  confidenceInterval: varchar("confidence_interval", { length: 100 }), // "95% CI: 1.2-2.5"
  
  // Journal Quality
  journalImpactFactor: decimal("journal_impact_factor", { precision: 6, scale: 3 }),
  isPeerReviewed: boolean("is_peer_reviewed").notNull(),
  isOpenAccess: boolean("is_open_access"),
  
  // Conflicts of Interest
  hasConflictOfInterest: boolean("has_conflict_of_interest"),
  fundingSource: text("funding_source"), // Who funded the research?
  industrySponsored: boolean("industry_sponsored"),
  
  // Research Domain
  domain: mysqlEnum("domain", [
    "nutrition",
    "exercise",
    "sleep",
    "mental_health",
    "behavioral_psychology",
    "neuroscience",
    "metabolism",
    "gut_health",
    "stress_management",
    "habit_formation",
    "cognitive_performance",
    "longevity",
    "relationships",
    "spirituality",
    "career_development",
    "financial_psychology"
  ]).notNull(),
  
  // Key Findings
  keyFindings: text("key_findings").notNull(), // Summary of main results
  clinicalSignificance: text("clinical_significance"), // Is it meaningful in real life?
  limitations: text("limitations"), // What are the study's limitations?
  
  // Practical Application
  practicalApplication: text("practical_application"), // How to apply this research
  targetPopulation: text("target_population"), // Who does this apply to?
  contraindications: text("contraindications"), // When NOT to apply this
  
  // Validation Status
  validationStatus: mysqlEnum("validation_status", [
    "pending_review",
    "approved",
    "rejected",
    "needs_replication",
    "superseded" // Newer research contradicts this
  ]).default("pending_review"),
  
  // Reviewer Info
  reviewedBy: varchar("reviewed_by", { length: 255 }), // Who validated this?
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Usage Tracking
  citationCount: int("citation_count").default(0), // How many times cited on platform
  recommendationCount: int("recommendation_count").default(0), // How many recommendations use this
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// PLATFORM RECOMMENDATIONS (Linked to Research)
// ============================================================================

export const platformRecommendations = mysqlTable("platform_recommendations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Recommendation Details
  recommendationType: mysqlEnum("recommendation_type", [
    "intervention",      // "Try 4-7-8 breathing for anxiety"
    "protocol",          // "Huberman sleep protocol"
    "habit",             // "Exercise 3x per week"
    "nutrition_advice",  // "Eat 1g protein per lb bodyweight"
    "supplement",        // "Consider magnesium for sleep"
    "behavior_change",   // "Use implementation intentions"
    "mindset_shift",     // "Adopt growth mindset"
    "lifestyle_change"   // "Prioritize sleep over work"
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  howToImplement: text("how_to_implement"), // Step-by-step instructions
  
  // Evidence Backing
  evidenceLevel: mysqlEnum("evidence_level", [
    "level_a_high",
    "level_b_moderate",
    "level_c_low"
  ]).notNull(),
  
  // Research Citations (Links to validatedResearch table)
  primaryResearchId: varchar("primary_research_id", { length: 255 }).notNull(), // Main supporting study
  supportingResearchIds: text("supporting_research_ids"), // JSON array: additional studies
  
  // Confidence
  confidenceScore: int("confidence_score"), // 0-100: How confident are we in this recommendation?
  
  // Domain
  domain: varchar("domain", { length: 100 }).notNull(),
  
  // Target Audience
  targetAudience: text("target_audience"), // Who is this for?
  contraindications: text("contraindications"), // Who should NOT do this?
  
  // Effectiveness Tracking (Self-Learning)
  totalUses: int("total_uses").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // % of users who found it helpful
  avgEffectivenessRating: decimal("avg_effectiveness_rating", { precision: 4, scale: 2 }), // 1-10
  
  // Status
  status: mysqlEnum("status", [
    "active",
    "under_review",
    "deprecated",      // No longer recommended
    "superseded"       // Replaced by better recommendation
  ]).default("active"),
  
  // Superseded Info
  supersededBy: varchar("superseded_by", { length: 255 }), // ID of newer recommendation
  supersededReason: text("superseded_reason"), // Why was this replaced?
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }),
});

// ============================================================================
// RESEARCH MONITORING (Watch for New Studies)
// ============================================================================

export const researchMonitoring = mysqlTable("research_monitoring", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // What to Monitor
  topic: varchar("topic", { length: 255 }).notNull(),
  keywords: text("keywords"), // JSON array: search terms
  domain: varchar("domain", { length: 100 }),
  
  // Monitoring Config
  monitoringFrequency: mysqlEnum("monitoring_frequency", [
    "daily",
    "weekly",
    "monthly"
  ]).default("weekly"),
  
  // Alert Thresholds
  alertOnHighQuality: boolean("alert_on_high_quality").default(true), // Alert when Level A research found
  alertOnContradiction: boolean("alert_on_contradiction").default(true), // Alert when research contradicts current recommendations
  
  // Last Check
  lastCheckedAt: timestamp("last_checked_at"),
  newStudiesFound: int("new_studies_found").default(0),
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// PSEUDOSCIENCE BLOCKLIST
// ============================================================================

export const pseudoscienceBlocklist = mysqlTable("pseudoscience_blocklist", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Blocked Claim
  claim: text("claim").notNull(),
  category: mysqlEnum("category", [
    "unproven_supplement",
    "debunked_theory",
    "dangerous_practice",
    "misleading_claim",
    "anecdotal_only",
    "conflict_of_interest",
    "cherry_picked_data",
    "correlation_not_causation"
  ]).notNull(),
  
  // Why Blocked
  reason: text("reason").notNull(),
  evidenceAgainst: text("evidence_against"), // Research that debunks this
  
  // Severity
  severity: mysqlEnum("severity", [
    "dangerous",   // Could cause harm
    "misleading",  // False but not harmful
    "unproven"     // Just lacks evidence
  ]).notNull(),
  
  // Action
  action: mysqlEnum("action", [
    "hard_block",  // Never allow
    "flag_review", // Flag for human review
    "show_warning" // Allow but warn user
  ]).notNull(),
  
  // Detection
  detectionCount: int("detection_count").default(0), // How many times detected
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }),
});

// ============================================================================
// RESEARCH QUALITY REVIEWS
// ============================================================================

export const researchQualityReviews = mysqlTable("research_quality_reviews", {
  id: varchar("id", { length: 255 }).primaryKey(),
  researchId: varchar("research_id", { length: 255 }).notNull(),
  
  // Reviewer
  reviewerId: varchar("reviewer_id", { length: 255 }).notNull(),
  reviewerName: varchar("reviewer_name", { length: 255 }),
  reviewerCredentials: text("reviewer_credentials"), // PhD, MD, etc.
  
  // Quality Assessment
  methodologyScore: int("methodology_score"), // 1-10
  sampleSizeAdequate: boolean("sample_size_adequate"),
  statisticalRigor: int("statistical_rigor"), // 1-10
  clinicalRelevance: int("clinical_relevance"), // 1-10
  replicationStatus: mysqlEnum("replication_status", [
    "replicated",
    "not_replicated",
    "needs_replication",
    "unknown"
  ]),
  
  // Bias Assessment
  selectionBias: boolean("selection_bias"),
  publicationBias: boolean("publication_bias"),
  confirmationBias: boolean("confirmation_bias"),
  
  // Overall Assessment
  overallQuality: mysqlEnum("overall_quality", [
    "excellent",
    "good",
    "fair",
    "poor"
  ]).notNull(),
  
  // Recommendation
  recommendForPlatform: boolean("recommend_for_platform").notNull(),
  recommendedEvidenceLevel: mysqlEnum("recommended_evidence_level", [
    "level_a_high",
    "level_b_moderate",
    "level_c_low",
    "level_d_reject"
  ]).notNull(),
  
  // Notes
  reviewNotes: text("review_notes"),
  concerns: text("concerns"),
  
  reviewedAt: timestamp("reviewed_at").defaultNow(),
});
