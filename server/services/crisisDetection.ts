/**
 * Crisis Detection Service
 * Real-time monitoring for crisis keywords and risk assessment
 */

export interface CrisisAlert {
  alertType: "suicide" | "self-harm" | "abuse" | "violence" | "substance";
  riskScore: number;
  keywords: string[];
  context: string;
  timestamp: Date;
}

// Crisis keyword patterns
const CRISIS_PATTERNS = {
  suicide: {
    keywords: [
      "kill myself",
      "end my life",
      "want to die",
      "suicide",
      "suicidal",
      "no reason to live",
      "better off dead",
      "end it all",
      "take my own life",
      "don't want to be here",
    ],
    riskScore: 95,
  },
  selfHarm: {
    keywords: [
      "cut myself",
      "cutting",
      "self harm",
      "hurt myself",
      "burning myself",
      "hitting myself",
      "punish myself",
    ],
    riskScore: 75,
  },
  abuse: {
    keywords: [
      "being abused",
      "hitting me",
      "hurting me",
      "threatening me",
      "scared of",
      "violent towards me",
      "won't let me leave",
    ],
    riskScore: 85,
  },
  violence: {
    keywords: [
      "hurt someone",
      "kill them",
      "make them pay",
      "revenge",
      "violent thoughts",
      "harm others",
    ],
    riskScore: 90,
  },
  substance: {
    keywords: [
      "overdose",
      "too many pills",
      "drink myself to death",
      "high all the time",
      "can't stop using",
    ],
    riskScore: 70,
  },
};

/**
 * Analyze text for crisis indicators
 */
export function detectCrisis(text: string): CrisisAlert | null {
  const lowerText = text.toLowerCase();
  
  // Check each crisis category
  for (const [category, config] of Object.entries(CRISIS_PATTERNS)) {
    const matchedKeywords: string[] = [];
    
    for (const keyword of config.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }
    
    // If keywords found, create alert
    if (matchedKeywords.length > 0) {
      // Calculate risk score based on number of keywords
      const baseScore = config.riskScore;
      const keywordBonus = Math.min(matchedKeywords.length * 5, 20);
      const finalScore = Math.min(baseScore + keywordBonus, 100);
      
      return {
        alertType: category as any,
        riskScore: finalScore,
        keywords: matchedKeywords,
        context: text.slice(0, 200), // First 200 chars for context
        timestamp: new Date(),
      };
    }
  }
  
  return null;
}

/**
 * Get emergency resources based on alert type
 */
export function getEmergencyResources(alertType: string): {
  hotline: string;
  text: string;
  website: string;
} {
  const resources: Record<string, any> = {
    suicide: {
      hotline: "988 (National Suicide Prevention Lifeline)",
      text: "Text HOME to 741741 (Crisis Text Line)",
      website: "https://988lifeline.org",
    },
    selfHarm: {
      hotline: "988 (National Suicide Prevention Lifeline)",
      text: "Text HOME to 741741 (Crisis Text Line)",
      website: "https://www.selfinjury.com",
    },
    abuse: {
      hotline: "1-800-799-7233 (National Domestic Violence Hotline)",
      text: "Text START to 88788",
      website: "https://www.thehotline.org",
    },
    violence: {
      hotline: "911 (Emergency Services)",
      text: "Text 911 in participating areas",
      website: "https://www.samhsa.gov",
    },
    substance: {
      hotline: "1-800-662-4357 (SAMHSA National Helpline)",
      text: "Text HELLO to 741741",
      website: "https://www.samhsa.gov/find-help/national-helpline",
    },
  };
  
  return resources[alertType] || resources.suicide;
}

/**
 * Generate AI response for crisis situations
 */
export function generateCrisisResponse(alert: CrisisAlert): string {
  const resources = getEmergencyResources(alert.alertType);
  
  return `I'm really concerned about what you've shared. Your safety is the top priority right now.

**Immediate Support Available:**

📞 **Call:** ${resources.hotline}
💬 **Text:** ${resources.text}
🌐 **Online:** ${resources.website}

These services are:
- Available 24/7
- Free and confidential
- Staffed by trained crisis counselors
- Ready to help right now

**If you're in immediate danger, please call 911 or go to your nearest emergency room.**

I'm here to support you, but I want to make sure you have access to the immediate, professional help you need. Would you like to talk about what's going on? I'm listening.`;
}

/**
 * Log crisis alert to database
 */
export async function logCrisisAlert(
  sessionId: string,
  userId: number | null,
  alert: CrisisAlert
): Promise<void> {
  // TODO: Implement database logging
  // This would insert into a crisis_alerts table
  console.log("[CRISIS ALERT]", {
    sessionId,
    userId,
    alert,
  });
  
  // TODO: Send notifications
  // - Email to admin
  // - SMS to on-call crisis counselor
  // - Slack/Discord alert
}
