/**
 * AI Research Analyzer Service
 * 
 * Uses OpenAI to analyze research papers and extract:
 * - Evidence level (A/B/C based on Oxford CEBM)
 * - Study quality score
 * - Practical applicability
 * - Key findings
 * - Module relevance
 * - Recommended actions
 */

import { db } from "../db";
import { researchPapers, moduleResearchUpdates } from "../../drizzle/researchSchema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

interface ResearchAnalysis {
  evidenceLevel: "A" | "B" | "C";
  studyQuality: number; // 1-10
  practicalApplicability: number; // 1-10
  aiSummary: string;
  keyFindings: string[];
  relevantModules: string[];
  recommendedActions: {
    module: string;
    action: string;
    priority: "low" | "medium" | "high";
  }[];
  hasConflictOfInterest: boolean;
  conflictDetails?: string;
  studyType: string;
}

/**
 * Analyze a research paper using AI
 */
export async function analyzeResearchPaper(
  paperId: string
): Promise<ResearchAnalysis> {
  try {
    // Get paper from database
    const paper = await db.query.researchPapers.findFirst({
      where: (papers, { eq }) => eq(papers.id, paperId),
    });

    if (!paper) {
      throw new Error(`Paper ${paperId} not found`);
    }

    console.log(`Analyzing research paper: ${paper.title}`);

    // Build analysis prompt
    const prompt = buildAnalysisPrompt(paper);

    // Call OpenAI
    const response = await invokeLLM({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: RESEARCH_ANALYZER_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      response_format: { type: "json_object" },
    });

    // Parse AI response
    const analysis: ResearchAnalysis = JSON.parse(response);

    // Save analysis to database
    await db
      .update(researchPapers)
      .set({
        evidenceLevel: analysis.evidenceLevel,
        studyQuality: analysis.studyQuality,
        practicalApplicability: analysis.practicalApplicability,
        aiSummary: analysis.aiSummary,
        keyFindings: analysis.keyFindings,
        relevantModules: analysis.relevantModules,
        recommendedActions: analysis.recommendedActions,
        hasConflictOfInterest: analysis.hasConflictOfInterest,
        conflictDetails: analysis.conflictDetails,
        studyType: analysis.studyType,
        updatedAt: new Date(),
      })
      .where(eq(researchPapers.id, paperId));

    // Create module update suggestions
    await createModuleUpdateSuggestions(paperId, analysis);

    console.log(`Analysis complete for: ${paper.title}`);
    console.log(`Evidence Level: ${analysis.evidenceLevel}, Quality: ${analysis.studyQuality}/10`);

    return analysis;
  } catch (error) {
    console.error(`Error analyzing paper ${paperId}:`, error);
    throw error;
  }
}

/**
 * Build analysis prompt for AI
 */
function buildAnalysisPrompt(paper: any): string {
  return `
Analyze this research paper and provide a structured evaluation:

**Title:** ${paper.title}

**Authors:** ${paper.authors?.join(", ") || "Unknown"}

**Journal:** ${paper.journal || "Unknown"}

**Publication Date:** ${paper.publicationDate || "Unknown"}

**Abstract:**
${paper.abstract || "No abstract available"}

**Source:** ${paper.source}

---

Please analyze this paper and provide:

1. **Evidence Level** (Oxford CEBM standards):
   - A: Systematic review, meta-analysis, or high-quality RCT
   - B: Cohort study, case-control study, or lower-quality RCT
   - C: Case series, expert opinion, or mechanistic reasoning

2. **Study Quality Score** (1-10):
   - Sample size
   - Study design
   - Statistical rigor
   - Peer review status
   - Replication potential

3. **Practical Applicability** (1-10):
   - How easily can this be applied in real life?
   - Are the interventions accessible?
   - Are results generalizable?

4. **Plain English Summary** (2-3 sentences for non-scientists)

5. **Key Findings** (3-5 bullet points)

6. **Relevant Wellness Modules** (from our 32 modules):
   - Autism, Emotions, Anxiety, Depression, Sleep, Nutrition, Exercise, Stress, ADHD, OCD, PTSD, Bipolar, Longevity, Supplements, Pain Management, Meditation, Mindfulness, Gratitude, Relationships, Social Connection, Identity, Confidence, Boundaries, Spiritual, Meaning, Career, Financial, Habits, Addiction, Screen Time, Energy, Hydration

7. **Recommended Actions** for each relevant module:
   - What should we update?
   - Priority: low/medium/high

8. **Conflict of Interest**:
   - Does the study have industry funding or author conflicts?
   - Details if yes

9. **Study Type**:
   - RCT, meta-analysis, cohort, case-control, case series, etc.

Return your analysis as a JSON object matching this structure:
{
  "evidenceLevel": "A" | "B" | "C",
  "studyQuality": 1-10,
  "practicalApplicability": 1-10,
  "aiSummary": "string",
  "keyFindings": ["string"],
  "relevantModules": ["string"],
  "recommendedActions": [
    {
      "module": "string",
      "action": "string",
      "priority": "low" | "medium" | "high"
    }
  ],
  "hasConflictOfInterest": boolean,
  "conflictDetails": "string" (optional),
  "studyType": "string"
}
`;
}

/**
 * Create module update suggestions based on analysis
 */
async function createModuleUpdateSuggestions(
  paperId: string,
  analysis: ResearchAnalysis
): Promise<void> {
  for (const action of analysis.recommendedActions) {
    try {
      await db.insert(moduleResearchUpdates).values({
        id: `update-${paperId}-${action.module}-${Date.now()}`,
        moduleName: action.module,
        researchPaperId: paperId,
        updateType: determineUpdateType(action.action),
        updateDescription: action.action,
        isApplied: false,
        createdAt: new Date(),
      });

      console.log(`Created update suggestion for ${action.module}: ${action.action}`);
    } catch (error) {
      console.error(`Error creating update suggestion:`, error);
    }
  }
}

/**
 * Determine update type from action description
 */
function determineUpdateType(action: string): string {
  const actionLower = action.toLowerCase();

  if (actionLower.includes("new") || actionLower.includes("add")) {
    return "new_protocol";
  } else if (actionLower.includes("update") || actionLower.includes("revise")) {
    return "updated_evidence";
  } else if (actionLower.includes("remove") || actionLower.includes("deprecate")) {
    return "deprecated_intervention";
  }

  return "updated_evidence";
}

/**
 * Batch analyze all unanalyzed papers
 */
export async function analyzeAllUnanalyzedPapers(): Promise<number> {
  try {
    // Get all papers without AI analysis
    const unanalyzedPapers = await db.query.researchPapers.findMany({
      where: (papers, { isNull }) => isNull(papers.evidenceLevel),
      limit: 50, // Process in batches
    });

    console.log(`Found ${unanalyzedPapers.length} unanalyzed papers`);

    let analyzedCount = 0;

    for (const paper of unanalyzedPapers) {
      try {
        await analyzeResearchPaper(paper.id);
        analyzedCount++;

        // Rate limiting: wait 1 second between API calls
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error analyzing paper ${paper.id}:`, error);
      }
    }

    console.log(`Analyzed ${analyzedCount} papers`);
    return analyzedCount;
  } catch (error) {
    console.error("Error in batch analysis:", error);
    throw error;
  }
}

/**
 * System prompt for research analyzer
 */
const RESEARCH_ANALYZER_SYSTEM_PROMPT = `
You are a world-class research analyst specializing in health and wellness research.

Your job is to evaluate research papers using the Oxford Centre for Evidence-Based Medicine (CEBM) standards and provide actionable insights for a wellness coaching platform.

**Evidence Levels (Oxford CEBM):**
- **Level A:** Systematic reviews, meta-analyses, high-quality RCTs with large sample sizes
- **Level B:** Cohort studies, case-control studies, lower-quality RCTs
- **Level C:** Case series, expert opinion, mechanistic reasoning, small pilot studies

**Study Quality Criteria:**
- Sample size (larger = better)
- Study design (RCT > cohort > case-control > case series)
- Randomization and blinding (if applicable)
- Statistical power and significance
- Peer review status
- Replication by independent teams
- Conflict of interest disclosures

**Practical Applicability Criteria:**
- Can average people implement this?
- Are the interventions affordable and accessible?
- Are results generalizable beyond the study population?
- Are there safety concerns or contraindications?
- How strong is the effect size?

**Your Analysis Should:**
1. Be objective and evidence-based
2. Flag conflicts of interest
3. Translate complex science into plain English
4. Identify practical applications
5. Suggest specific module updates
6. Prioritize high-impact findings

**Return JSON only. No additional text.**
`;
