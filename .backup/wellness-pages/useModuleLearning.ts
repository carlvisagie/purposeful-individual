/**
 * useModuleLearning Hook
 * Enables self-learning and cross-module cooperation for wellness modules
 */

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export interface ModuleFeedback {
  wasHelpful: "yes" | "no" | "somewhat";
  rating?: number;
  notes?: string;
}

export interface OutcomeTracking {
  metric: string;
  value: number;
  improvement?: number;
  timestamp: Date;
}

export function useModuleLearning(moduleName: string) {
  const [showFeedback, setShowFeedback] = useState(false);

  // Record technique usage
  const recordTechnique = trpc.adaptiveLearning.recordTechniqueUsage.useMutation();

  // Record feedback
  const recordFeedback = trpc.adaptiveLearning.recordFeedback.useMutation();

  // Get effective techniques
  const { data: effectiveTechniques } = trpc.adaptiveLearning.getMostEffectiveTechniques.useQuery({
    problemType: moduleName,
    limit: 5,
  });

  /**
   * Track when user tries a technique/intervention
   */
  const trackTechniqueUsage = async (params: {
    techniqueName: string;
    category: string;
    wasSuccessful: boolean;
    rating?: number;
  }) => {
    await recordTechnique.mutateAsync({
      techniqueName: params.techniqueName,
      techniqueCategory: params.category,
      problemType: moduleName,
      wasSuccessful: params.wasSuccessful,
      rating: params.rating,
    });
  };

  /**
   * Collect user feedback on module recommendations
   */
  const submitFeedback = async (params: {
    recommendationType: string;
    recommendationContent: string;
    feedback: ModuleFeedback;
    clientId: number;
  }) => {
    await recordFeedback.mutateAsync({
      clientId: params.clientId,
      recommendationType: params.recommendationType,
      recommendationContent: params.recommendationContent,
      context: moduleName,
      wasUsed: "yes",
      wasHelpful: params.feedback.wasHelpful,
      rating: params.feedback.rating,
      feedbackNotes: params.feedback.notes,
    });

    setShowFeedback(false);
  };

  /**
   * Get module-specific insights from learning system
   */
  const getModuleInsights = () => {
    return effectiveTechniques?.techniques || [];
  };

  /**
   * Request feedback from user after intervention
   */
  const requestFeedback = (interventionName: string) => {
    setShowFeedback(true);
    return interventionName;
  };

  return {
    // Actions
    trackTechniqueUsage,
    submitFeedback,
    requestFeedback,
    
    // Data
    effectiveTechniques: getModuleInsights(),
    
    // UI State
    showFeedback,
    setShowFeedback,
    
    // Loading states
    isRecording: recordTechnique.isLoading || recordFeedback.isLoading,
  };
}

/**
 * Cross-module cooperation hook
 * Allows modules to share insights with each other
 */
export function useCrossModuleInsights(currentModule: string) {
  // Get insights from related modules
  const { data: sleepInsights } = trpc.adaptiveLearning.getMostEffectiveTechniques.useQuery({
    problemType: "sleep",
    limit: 3,
  }, {
    enabled: currentModule !== "sleep",
  });

  const { data: anxietyInsights } = trpc.adaptiveLearning.getMostEffectiveTechniques.useQuery({
    problemType: "anxiety",
    limit: 3,
  }, {
    enabled: currentModule !== "anxiety",
  });

  const { data: exerciseInsights } = trpc.adaptiveLearning.getMostEffectiveTechniques.useQuery({
    problemType: "exercise",
    limit: 3,
  }, {
    enabled: currentModule !== "exercise",
  });

  /**
   * Get relevant insights from other modules
   * Example: Anxiety module can see that sleep quality affects anxiety
   */
  const getRelatedInsights = () => {
    const insights: Array<{
      module: string;
      technique: string;
      effectiveness: number;
      relevance: string;
    }> = [];

    // Sleep insights
    if (sleepInsights?.techniques) {
      sleepInsights.techniques.forEach((tech) => {
        const successRate = (tech.successCount || 0) / Math.max(tech.timesUsed || 1, 1);
        if (successRate > 0.7) {
          insights.push({
            module: "sleep",
            technique: tech.techniqueName,
            effectiveness: successRate * 100,
            relevance: getRelevance(currentModule, "sleep", tech.techniqueName),
          });
        }
      });
    }

    // Anxiety insights
    if (anxietyInsights?.techniques) {
      anxietyInsights.techniques.forEach((tech) => {
        const successRate = (tech.successCount || 0) / Math.max(tech.timesUsed || 1, 1);
        if (successRate > 0.7) {
          insights.push({
            module: "anxiety",
            technique: tech.techniqueName,
            effectiveness: successRate * 100,
            relevance: getRelevance(currentModule, "anxiety", tech.techniqueName),
          });
        }
      });
    }

    // Exercise insights
    if (exerciseInsights?.techniques) {
      exerciseInsights.techniques.forEach((tech) => {
        const successRate = (tech.successCount || 0) / Math.max(tech.timesUsed || 1, 1);
        if (successRate > 0.7) {
          insights.push({
            module: "exercise",
            technique: tech.techniqueName,
            effectiveness: successRate * 100,
            relevance: getRelevance(currentModule, "exercise", tech.techniqueName),
          });
        }
      });
    }

    return insights;
  };

  return {
    relatedInsights: getRelatedInsights(),
  };
}

/**
 * Determine relevance between modules
 */
function getRelevance(currentModule: string, sourceModule: string, technique: string): string {
  const relevanceMap: Record<string, Record<string, string>> = {
    anxiety: {
      sleep: "Better sleep reduces anxiety symptoms",
      exercise: "Physical activity lowers stress hormones",
      depression: "Anxiety and depression often co-occur",
    },
    depression: {
      sleep: "Sleep quality strongly affects mood",
      exercise: "Exercise is as effective as medication",
      anxiety: "Managing anxiety improves mood",
    },
    sleep: {
      anxiety: "Anxiety management improves sleep",
      exercise: "Exercise timing affects sleep quality",
      nutrition: "Diet affects sleep architecture",
    },
    exercise: {
      sleep: "Sleep quality affects workout performance",
      nutrition: "Nutrition fuels exercise recovery",
      depression: "Exercise boosts mood and energy",
    },
    nutrition: {
      exercise: "Nutrition supports fitness goals",
      sleep: "Diet affects sleep quality",
      depression: "Nutrition impacts mental health",
    },
  };

  return relevanceMap[currentModule]?.[sourceModule] || "May provide complementary benefits";
}
