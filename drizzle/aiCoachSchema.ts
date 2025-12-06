/**
 * AI COACHING ASSISTANT SYSTEM
 * Evidence-based approach using Coaching Psychology, Conversational AI, and Behavioral Science
 * Research sources: Carol Kauffman (positive psychology coaching), David Peterson (coaching effectiveness),
 * Michael Bungay Stanier (coaching questions), Marshall Goldsmith (behavioral coaching),
 * Motivational Interviewing (Miller & Rollnick), Socratic questioning, Solution-Focused Brief Therapy
 * 
 * CORE PRINCIPLES:
 * 1. Ask > Tell (Socratic method)
 * 2. Personalized > Generic (context-aware)
 * 3. Empowering > Prescriptive (build self-efficacy)
 * 4. Evidence-Based > Pseudoscience (research-backed only)
 * 5. Timely > Reactive (proactive interventions)
 * 6. Conversational > Robotic (natural language)
 * 
 * COACHING APPROACHES:
 * - Motivational Interviewing (explore ambivalence)
 * - Socratic Questioning (guide discovery)
 * - Solution-Focused (build on strengths)
 * - Cognitive Behavioral (challenge distortions)
 * - Positive Psychology (leverage strengths)
 * - Goal-Focused (clarify & pursue goals)
 * 
 * AI CAPABILITIES:
 * - Contextual awareness (knows your data)
 * - Personalized recommendations
 * - Pattern recognition (spots trends)
 * - Predictive interventions (anticipates needs)
 * - Natural conversation (not scripted)
 * - Multi-modal support (text, voice, visual)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Learns which coaching styles work for you
 * - Adapts question types based on effectiveness
 * - Optimizes intervention timing
 * - Personalizes recommendation types
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// AI Coach Profiles
export const aiCoachProfiles = mysqlTable("ai_coach_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Coaching Preferences
  preferredCoachingStyle: mysqlEnum("preferred_coaching_style", [
    "motivational", // Motivational Interviewing
    "socratic", // Questioning approach
    "solution_focused", // Build on strengths
    "cognitive_behavioral", // Challenge thinking
    "directive", // Clear instructions
    "mixed" // Adaptive
  ]),
  
  // Communication Preferences
  preferredTone: mysqlEnum("preferred_tone", [
    "supportive",
    "challenging",
    "balanced"
  ]).default("balanced"),
  
  verbosity: mysqlEnum("verbosity", ["concise", "moderate", "detailed"]).default("moderate"),
  
  // Interaction Preferences
  proactiveCheckins: boolean("proactive_checkins").default(true),
  dailyCheckIn: boolean("daily_check_in").default(false),
  weeklyReview: boolean("weekly_review").default(true),
  
  // Privacy
  dataSharing: boolean("data_sharing").default(true), // Share data with AI for better coaching
  
  // Self-Learning Data
  effectiveQuestionTypes: text("effective_question_types"), // JSON: which questions lead to insights
  effectiveInterventionTypes: text("effective_intervention_types"), // JSON: which interventions work
  optimalCheckInTiming: text("optimal_check_in_timing"), // JSON: when to reach out
  
  // Coach Relationship
  trustLevel: int("trust_level"), // 1-10 (how much user trusts AI coach)
  satisfactionLevel: int("satisfaction_level"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coaching Conversations
export const coachingConversations = mysqlTable("coaching_conversations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Conversation Details
  conversationTitle: varchar("conversation_title", { length: 255 }),
  
  // Conversation Type
  conversationType: mysqlEnum("conversation_type", [
    "check_in", // Daily/weekly check-in
    "goal_setting", // Setting new goals
    "obstacle_solving", // Working through challenges
    "reflection", // Reflecting on progress
    "crisis_support", // Immediate support needed
    "celebration", // Celebrating wins
    "exploration", // Exploring options
    "accountability" // Accountability conversation
  ]).notNull(),
  
  // Status
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active"),
  
  // Outcomes
  insightsGenerated: int("insights_generated").default(0),
  actionsIdentified: int("actions_identified").default(0),
  
  // Effectiveness
  helpfulnessRating: int("helpfulness_rating"), // 1-10 (user feedback)
  
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversation Messages
export const conversationMessages = mysqlTable("conversation_messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Message Details
  sender: mysqlEnum("sender", ["user", "ai_coach"]).notNull(),
  messageText: text("message_text").notNull(),
  
  // Message Type (for AI messages)
  messageType: mysqlEnum("message_type", [
    "question", // Asking a question
    "reflection", // Reflecting back what user said
    "insight", // Offering an insight
    "suggestion", // Making a suggestion
    "encouragement", // Providing encouragement
    "challenge", // Challenging user's thinking
    "information", // Providing information
    "summary" // Summarizing conversation
  ]),
  
  // Coaching Technique Used
  coachingTechnique: mysqlEnum("coaching_technique", [
    "open_question",
    "scaling_question",
    "miracle_question",
    "exception_finding",
    "reframing",
    "socratic_questioning",
    "motivational_interviewing",
    "cognitive_restructuring",
    "strengths_identification"
  ]),
  
  // Context
  contextData: text("context_data"), // JSON: relevant user data that informed this message
  
  // User Response
  userEngaged: boolean("user_engaged"), // Did user respond meaningfully?
  userInsight: boolean("user_insight"), // Did user have an insight?
  userAction: boolean("user_action"), // Did user commit to action?
  
  sentAt: timestamp("sent_at").defaultNow(),
});

// Coaching Questions Library
export const coachingQuestions = mysqlTable("coaching_questions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Question Details
  questionText: text("question_text").notNull(),
  
  // Question Type
  questionType: mysqlEnum("question_type", [
    "open_ended", // "What do you think about...?"
    "scaling", // "On a scale of 1-10..."
    "miracle", // "If a miracle happened..."
    "exception", // "When has this NOT been a problem?"
    "coping", // "How have you managed so far?"
    "values", // "What matters most to you?"
    "strengths", // "What are you good at?"
    "future_focused", // "Where do you want to be?"
    "clarifying", // "Can you tell me more about...?"
    "challenging" // "Is that really true?"
  ]).notNull(),
  
  // Category
  category: varchar("category", { length: 100 }),
  
  // When to Use
  bestFor: text("best_for"), // JSON: situations, emotions, goals
  
  // Research-Backed
  researchBacked: boolean("research_backed").default(false),
  researchSource: text("research_source"),
  
  // Effectiveness
  avgInsightRate: decimal("avg_insight_rate", { precision: 5, scale: 2 }), // % who had insight
  avgActionRate: decimal("avg_action_rate", { precision: 5, scale: 2 }), // % who took action
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  totalUses: int("total_uses").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Recommendations
export const aiRecommendations = mysqlTable("ai_recommendations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Recommendation Type
  recommendationType: mysqlEnum("recommendation_type", [
    "habit_suggestion", // Try this habit
    "goal_suggestion", // Consider this goal
    "intervention_suggestion", // Use this technique
    "resource_suggestion", // Check out this resource
    "adjustment_suggestion", // Adjust your approach
    "timing_suggestion", // Change when you do X
    "connection_suggestion" // Connect with someone
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Reasoning
  reasoning: text("reasoning"), // Why is AI suggesting this?
  supportingData: text("supporting_data"), // JSON: data that supports this recommendation
  
  // Confidence
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // %
  
  // Priority
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Status
  status: mysqlEnum("status", ["pending", "accepted", "declined", "deferred"]).default("pending"),
  
  // User Response
  userFeedback: text("user_feedback"),
  helpfulnessRating: int("helpfulness_rating"), // 1-10
  
  // Outcome
  implemented: boolean("implemented").default(false),
  implementedAt: timestamp("implemented_at"),
  outcomePositive: boolean("outcome_positive"),
  
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Proactive Check-Ins
export const proactiveCheckIns = mysqlTable("proactive_check_ins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Check-In Type
  checkInType: mysqlEnum("check_in_type", [
    "daily_check_in", // How's your day?
    "weekly_review", // How was your week?
    "goal_progress", // How's goal X going?
    "habit_check", // Still doing habit X?
    "wellness_check", // How are you feeling?
    "obstacle_check", // Still struggling with X?
    "celebration", // Congrats on X!
    "motivation_boost" // Need a boost?
  ]).notNull(),
  
  // Trigger
  triggerType: mysqlEnum("trigger_type", [
    "scheduled", // Regular schedule
    "pattern_detected", // AI noticed something
    "goal_milestone", // Close to goal
    "streak_at_risk", // About to lose streak
    "low_engagement", // Haven't logged in
    "stress_spike", // High stress detected
    "achievement" // Something to celebrate
  ]).notNull(),
  
  // Message
  message: text("message"),
  
  // Response
  responded: boolean("responded").default(false),
  respondedAt: timestamp("responded_at"),
  responseQuality: mysqlEnum("response_quality", ["brief", "engaged", "insightful"]),
  
  // Effectiveness
  helpful: boolean("helpful"),
  
  sentAt: timestamp("sent_at").defaultNow(),
});

// Coaching Insights (AI-Generated)
export const coachingInsights = mysqlTable("coaching_insights", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Insight Type
  insightType: mysqlEnum("insight_type", [
    "pattern_recognition", // "I notice you always..."
    "strength_identification", // "You're really good at..."
    "blind_spot", // "You might not realize..."
    "opportunity", // "Have you considered..."
    "risk_alert", // "I'm concerned about..."
    "progress_highlight", // "Look how far you've come..."
    "connection", // "X seems related to Y..."
    "discrepancy" // "You say X but do Y..."
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Supporting Evidence
  evidence: text("evidence"), // JSON: data points that support this insight
  
  // Actionability
  actionable: boolean("actionable").default(false),
  suggestedAction: text("suggested_action"),
  
  // User Response
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewed_at"),
  resonated: boolean("resonated"), // Did this insight resonate?
  actionTaken: boolean("action_taken").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Coaching Goals (AI-Assisted Goal Setting)
export const coachingGoals = mysqlTable("coaching_goals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 255 }),
  goalId: varchar("goal_id", { length: 255 }), // Links to goals table
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Goal Clarity
  initialClarity: int("initial_clarity"), // 1-10 (how clear was goal at start)
  finalClarity: int("final_clarity"), // 1-10 (how clear after coaching)
  
  // AI Contribution
  aiContribution: text("ai_contribution"), // How did AI help clarify/refine goal?
  
  // Obstacles Identified
  obstaclesIdentified: text("obstacles_identified"), // JSON array
  
  // Strategies Developed
  strategiesDeveloped: text("strategies_developed"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Coaching Effectiveness (Self-Learning)
export const coachingEffectiveness = mysqlTable("coaching_effectiveness", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Coaching Element
  elementType: varchar("element_type", { length: 100 }).notNull(), // question_type, technique, etc.
  elementValue: varchar("element_value", { length: 255 }).notNull(), // specific question, technique, etc.
  
  // Effectiveness Metrics
  avgEngagementRate: decimal("avg_engagement_rate", { precision: 5, scale: 2 }), // % who engaged
  avgInsightRate: decimal("avg_insight_rate", { precision: 5, scale: 2 }), // % who had insights
  avgActionRate: decimal("avg_action_rate", { precision: 5, scale: 2 }), // % who took action
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  
  // Behavioral Impact
  avgBehaviorChange: decimal("avg_behavior_change", { precision: 5, scale: 2 }), // % improvement
  
  // Optimal Parameters
  optimalContext: text("optimal_context"), // JSON: when this works best
  optimalUserType: text("optimal_user_type"), // JSON: who this works best for
  
  // Sample Size
  userCount: int("user_count"),
  totalUses: int("total_uses"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Coach Feedback
export const aiCoachFeedback = mysqlTable("ai_coach_feedback", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  conversationId: varchar("conversation_id", { length: 255 }),
  messageId: varchar("message_id", { length: 255 }),
  
  // Feedback Type
  feedbackType: mysqlEnum("feedback_type", [
    "helpful",
    "not_helpful",
    "too_pushy",
    "too_passive",
    "off_topic",
    "insightful",
    "generic",
    "perfect"
  ]).notNull(),
  
  // Details
  feedbackText: text("feedback_text"),
  
  // Rating
  rating: int("rating"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Coaching Resources
export const coachingResources = mysqlTable("coaching_resources", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Resource Details
  resourceName: varchar("resource_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Resource Type
  resourceType: mysqlEnum("resource_type", [
    "article",
    "video",
    "exercise",
    "worksheet",
    "book",
    "podcast",
    "course",
    "tool"
  ]).notNull(),
  
  // URL
  url: varchar("url", { length: 500 }),
  
  // Category
  category: varchar("category", { length: 100 }),
  
  // Research-Backed
  researchBacked: boolean("research_backed").default(false),
  
  // When to Recommend
  recommendFor: text("recommend_for"), // JSON: situations, goals, challenges
  
  // Effectiveness
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  totalRecommendations: int("total_recommendations").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Resource Interactions
export const userResourceInteractions = mysqlTable("user_resource_interactions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  resourceId: varchar("resource_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Interaction
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewed_at"),
  
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  
  // Feedback
  helpful: boolean("helpful"),
  helpfulnessRating: int("helpfulness_rating"), // 1-10
  
  // Impact
  actionTaken: boolean("action_taken").default(false),
  impactDescription: text("impact_description"),
  
  recommendedAt: timestamp("recommended_at").defaultNow(),
});
