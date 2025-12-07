/**
 * SEED SAFETY RULES
 * 
 * Populates the forbidden content dictionary with initial rules
 * This runs once on first deployment to establish baseline safety
 */

import { db } from "../db";
import { forbiddenContentDictionary, aiSafetyRules, brandSafetyKeywords, complianceCheckpoints } from "../../drizzle/contentModerationSchema";
import { nanoid } from "nanoid";

export async function seedSafetyRules() {
  console.log("🛡️ Seeding AI Safety Rules...");

  // ============================================================================
  // FORBIDDEN CONTENT DICTIONARY
  // ============================================================================

  const forbiddenContent = [
    // CRITICAL - Medical/Psychiatric
    {
      contentType: "phrase" as const,
      content: "diagnose me",
      riskCategory: "medical_advice" as const,
      severityLevel: "critical" as const,
      action: "hard_block" as const,
      source: "manual" as const,
      description: "User requesting medical diagnosis",
      legalBasis: "Professional scope of practice - coaching vs. medical practice",
      redirectMessage: "I can help with wellness strategies, but I can't provide medical guidance. Please consult a qualified medical professional.",
    },
    {
      contentType: "phrase" as const,
      content: "what medication should I take",
      riskCategory: "medical_advice" as const,
      severityLevel: "critical" as const,
      action: "hard_block" as const,
      source: "manual" as const,
      description: "User requesting medication advice",
      legalBasis: "Medical practice act - only licensed physicians can prescribe",
      redirectMessage: "Medication decisions must be made with a licensed medical professional.",
    },
    {
      contentType: "phrase" as const,
      content: "am I depressed",
      riskCategory: "psychiatric_advice" as const,
      severityLevel: "critical" as const,
      action: "hard_block" as const,
      source: "manual" as const,
      description: "User requesting mental health diagnosis",
      legalBasis: "Mental health professional scope of practice",
      redirectMessage: "I can support general wellness, but I can't diagnose mental health conditions. Please consult a licensed mental health professional.",
    },

    // CRITICAL - Crisis/Safety
    {
      contentType: "phrase" as const,
      content: "kill myself",
      riskCategory: "crisis_intervention" as const,
      severityLevel: "critical" as const,
      action: "hard_block" as const,
      source: "manual" as const,
      description: "Suicide ideation",
      legalBasis: "Duty to warn/protect - crisis intervention required",
      redirectMessage: "Please contact 988 (Suicide & Crisis Lifeline) or 911 immediately.",
    },
    {
      contentType: "phrase" as const,
      content: "want to die",
      riskCategory: "crisis_intervention" as const,
      severityLevel: "critical" as const,
      action: "hard_block" as const,
      source: "manual" as const,
      description: "Suicide ideation",
      legalBasis: "Duty to warn/protect",
      redirectMessage: "Please contact 988 (Suicide & Crisis Lifeline) or 911 immediately.",
    },
    {
      contentType: "phrase" as const,
      content: "hurt myself",
      riskCategory: "crisis_intervention" as const,
      severityLevel: "critical" as const,
      action: "hard_block" as const,
      source: "manual" as const,
      description: "Self-harm ideation",
      legalBasis: "Duty to warn/protect",
      redirectMessage: "Please contact 988 (Suicide & Crisis Lifeline) or 911 immediately.",
    },

    // HIGH - Legal/Financial
    {
      contentType: "phrase" as const,
      content: "legal advice",
      riskCategory: "legal_liability" as const,
      severityLevel: "high" as const,
      action: "soft_block" as const,
      source: "manual" as const,
      description: "User requesting legal advice",
      legalBasis: "Unauthorized practice of law",
      redirectMessage: "I can help with mindset and strategy, but I can't provide legal advice. Please consult a licensed attorney.",
    },
    {
      contentType: "phrase" as const,
      content: "financial advice",
      riskCategory: "financial_advice" as const,
      severityLevel: "high" as const,
      action: "soft_block" as const,
      source: "manual" as const,
      description: "User requesting financial advice",
      legalBasis: "SEC regulations - investment advice requires license",
      redirectMessage: "I can help with financial mindset and habits, but I can't provide financial advice. Please consult a licensed financial advisor.",
    },

    // HIGH - Professional Boundaries
    {
      contentType: "phrase" as const,
      content: "therapy session",
      riskCategory: "professional_boundary" as const,
      severityLevel: "high" as const,
      action: "soft_block" as const,
      source: "manual" as const,
      description: "User expecting therapy instead of coaching",
      legalBasis: "Professional scope of practice - coaching vs. therapy",
      redirectMessage: "This is wellness coaching, not therapy. For therapeutic support, please consult a licensed therapist.",
    },
    {
      contentType: "phrase" as const,
      content: "psychotherapy",
      riskCategory: "professional_boundary" as const,
      severityLevel: "high" as const,
      action: "soft_block" as const,
      source: "manual" as const,
      description: "User requesting psychotherapy",
      legalBasis: "Mental health professional licensing",
      redirectMessage: "I provide wellness coaching, not psychotherapy. Please consult a licensed therapist for psychotherapy.",
    },

    // MEDIUM - Inappropriate Content
    {
      contentType: "phrase" as const,
      content: "sexual content",
      riskCategory: "sexual_content" as const,
      severityLevel: "medium" as const,
      action: "soft_block" as const,
      source: "manual" as const,
      description: "Sexual content",
      legalBasis: "Professional boundaries and brand safety",
      redirectMessage: "I can't discuss sexual content. Let's refocus on your wellness goals.",
    },

    // MEDIUM - Violence/Harm
    {
      contentType: "phrase" as const,
      content: "hurt someone",
      riskCategory: "violence" as const,
      severityLevel: "high" as const,
      action: "hard_block" as const,
      source: "manual" as const,
      description: "Violence threat",
      legalBasis: "Duty to warn - Tarasoff principle",
      redirectMessage: "I can't engage with content involving violence. If you're in danger or someone else is, please contact emergency services immediately.",
    },

    // MEDIUM - Manipulation
    {
      contentType: "phrase" as const,
      content: "how to manipulate",
      riskCategory: "manipulation" as const,
      severityLevel: "medium" as const,
      action: "soft_block" as const,
      source: "manual" as const,
      description: "Manipulation tactics",
      legalBasis: "Ethical coaching standards",
      redirectMessage: "I can't help with manipulation tactics. Coaching is about authentic growth and healthy relationships.",
    },
  ];

  for (const item of forbiddenContent) {
    await db.insert(forbiddenContentDictionary).values({
      id: nanoid(),
      ...item,
      detectionCount: 0,
      falsePositiveCount: 0,
      truePositiveCount: 0,
      active: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
    });
  }

  console.log(`✅ Added ${forbiddenContent.length} forbidden content rules`);

  // ============================================================================
  // AI SAFETY RULES (System Prompts)
  // ============================================================================

  const safetyRules = [
    {
      ruleName: "Coaching vs Therapy Boundary",
      ruleType: "boundary_enforcement" as const,
      systemPromptAddition: `You are a WELLNESS COACH, not a therapist. You MUST:
- Focus on goals, habits, mindset, and lifestyle
- Redirect therapy/diagnosis requests to licensed professionals
- Never diagnose mental health conditions
- Never provide medical or psychiatric advice
- Maintain professional boundaries at all times`,
      appliesTo: "all_ai_interactions" as const,
      priority: 100,
      active: true,
    },
    {
      ruleName: "Crisis Detection Protocol",
      ruleType: "crisis_detection" as const,
      systemPromptAddition: `If you detect ANY crisis indicators (suicide, self-harm, violence):
1. IMMEDIATELY provide crisis resources (988, 911)
2. DO NOT attempt to counsel or intervene
3. Escalate to human immediately
4. Log the interaction for follow-up`,
      appliesTo: "all_ai_interactions" as const,
      priority: 100,
      active: true,
    },
    {
      ruleName: "HIPAA Compliance",
      ruleType: "compliance_check" as const,
      systemPromptAddition: `NEVER request or store:
- Social Security Numbers
- Medical record numbers
- Health plan beneficiary numbers
- Account numbers
- Certificate/license numbers
- Vehicle identifiers
- Device identifiers
- Biometric identifiers
- Full face photos
- Any other unique identifying information beyond name/email`,
      appliesTo: "all_ai_interactions" as const,
      priority: 95,
      active: true,
    },
    {
      ruleName: "Professional Liability Protection",
      ruleType: "ethical_guideline" as const,
      systemPromptAddition: `NEVER:
- Make promises of specific outcomes
- Guarantee results
- Claim to cure or treat medical/mental health conditions
- Provide advice outside coaching scope
- Create emotional dependency
- Engage in dual relationships`,
      appliesTo: "coaching_sessions" as const,
      priority: 90,
      active: true,
    },
    {
      ruleName: "Brand Protection",
      ruleType: "brand_protection" as const,
      systemPromptAddition: `Maintain Purposeful Live Coaching brand standards:
- Professional, empowering, evidence-based
- Trauma-informed but not trauma therapy
- Goal-oriented and action-focused
- Respectful and boundaried
- Never controversial, political, or divisive`,
      appliesTo: "all_ai_interactions" as const,
      priority: 80,
      active: true,
    },
  ];

  for (const rule of safetyRules) {
    await db.insert(aiSafetyRules).values({
      id: nanoid(),
      ...rule,
      violationsPrevented: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log(`✅ Added ${safetyRules.length} AI safety rules`);

  // ============================================================================
  // BRAND SAFETY KEYWORDS
  // ============================================================================

  const brandKeywords = [
    {
      keyword: "refund",
      keywordType: "refund_request" as const,
      riskLevel: "medium" as const,
      alertTeam: true,
      escalateToHuman: true,
    },
    {
      keyword: "cancel subscription",
      keywordType: "cancellation_intent" as const,
      riskLevel: "medium" as const,
      alertTeam: true,
      escalateToHuman: true,
    },
    {
      keyword: "scam",
      keywordType: "brand_damaging" as const,
      riskLevel: "high" as const,
      alertTeam: true,
      escalateToHuman: true,
    },
    {
      keyword: "lawsuit",
      keywordType: "lawsuit_risk" as const,
      riskLevel: "critical" as const,
      alertTeam: true,
      escalateToHuman: true,
    },
  ];

  for (const keyword of brandKeywords) {
    await db.insert(brandSafetyKeywords).values({
      id: nanoid(),
      ...keyword,
      active: true,
      createdAt: new Date(),
    });
  }

  console.log(`✅ Added ${brandKeywords.length} brand safety keywords`);

  // ============================================================================
  // COMPLIANCE CHECKPOINTS
  // ============================================================================

  const complianceChecks = [
    {
      checkpointName: "HIPAA - No PHI Collection",
      complianceFramework: "hipaa" as const,
      requirement: "Do not collect Protected Health Information (PHI) without proper authorization",
      validationCriteria: "No SSN, medical records, health plan numbers, or other HIPAA identifiers",
      mandatory: true,
      violationSeverity: "critical" as const,
      violationAction: "Immediately delete data and notify compliance officer",
      legalReference: "HIPAA Privacy Rule 45 CFR 164.502",
      auditFrequency: "monthly" as const,
    },
    {
      checkpointName: "GDPR - User Consent",
      complianceFramework: "gdpr" as const,
      requirement: "Obtain explicit consent before processing personal data",
      validationCriteria: "Consent checkbox checked, timestamp recorded, purpose clearly stated",
      mandatory: true,
      violationSeverity: "critical" as const,
      violationAction: "Stop processing, obtain consent, or delete data",
      legalReference: "GDPR Article 6, Article 7",
      auditFrequency: "monthly" as const,
    },
    {
      checkpointName: "Professional Liability - Scope of Practice",
      complianceFramework: "professional_liability" as const,
      requirement: "Stay within wellness coaching scope - no therapy, medical, or legal advice",
      validationCriteria: "All AI responses reviewed for boundary violations",
      mandatory: true,
      violationSeverity: "high" as const,
      violationAction: "Immediate correction, user education, coach notification",
      legalReference: "Professional coaching standards and state regulations",
      auditFrequency: "weekly" as const,
    },
  ];

  for (const checkpoint of complianceChecks) {
    await db.insert(complianceCheckpoints).values({
      id: nanoid(),
      ...checkpoint,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log(`✅ Added ${complianceChecks.length} compliance checkpoints`);

  console.log("🎉 Safety rules seeding complete!");
}

// Run if called directly
if (require.main === module) {
  seedSafetyRules()
    .then(() => {
      console.log("✅ Seeding complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
