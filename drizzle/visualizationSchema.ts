/**
 * PROGRESS VISUALIZATION SYSTEM
 * Evidence-based approach using Data Visualization, Visual Analytics, and Progress Psychology
 * Research sources: Edward Tufte (visual display of information), Stephen Few (dashboard design),
 * Teresa Amabile (progress principle), Karl Weick (small wins), BJ Fogg (celebration),
 * Chip & Dan Heath (progress tracking), visual feedback research
 * 
 * CORE PRINCIPLES:
 * 1. Progress is Motivating (Teresa Amabile's research)
 * 2. Visual > Numerical (easier to process)
 * 3. Trends > Snapshots (show trajectory)
 * 4. Context Matters (compare to baseline, not others)
 * 5. Celebrate Small Wins (momentum building)
 * 6. Multiple Perspectives (different views reveal different insights)
 * 
 * VISUALIZATION TYPES:
 * - Line charts (trends over time)
 * - Bar charts (comparisons)
 * - Heatmaps (patterns & intensity)
 * - Progress bars (% to goal)
 * - Radial/spider charts (multi-dimensional wellness)
 * - Calendar views (consistency tracking)
 * - Milestone timelines (journey visualization)
 * 
 * DATA SOURCES:
 * - Habits (completion rates, streaks)
 * - Goals (progress, milestones)
 * - Wellness scores (physical, mental, emotional, spiritual)
 * - Sleep (duration, quality, consistency)
 * - Stress (HRV, cortisol, subjective ratings)
 * - Mood & energy (daily tracking)
 * - Journal entries (frequency, themes)
 * - Achievements (unlocks over time)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Identifies which visualizations drive action
 * - Learns preferred chart types per user
 * - Optimizes dashboard layout
 * - Suggests relevant comparisons
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Visualization Profiles
export const visualizationProfiles = mysqlTable("visualization_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Dashboard Preferences
  defaultDashboard: mysqlEnum("default_dashboard", [
    "overview", // All areas at a glance
    "wellness", // Physical, mental, emotional, spiritual
    "goals", // Goal progress
    "habits", // Habit tracking
    "trends", // Long-term trends
    "custom" // User-defined
  ]).default("overview"),
  
  // Chart Preferences
  preferredChartTypes: text("preferred_chart_types"), // JSON: line, bar, heatmap, etc.
  
  // Time Range Preferences
  defaultTimeRange: mysqlEnum("default_time_range", [
    "week",
    "month",
    "quarter",
    "year",
    "all_time"
  ]).default("month"),
  
  // Comparison Preferences
  showComparisons: boolean("show_comparisons").default(true), // Compare to previous periods
  showTrendlines: boolean("show_trendlines").default(true),
  showGoalLines: boolean("show_goal_lines").default(true),
  
  // Self-Learning Data
  mostViewedCharts: text("most_viewed_charts"), // JSON: which charts user checks most
  mostActionableCharts: text("most_actionable_charts"), // JSON: which charts drive behavior
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dashboard Configurations
export const dashboardConfigurations = mysqlTable("dashboard_configurations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Dashboard Details
  dashboardName: varchar("dashboard_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Layout
  layout: text("layout"), // JSON: grid layout configuration
  
  // Widgets
  widgets: text("widgets"), // JSON: array of widget configurations
  
  // Default
  isDefault: boolean("is_default").default(false),
  
  // Sharing
  isPublic: boolean("is_public").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Visualization Widgets
export const visualizationWidgets = mysqlTable("visualization_widgets", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Widget Details
  widgetName: varchar("widget_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Widget Type
  widgetType: mysqlEnum("widget_type", [
    "line_chart",
    "bar_chart",
    "area_chart",
    "pie_chart",
    "donut_chart",
    "heatmap",
    "calendar_view",
    "progress_bar",
    "radial_chart",
    "timeline",
    "scorecard",
    "table",
    "custom"
  ]).notNull(),
  
  // Data Source
  dataSource: varchar("data_source", { length: 255 }).notNull(), // habits, goals, sleep, etc.
  dataQuery: text("data_query"), // JSON: how to fetch the data
  
  // Configuration
  configuration: text("configuration"), // JSON: chart-specific settings
  
  // Refresh
  refreshInterval: int("refresh_interval"), // seconds (null = manual refresh)
  
  // Popularity
  totalUses: int("total_uses").default(0),
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Progress Snapshots (Pre-Rendered Data)
export const progressSnapshots = mysqlTable("progress_snapshots", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  snapshotDate: timestamp("snapshot_date").notNull(),
  
  // Overall Wellness (0-100 for each)
  overallScore: int("overall_score"),
  physicalScore: int("physical_score"),
  mentalScore: int("mental_score"),
  emotionalScore: int("emotional_score"),
  spiritualScore: int("spiritual_score"),
  
  // Habits
  habitCompletionRate: decimal("habit_completion_rate", { precision: 5, scale: 2 }), // %
  activeHabits: int("active_habits"),
  
  // Goals
  goalsOnTrack: int("goals_on_track"),
  goalsAtRisk: int("goals_at_risk"),
  goalsAchievedThisPeriod: int("goals_achieved_this_period"),
  
  // Sleep
  avgSleepDuration: decimal("avg_sleep_duration", { precision: 4, scale: 2 }),
  avgSleepQuality: decimal("avg_sleep_quality", { precision: 4, scale: 2 }),
  
  // Stress
  avgStressLevel: decimal("avg_stress_level", { precision: 4, scale: 2 }),
  avgHRV: decimal("avg_hrv", { precision: 6, scale: 2 }),
  
  // Mood & Energy
  avgMood: decimal("avg_mood", { precision: 4, scale: 2 }),
  avgEnergy: decimal("avg_energy", { precision: 4, scale: 2 }),
  
  // Engagement
  daysActive: int("days_active"),
  journalEntries: int("journal_entries"),
  
  // Achievements
  achievementsUnlocked: int("achievements_unlocked"),
  experiencePoints: int("experience_points"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Trend Data (Aggregated for Charts)
export const trendData = mysqlTable("trend_data", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Metric
  metricName: varchar("metric_name", { length: 255 }).notNull(),
  metricCategory: varchar("metric_category", { length: 100 }), // habits, sleep, stress, etc.
  
  // Time Period
  periodType: mysqlEnum("period_type", ["daily", "weekly", "monthly"]).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Value
  value: decimal("value", { precision: 10, scale: 2 }),
  
  // Trend
  trendDirection: mysqlEnum("trend_direction", ["up", "down", "stable"]),
  changePercent: decimal("change_percent", { precision: 6, scale: 2 }), // % vs previous period
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Heatmap Data
export const heatmapData = mysqlTable("heatmap_data", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Heatmap Type
  heatmapType: mysqlEnum("heatmap_type", [
    "habit_consistency", // Calendar view of habit completion
    "mood_patterns", // Mood by day of week / time of day
    "energy_patterns", // Energy by day of week / time of day
    "stress_patterns", // Stress by day of week / time of day
    "productivity_patterns" // Productivity by day of week / time of day
  ]).notNull(),
  
  // Date
  date: timestamp("date").notNull(),
  
  // Intensity (0-100)
  intensity: int("intensity"),
  
  // Context
  dayOfWeek: int("day_of_week"), // 0-6 (Sunday-Saturday)
  hourOfDay: int("hour_of_day"), // 0-23
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Milestone Visualizations
export const milestoneVisualizations = mysqlTable("milestone_visualizations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Timeline Type
  timelineType: mysqlEnum("timeline_type", [
    "goal_journey", // Path to a specific goal
    "transformation_journey", // Overall transformation
    "habit_mastery", // Journey to habit mastery
    "wellness_journey" // Wellness improvement
  ]).notNull(),
  
  // Related Entity
  relatedId: varchar("related_id", { length: 255 }), // Goal ID, habit ID, etc.
  
  // Milestones
  milestones: text("milestones"), // JSON: array of milestone objects with dates
  
  // Current Position
  currentPosition: decimal("current_position", { precision: 5, scale: 2 }), // % along timeline
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comparison Views
export const comparisonViews = mysqlTable("comparison_views", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Comparison Type
  comparisonType: mysqlEnum("comparison_type", [
    "week_over_week",
    "month_over_month",
    "quarter_over_quarter",
    "year_over_year",
    "best_vs_current",
    "baseline_vs_current"
  ]).notNull(),
  
  // Metric
  metric: varchar("metric", { length: 255 }).notNull(),
  
  // Current Period
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  
  // Comparison Period
  comparisonPeriodStart: timestamp("comparison_period_start").notNull(),
  comparisonPeriodEnd: timestamp("comparison_period_end").notNull(),
  comparisonValue: decimal("comparison_value", { precision: 10, scale: 2 }),
  
  // Change
  absoluteChange: decimal("absolute_change", { precision: 10, scale: 2 }),
  percentChange: decimal("percent_change", { precision: 6, scale: 2 }),
  
  // Interpretation
  interpretation: mysqlEnum("interpretation", ["improved", "stable", "declined"]),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Progress Celebrations (Visual Markers)
export const progressCelebrations = mysqlTable("progress_celebrations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Celebration Type
  celebrationType: mysqlEnum("celebration_type", [
    "goal_achieved",
    "milestone_reached",
    "streak_milestone",
    "level_up",
    "achievement_unlocked",
    "personal_best",
    "transformation_marker"
  ]).notNull(),
  
  // Details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Visual
  icon: varchar("icon", { length: 255 }),
  color: varchar("color", { length: 50 }),
  animation: varchar("animation", { length: 100 }),
  
  // Context
  relatedId: varchar("related_id", { length: 255 }),
  relatedType: varchar("related_type", { length: 100 }),
  
  // Display
  displayed: boolean("displayed").default(false),
  displayedAt: timestamp("displayed_at"),
  
  celebrationDate: timestamp("celebration_date").defaultNow(),
});

// Chart Interactions (Self-Learning)
export const chartInteractions = mysqlTable("chart_interactions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  widgetId: varchar("widget_id", { length: 255 }),
  
  // Interaction Type
  interactionType: mysqlEnum("interaction_type", [
    "viewed",
    "clicked",
    "filtered",
    "exported",
    "shared",
    "customized"
  ]).notNull(),
  
  // Duration
  viewDuration: int("view_duration"), // seconds
  
  // Action Taken
  actionTaken: boolean("action_taken").default(false), // Did they change behavior after viewing?
  actionType: varchar("action_type", { length: 100 }),
  
  interactionTimestamp: timestamp("interaction_timestamp").defaultNow(),
});

// Visualization Analytics (Self-Learning)
export const visualizationAnalytics = mysqlTable("visualization_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Widget Type
  widgetType: varchar("widget_type", { length: 100 }).notNull(),
  
  // Engagement Metrics
  avgViewDuration: decimal("avg_view_duration", { precision: 6, scale: 2 }), // seconds
  avgViewsPerUser: decimal("avg_views_per_user", { precision: 6, scale: 2 }),
  
  // Effectiveness Metrics
  actionRate: decimal("action_rate", { precision: 5, scale: 2 }), // % who took action after viewing
  avgBehaviorChange: decimal("avg_behavior_change", { precision: 5, scale: 2 }), // % improvement
  avgHelpfulnessRating: decimal("avg_helpfulness_rating", { precision: 4, scale: 2 }), // 1-10
  
  // Optimal Parameters
  optimalTimeRange: varchar("optimal_time_range", { length: 100 }),
  optimalUpdateFrequency: varchar("optimal_update_frequency", { length: 100 }),
  
  // Best For
  mostEffectiveFor: text("most_effective_for"), // JSON: user types, metrics
  
  // Sample Size
  userCount: int("user_count"),
  totalViews: int("total_views"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom Reports
export const customReports = mysqlTable("custom_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Report Details
  reportName: varchar("report_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Report Type
  reportType: mysqlEnum("report_type", [
    "progress_summary",
    "goal_review",
    "wellness_assessment",
    "habit_analysis",
    "correlation_report",
    "custom"
  ]).notNull(),
  
  // Configuration
  metrics: text("metrics"), // JSON: which metrics to include
  timeRange: text("time_range"), // JSON: date range
  visualizations: text("visualizations"), // JSON: which charts to include
  
  // Schedule
  scheduled: boolean("scheduled").default(false),
  scheduleFrequency: mysqlEnum("schedule_frequency", ["daily", "weekly", "monthly"]),
  
  // Export
  exportFormat: mysqlEnum("export_format", ["pdf", "csv", "json"]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Report Generations
export const reportGenerations = mysqlTable("report_generations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  reportId: varchar("report_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Generation Details
  generatedAt: timestamp("generated_at").defaultNow(),
  
  // Data
  reportData: text("report_data"), // JSON: the actual report content
  
  // File
  filePath: varchar("file_path", { length: 500 }), // If exported
  
  // Status
  status: mysqlEnum("status", ["generating", "completed", "failed"]).default("generating"),
  
  createdAt: timestamp("created_at").defaultNow(),
});
