/**
 * GAMIFICATION & MOTIVATION SYSTEM
 * Evidence-based approach using Behavioral Psychology, Game Design, and Intrinsic Motivation Research
 * Research sources: BJ Fogg (behavior design), Nir Eyal (Hooked model), Yu-kai Chou (Octalysis),
 * Edward Deci & Richard Ryan (Self-Determination Theory), Dan Ariely (behavioral economics),
 * Jane McGonigal (gamification for real-world change)
 * 
 * CORE PRINCIPLES:
 * 1. Intrinsic > Extrinsic Motivation (SDT: autonomy, competence, relatedness)
 * 2. Progress Visibility (small wins compound)
 * 3. Social Proof (others are doing it)
 * 4. Variable Rewards (dopamine optimization)
 * 5. Meaningful Achievements (not just badges)
 * 6. Identity Reinforcement (who you're becoming)
 * 
 * GAMIFICATION ELEMENTS:
 * - Progress tracking & streaks
 * - Achievements & milestones
 * - Levels & experience points
 * - Challenges & quests
 * - Leaderboards (optional, opt-in)
 * - Rewards & unlocks
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Identifies which rewards motivate each user
 * - Learns optimal challenge difficulty
 * - Predicts when users need motivation boost
 * - Personalizes achievement timing
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// User Gamification Profiles
export const gamificationProfiles = mysqlTable("gamification_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Overall Progress
  totalExperiencePoints: int("total_experience_points").default(0),
  currentLevel: int("current_level").default(1),
  experienceToNextLevel: int("experience_to_next_level").default(100),
  
  // Engagement
  currentStreak: int("current_streak").default(0), // Days
  longestStreak: int("longest_streak").default(0),
  totalDaysActive: int("total_days_active").default(0),
  
  // Achievements
  totalAchievements: int("total_achievements").default(0),
  totalBadges: int("total_badges").default(0),
  totalMilestones: int("total_milestones").default(0),
  
  // Motivation Type (Self-Determination Theory)
  motivationType: mysqlEnum("motivation_type", [
    "autonomy_driven", // Wants control & choice
    "competence_driven", // Wants mastery & skill
    "relatedness_driven", // Wants connection & belonging
    "mixed"
  ]),
  
  // Gamification Preferences
  likesCompetition: boolean("likes_competition").default(false),
  likesCollaboration: boolean("likes_collaboration").default(true),
  likesChallenges: boolean("likes_challenges").default(true),
  likesRewards: boolean("likes_rewards").default(true),
  
  // Self-Learning Data
  mostMotivatingRewards: text("most_motivating_rewards"), // JSON: which rewards drive action
  optimalChallengeDifficulty: int("optimal_challenge_difficulty"), // 1-10
  motivationPatterns: text("motivation_patterns"), // JSON: when motivation dips/peaks
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Experience Points Log
export const experiencePointsLog = mysqlTable("experience_points_log", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Source
  source: mysqlEnum("source", [
    "habit_completion",
    "daily_check_in",
    "goal_achievement",
    "milestone_reached",
    "challenge_completed",
    "helping_others",
    "consistency_bonus",
    "level_up"
  ]).notNull(),
  
  sourceId: varchar("source_id", { length: 255 }), // ID of the habit, goal, etc.
  
  // Points
  pointsEarned: int("points_earned").notNull(),
  
  // Context
  description: varchar("description", { length: 255 }),
  
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Achievements
export const achievements = mysqlTable("achievements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Achievement Details
  achievementName: varchar("achievement_name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  
  // Category
  category: mysqlEnum("category", [
    "habits",
    "goals",
    "streaks",
    "community",
    "learning",
    "health",
    "transformation"
  ]).notNull(),
  
  // Difficulty
  difficulty: mysqlEnum("difficulty", ["bronze", "silver", "gold", "platinum", "legendary"]),
  
  // Requirements
  requirements: text("requirements"), // JSON: what needs to be done
  
  // Rewards
  experiencePoints: int("experience_points").notNull(),
  
  // Rarity
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]),
  
  // Stats
  totalUnlocked: int("total_unlocked").default(0), // How many users have this?
  
  createdAt: timestamp("created_at").defaultNow(),
});

// User Achievements
export const userAchievements = mysqlTable("user_achievements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  achievementId: varchar("achievement_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Progress
  progress: int("progress").default(0), // % or count
  completed: boolean("completed").default(false),
  
  // Unlock
  unlockedAt: timestamp("unlocked_at"),
  
  // Visibility
  displayOnProfile: boolean("display_on_profile").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenges (Quests)
export const challenges = mysqlTable("challenges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Challenge Details
  challengeName: varchar("challenge_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Type
  challengeType: mysqlEnum("challenge_type", [
    "daily", // Complete today
    "weekly", // Complete this week
    "one_time", // Complete once
    "recurring" // Repeats
  ]).notNull(),
  
  // Difficulty
  difficulty: int("difficulty"), // 1-10
  
  // Requirements
  requirements: text("requirements"), // JSON: what needs to be done
  
  // Rewards
  experiencePoints: int("experience_points"),
  badgeId: varchar("badge_id", { length: 255 }),
  
  // Availability
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Stats
  totalAttempts: int("total_attempts").default(0),
  totalCompletions: int("total_completions").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Challenges
export const userChallenges = mysqlTable("user_challenges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  challengeId: varchar("challenge_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Progress
  progress: int("progress").default(0),
  completed: boolean("completed").default(false),
  
  // Dates
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  
  // Attempts
  attempts: int("attempts").default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Badges
export const badges = mysqlTable("badges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Badge Details
  badgeName: varchar("badge_name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  
  // Category
  category: varchar("category", { length: 100 }),
  
  // Rarity
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]),
  
  // How to Earn
  howToEarn: text("how_to_earn"),
  
  // Stats
  totalAwarded: int("total_awarded").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// User Badges
export const userBadges = mysqlTable("user_badges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  badgeId: varchar("badge_id", { length: 255 }).notNull(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Award Details
  awardedFor: text("awarded_for"), // What did they do to earn this?
  
  // Display
  displayOnProfile: boolean("display_on_profile").default(true),
  
  awardedAt: timestamp("awarded_at").defaultNow(),
});

// Milestones
export const milestones = mysqlTable("milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Milestone Details
  milestoneType: mysqlEnum("milestone_type", [
    "first_day",
    "first_week",
    "first_month",
    "100_days",
    "1_year",
    "first_goal",
    "10_goals",
    "first_habit_mastered",
    "level_milestone",
    "transformation_milestone"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Rewards
  experiencePoints: int("experience_points"),
  
  // Context
  relatedTo: varchar("related_to", { length: 255 }), // What module/feature?
  
  achievedAt: timestamp("achieved_at").defaultNow(),
});

// Leaderboards
export const leaderboards = mysqlTable("leaderboards", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Leaderboard Details
  leaderboardName: varchar("leaderboard_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Type
  leaderboardType: mysqlEnum("leaderboard_type", [
    "overall_xp", // Total experience points
    "current_streak", // Longest current streak
    "goals_achieved", // Most goals completed
    "habits_mastered", // Most habits mastered
    "community_support", // Most helpful to others
    "transformation" // Biggest transformation
  ]).notNull(),
  
  // Time Period
  timePeriod: mysqlEnum("time_period", ["all_time", "monthly", "weekly"]),
  
  // Privacy
  optInOnly: boolean("opt_in_only").default(true), // Users must opt-in to appear
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leaderboard Entries
export const leaderboardEntries = mysqlTable("leaderboard_entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  leaderboardId: varchar("leaderboard_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Ranking
  rank: int("rank"),
  score: int("score"), // The metric being measured
  
  // Opt-In
  optedIn: boolean("opted_in").default(false),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Rewards
export const dailyRewards = mysqlTable("daily_rewards", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  rewardDate: timestamp("reward_date").notNull(),
  
  // Streak Bonus
  consecutiveDays: int("consecutive_days"),
  streakBonus: int("streak_bonus"), // Extra XP for streak
  
  // Completion Bonus
  tasksCompleted: int("tasks_completed"),
  completionBonus: int("completion_bonus"),
  
  // Total
  totalExperiencePoints: int("total_experience_points"),
  
  // Claimed
  claimed: boolean("claimed").default(false),
  claimedAt: timestamp("claimed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Motivation Boosts (AI-Triggered)
export const motivationBoosts = mysqlTable("motivation_boosts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Trigger
  triggerType: mysqlEnum("trigger_type", [
    "streak_at_risk", // About to lose streak
    "low_engagement", // Haven't logged in for days
    "goal_stalled", // No progress on goal
    "achievement_close", // Almost unlocked achievement
    "milestone_approaching" // Close to milestone
  ]).notNull(),
  
  // Boost Type
  boostType: mysqlEnum("boost_type", [
    "encouragement", // Motivational message
    "reminder", // Gentle nudge
    "challenge", // New challenge offered
    "reward_preview", // Show what they're close to earning
    "social_proof" // Others are succeeding
  ]).notNull(),
  
  // Content
  message: text("message"),
  actionSuggested: varchar("action_suggested", { length: 255 }),
  
  // Effectiveness
  opened: boolean("opened").default(false),
  actionTaken: boolean("action_taken").default(false),
  
  sentAt: timestamp("sent_at").defaultNow(),
});

// Gamification Analytics (Self-Learning)
export const gamificationAnalytics = mysqlTable("gamification_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Element Type
  elementType: varchar("element_type", { length: 100 }).notNull(), // achievement, challenge, reward, etc.
  
  // Effectiveness Metrics
  avgEngagementIncrease: decimal("avg_engagement_increase", { precision: 5, scale: 2 }), // %
  avgRetentionImpact: decimal("avg_retention_impact", { precision: 5, scale: 2 }), // %
  avgGoalCompletionImpact: decimal("avg_goal_completion_impact", { precision: 5, scale: 2 }), // %
  
  // Optimal Parameters
  optimalDifficulty: int("optimal_difficulty"), // 1-10
  optimalRewardTiming: varchar("optimal_reward_timing", { length: 100 }),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  userCount: int("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
