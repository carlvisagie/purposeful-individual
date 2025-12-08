/**
 * useHabitFormation Hook
 * Integrates evidence-based habit formation into wellness modules
 */

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export interface HabitFormationOptions {
  moduleName: string;
  category: "health" | "fitness" | "nutrition" | "sleep" | "mental_health" | "relationships" | "career" | "finance" | "learning" | "spiritual" | "productivity" | "other";
}

export function useHabitFormation(options: HabitFormationOptions) {
  const [showHabitBuilder, setShowHabitBuilder] = useState(false);

  // Get habits for this module's category
  const { data: categoryHabits, refetch } = trpc.habits.getHabitsByCategory.useQuery({
    category: options.category,
  });

  // Get habit profile
  const { data: profile } = trpc.habits.getProfile.useQuery();

  // Mutations
  const createHabit = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      refetch();
      setShowHabitBuilder(false);
    },
  });

  const trackCompletion = trpc.habits.trackCompletion.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  /**
   * Create a new habit for this module
   */
  const buildHabit = async (params: {
    habitName: string;
    habitDescription?: string;
    identityStatement?: string;
    habitType: "build" | "break" | "replace";
    tinyVersion?: string;
    fullVersion?: string;
    cue: string;
    cueType?: "time" | "location" | "preceding_action" | "emotional_state" | "other_people";
    routine: string;
    reward?: string;
    anchorHabit?: string;
    stackingFormula?: string;
    implementationIntention?: string;
    targetFrequency: "daily" | "weekdays" | "weekends" | "weekly" | "custom";
    customFrequency?: string;
    targetDuration?: number;
    difficulty?: number;
  }) => {
    await createHabit.mutateAsync({
      ...params,
      category: options.category,
    });
  };

  /**
   * Mark habit as completed for today
   */
  const completeHabit = async (params: {
    habitId: string;
    duration?: number;
    intensity?: number;
    cuePresent?: boolean;
    cueEffectiveness?: number;
    resistanceLevel?: number;
    easeOfCompletion?: number;
    rewardExperienced?: boolean;
    rewardSatisfaction?: number;
    feltAutomatic?: boolean;
    moodBefore?: string;
    moodAfter?: string;
    energyBefore?: number;
    energyAfter?: number;
    notes?: string;
    challenges?: string;
    wins?: string;
  }) => {
    await trackCompletion.mutateAsync({
      ...params,
      completed: true,
    });
  };

  /**
   * Mark habit as skipped for today
   */
  const skipHabit = async (habitId: string, reason?: string) => {
    await trackCompletion.mutateAsync({
      habitId,
      completed: false,
      notes: reason,
    });
  };

  /**
   * Get active habits for this module
   */
  const getActiveHabits = () => {
    return categoryHabits?.habits || [];
  };

  /**
   * Generate habit stacking suggestion
   * Example: "After I brush my teeth, I will meditate for 2 minutes"
   */
  const generateStackingFormula = (anchorHabit: string, newHabit: string) => {
    return `After I ${anchorHabit}, I will ${newHabit}`;
  };

  /**
   * Generate implementation intention
   * Example: "If I feel anxious, then I will do 4-7-8 breathing"
   */
  const generateImplementationIntention = (trigger: string, action: string) => {
    return `If ${trigger}, then I will ${action}`;
  };

  /**
   * Generate identity statement
   * Example: "I am a person who prioritizes sleep"
   */
  const generateIdentityStatement = (behavior: string) => {
    return `I am a person who ${behavior}`;
  };

  /**
   * Suggest tiny version of habit (BJ Fogg method)
   * Makes habit ridiculously small to reduce resistance
   */
  const suggestTinyVersion = (fullHabit: string): string => {
    const tinyVersions: Record<string, string> = {
      "meditate for 20 minutes": "meditate for 2 minutes",
      "exercise for 30 minutes": "do 5 pushups",
      "read for an hour": "read 1 page",
      "journal for 15 minutes": "write 1 sentence",
      "drink 8 glasses of water": "drink 1 glass of water",
      "sleep 8 hours": "go to bed 10 minutes earlier",
      "eat healthy": "eat 1 vegetable",
      "practice gratitude": "think of 1 thing you're grateful for",
    };

    // Check for exact matches
    const lowerHabit = fullHabit.toLowerCase();
    for (const [full, tiny] of Object.entries(tinyVersions)) {
      if (lowerHabit.includes(full)) {
        return tiny;
      }
    }

    // Generic tiny version
    return `Start with just 2 minutes of ${fullHabit}`;
  };

  /**
   * Get habit formation tips based on research
   */
  const getHabitTips = () => {
    return [
      {
        principle: "Start Tiny (BJ Fogg)",
        tip: "Make it so small you can't say no. 2 pushups, not 30 minutes of exercise.",
      },
      {
        principle: "Habit Stacking (James Clear)",
        tip: "Attach new habit to existing one: 'After I pour coffee, I will meditate for 2 minutes.'",
      },
      {
        principle: "Identity-Based (James Clear)",
        tip: "Focus on who you want to become: 'I am a person who exercises' not 'I want to exercise.'",
      },
      {
        principle: "Implementation Intentions (Peter Gollwitzer)",
        tip: "Plan for obstacles: 'If I'm too tired, then I will do just 5 minutes instead of skipping.'",
      },
      {
        principle: "Environment Design",
        tip: "Make it obvious and easy: Put workout clothes by your bed, meditation cushion in plain sight.",
      },
      {
        principle: "Reward Immediately",
        tip: "Celebrate right after: Smile, fist pump, say 'Victory!' to wire in the habit loop.",
      },
    ];
  };

  return {
    // Data
    habits: getActiveHabits(),
    profile: profile?.profile,
    habitTips: getHabitTips(),

    // Actions
    buildHabit,
    completeHabit,
    skipHabit,

    // Helpers
    generateStackingFormula,
    generateImplementationIntention,
    generateIdentityStatement,
    suggestTinyVersion,

    // UI State
    showHabitBuilder,
    setShowHabitBuilder,

    // Loading
    isCreating: createHabit.isLoading,
    isTracking: trackCompletion.isLoading,
  };
}

/**
 * Hook for tracking habit completion with detailed metrics
 */
export function useHabitTracking(habitId: string) {
  const { data: history } = trpc.habits.getTrackingHistory.useQuery({
    habitId,
    days: 30,
  });

  const trackCompletion = trpc.habits.trackCompletion.useMutation();

  /**
   * Quick completion (just mark as done)
   */
  const quickComplete = async () => {
    await trackCompletion.mutateAsync({
      habitId,
      completed: true,
    });
  };

  /**
   * Detailed completion (track all metrics)
   */
  const detailedComplete = async (metrics: {
    duration?: number;
    intensity?: number;
    cuePresent?: boolean;
    cueEffectiveness?: number;
    resistanceLevel?: number;
    easeOfCompletion?: number;
    rewardExperienced?: boolean;
    rewardSatisfaction?: number;
    feltAutomatic?: boolean;
    moodBefore?: string;
    moodAfter?: string;
    energyBefore?: number;
    energyAfter?: number;
    notes?: string;
    challenges?: string;
    wins?: string;
  }) => {
    await trackCompletion.mutateAsync({
      habitId,
      completed: true,
      ...metrics,
    });
  };

  /**
   * Calculate completion rate
   */
  const getCompletionRate = () => {
    if (!history?.tracking || history.tracking.length === 0) return 0;
    const completed = history.tracking.filter((t) => t.completed).length;
    return Math.round((completed / history.tracking.length) * 100);
  };

  /**
   * Get current streak
   */
  const getCurrentStreak = () => {
    if (!history?.tracking || history.tracking.length === 0) return 0;
    
    let streak = 0;
    for (const entry of history.tracking) {
      if (entry.completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return {
    history: history?.tracking || [],
    completionRate: getCompletionRate(),
    currentStreak: getCurrentStreak(),
    quickComplete,
    detailedComplete,
    isTracking: trackCompletion.isLoading,
  };
}
