/**
 * AI Script Suggestion Engine
 * 
 * Analyzes real-time transcripts to automatically detect:
 * - Client objections (cost, time, doubt)
 * - Emotional states (anxiety, fear, anger)
 * - Crisis situations (suicide, self-harm)
 * - Opportunities (upgrade, testimonial)
 * 
 * Suggests appropriate coaching scripts with confidence scores
 * Provides legal/ethical guardrails
 * Tracks conversation flow and context
 */

import { coachingScripts, CoachingScript, getScriptByTrigger } from "@shared/coachingScripts";
import { TranscriptSegment } from "./transcription";

export interface ScriptSuggestion {
  script: CoachingScript;
  confidence: number;
  reason: string;
  urgency: "low" | "medium" | "high" | "critical";
  legalWarning?: string;
  ethicalConsideration?: string;
}

export interface ConversationContext {
  clientEmotionalState: "calm" | "anxious" | "distressed" | "crisis";
  topicsDiscussed: string[];
  objections Raised: string[];
  positiveSignals: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  sessionDuration: number;
}

export class AIScriptEngine {
  private conversationHistory: TranscriptSegment[] = [];
  private context: ConversationContext = {
    clientEmotionalState: "calm",
    topicsDiscussed: [],
    objectionsRaised: [],
    positiveSignals: [],
    riskLevel: "low",
    sessionDuration: 0
  };
  private lastSuggestion: ScriptSuggestion | null = null;
  private suggestionCallback: ((suggestion: ScriptSuggestion) => void) | null = null;

  // Trigger word patterns for automatic detection
  private readonly triggerPatterns = {
    // Money objections
    COST: /\b(can't afford|too expensive|don't have money|budget|cost|price|expensive)\b/i,
    EXPENSIVE: /\b(too much|way too expensive|overpriced|costs a lot)\b/i,
    BUDGET: /\b(tight budget|limited funds|money is tight|can't spend)\b/i,
    
    // Time objections
    TIME: /\b(don't have time|too busy|no time|schedule|busy)\b/i,
    BUSY: /\b(overwhelmed|swamped|packed schedule|hectic)\b/i,
    
    // Doubt/skepticism
    DOUBT: /\b(not sure|skeptical|doubt|uncertain|hesitant|don't know)\b/i,
    THINK: /\b(need to think|let me think|have to consider|think about it)\b/i,
    WORK: /\b(will this work|does it work|proven|evidence|guarantee)\b/i,
    
    // Crisis situations
    CRISIS: /\b(crisis|emergency|urgent|desperate|can't take it)\b/i,
    SUICIDE: /\b(kill myself|end it all|don't want to live|suicide|die)\b/i,
    HARM: /\b(hurt myself|self-harm|cutting|harm)\b/i,
    
    // Positive signals
    UPGRADE: /\b(want more|upgrade|additional|premium|next level)\b/i,
    READY: /\b(ready to start|let's do it|I'm in|sign me up)\b/i,
    HELP: /\b(this is helping|feeling better|making progress)\b/i
  };

  // Emotional state patterns
  private readonly emotionalPatterns = {
    anxiety: /\b(anxious|worried|nervous|stressed|panic|overwhelmed)\b/i,
    distress: /\b(can't cope|falling apart|breaking down|losing it)\b/i,
    crisis: /\b(suicide|kill myself|end it|can't go on|want to die)\b/i,
    positive: /\b(better|hopeful|optimistic|improving|progress)\b/i
  };

  constructor(onSuggestion: (suggestion: ScriptSuggestion) => void) {
    this.suggestionCallback = onSuggestion;
  }

  /**
   * Process new transcript segment and generate suggestions
   */
  processTranscript(segment: TranscriptSegment) {
    // Only analyze client speech
    if (segment.speaker !== "client") return;

    // Add to conversation history
    this.conversationHistory.push(segment);

    // Update conversation context
    this.updateContext(segment);

    // Check for crisis situations first (highest priority)
    const crisisSuggestion = this.detectCrisis(segment);
    if (crisisSuggestion) {
      this.emitSuggestion(crisisSuggestion);
      return;
    }

    // Detect trigger words and suggest scripts
    const suggestion = this.detectTriggers(segment);
    if (suggestion) {
      this.emitSuggestion(suggestion);
    }
  }

  /**
   * Update conversation context based on transcript
   */
  private updateContext(segment: TranscriptSegment) {
    const text = segment.text.toLowerCase();

    // Update emotional state
    if (this.emotionalPatterns.crisis.test(text)) {
      this.context.clientEmotionalState = "crisis";
      this.context.riskLevel = "critical";
    } else if (this.emotionalPatterns.distress.test(text)) {
      this.context.clientEmotionalState = "distressed";
      this.context.riskLevel = "high";
    } else if (this.emotionalPatterns.anxiety.test(text)) {
      this.context.clientEmotionalState = "anxious";
      this.context.riskLevel = "medium";
    } else if (this.emotionalPatterns.positive.test(text)) {
      this.context.clientEmotionalState = "calm";
      this.context.riskLevel = "low";
      this.context.positiveSignals.push(segment.text);
    }

    // Track topics and objections
    for (const [trigger, pattern] of Object.entries(this.triggerPatterns)) {
      if (pattern.test(text)) {
        if (trigger.includes("COST") || trigger.includes("TIME") || trigger.includes("DOUBT")) {
          if (!this.context.objectionsRaised.includes(trigger)) {
            this.context.objectionsRaised.push(trigger);
          }
        }
        if (!this.context.topicsDiscussed.includes(trigger)) {
          this.context.topicsDiscussed.push(trigger);
        }
      }
    }
  }

  /**
   * Detect crisis situations and provide immediate suggestions
   */
  private detectCrisis(segment: TranscriptSegment): ScriptSuggestion | null {
    const text = segment.text.toLowerCase();

    // Suicide ideation
    if (this.triggerPatterns.SUICIDE.test(text)) {
      const script = getScriptByTrigger("SUICIDE");
      if (script) {
        return {
          script,
          confidence: 1.0,
          reason: "Client expressed suicidal ideation",
          urgency: "critical",
          legalWarning: "MANDATORY REPORTING: Imminent risk of self-harm. Follow crisis protocol immediately.",
          ethicalConsideration: "Prioritize client safety. Do not attempt to handle alone. Involve emergency services if necessary."
        };
      }
    }

    // Self-harm
    if (this.triggerPatterns.HARM.test(text)) {
      const script = getScriptByTrigger("HARM");
      if (script) {
        return {
          script,
          confidence: 0.95,
          reason: "Client mentioned self-harm",
          urgency: "critical",
          legalWarning: "HIGH RISK: Client safety is priority. Document thoroughly and follow escalation protocol.",
          ethicalConsideration: "Assess immediate danger. Consider involving emergency contacts or services."
        };
      }
    }

    // General crisis
    if (this.triggerPatterns.CRISIS.test(text)) {
      const script = getScriptByTrigger("CRISIS");
      if (script) {
        return {
          script,
          confidence: 0.85,
          reason: "Client is in crisis state",
          urgency: "high",
          ethicalConsideration: "Provide immediate support and assess need for additional resources."
        };
      }
    }

    return null;
  }

  /**
   * Detect trigger words and suggest appropriate scripts
   */
  private detectTriggers(segment: TranscriptSegment): ScriptSuggestion | null {
    const text = segment.text.toLowerCase();
    let bestMatch: { trigger: string; confidence: number } | null = null;

    // Check all trigger patterns
    for (const [trigger, pattern] of Object.entries(this.triggerPatterns)) {
      if (pattern.test(text)) {
        // Calculate confidence based on pattern match and context
        const confidence = this.calculateConfidence(trigger, text);
        
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { trigger, confidence };
        }
      }
    }

    if (bestMatch && bestMatch.confidence > 0.6) {
      const script = getScriptByTrigger(bestMatch.trigger);
      if (script) {
        return {
          script,
          confidence: bestMatch.confidence,
          reason: `Client mentioned: "${segment.text.substring(0, 50)}..."`,
          urgency: this.determineUrgency(bestMatch.trigger),
          ...this.getGuardrails(bestMatch.trigger)
        };
      }
    }

    return null;
  }

  /**
   * Calculate confidence score for trigger match
   */
  private calculateConfidence(trigger: string, text: string): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence if mentioned multiple times in conversation
    const mentionCount = this.conversationHistory.filter(seg => 
      this.triggerPatterns[trigger as keyof typeof this.triggerPatterns]?.test(seg.text.toLowerCase())
    ).length;
    confidence += Math.min(mentionCount * 0.05, 0.2);

    // Increase confidence if client is emotionally engaged
    if (this.context.clientEmotionalState === "anxious" || this.context.clientEmotionalState === "distressed") {
      confidence += 0.1;
    }

    // Decrease confidence if we just suggested this trigger
    if (this.lastSuggestion && this.lastSuggestion.script.trigger === trigger) {
      confidence -= 0.3;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Determine urgency level for suggestion
   */
  private determineUrgency(trigger: string): "low" | "medium" | "high" | "critical" {
    if (trigger.includes("SUICIDE") || trigger.includes("HARM")) return "critical";
    if (trigger.includes("CRISIS")) return "high";
    if (trigger.includes("DOUBT") || trigger.includes("THINK")) return "medium";
    return "low";
  }

  /**
   * Get legal and ethical guardrails for specific triggers
   */
  private getGuardrails(trigger: string): { legalWarning?: string; ethicalConsideration?: string } {
    const guardrails: { legalWarning?: string; ethicalConsideration?: string } = {};

    // Crisis-related guardrails
    if (trigger.includes("SUICIDE") || trigger.includes("HARM") || trigger.includes("CRISIS")) {
      guardrails.legalWarning = "Document this conversation thoroughly. Follow mandatory reporting requirements if applicable.";
      guardrails.ethicalConsideration = "Client safety is paramount. Do not minimize or dismiss concerns.";
    }

    // Money-related guardrails
    if (trigger.includes("COST") || trigger.includes("EXPENSIVE") || trigger.includes("BUDGET")) {
      guardrails.ethicalConsideration = "Do not pressure client financially. Ensure they understand value and have genuine ability to pay.";
    }

    // Upgrade-related guardrails
    if (trigger.includes("UPGRADE")) {
      guardrails.ethicalConsideration = "Only suggest upgrades if genuinely beneficial to client. Avoid upselling for revenue alone.";
    }

    return guardrails;
  }

  /**
   * Emit suggestion to callback
   */
  private emitSuggestion(suggestion: ScriptSuggestion) {
    // Don't repeat the same suggestion within 2 minutes
    if (this.lastSuggestion && 
        this.lastSuggestion.script.trigger === suggestion.script.trigger &&
        Date.now() - (this.conversationHistory[this.conversationHistory.length - 1]?.timestamp || 0) < 120000) {
      return;
    }

    this.lastSuggestion = suggestion;
    
    if (this.suggestionCallback) {
      this.suggestionCallback(suggestion);
    }
  }

  /**
   * Get current conversation context
   */
  getContext(): ConversationContext {
    return { ...this.context };
  }

  /**
   * Get conversation history
   */
  getHistory(): TranscriptSegment[] {
    return [...this.conversationHistory];
  }

  /**
   * Reset engine for new session
   */
  reset() {
    this.conversationHistory = [];
    this.context = {
      clientEmotionalState: "calm",
      topicsDiscussed: [],
      objectionsRaised: [],
      positiveSignals: [],
      riskLevel: "low",
      sessionDuration: 0
    };
    this.lastSuggestion = null;
  }
}

/**
 * Create AI script engine instance
 */
export function createAIScriptEngine(onSuggestion: (suggestion: ScriptSuggestion) => void): AIScriptEngine {
  return new AIScriptEngine(onSuggestion);
}
