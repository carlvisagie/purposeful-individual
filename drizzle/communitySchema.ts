/**
 * COMMUNITY & SUPPORT NETWORK
 * Evidence-based approach using Social Psychology, Group Dynamics, and Peer Support Research
 * Research sources: Brené Brown (vulnerability & connection), Johann Hari (social connection & addiction),
 * Robert Putnam (social capital), AA/12-step peer support models, Alcoholics Anonymous research,
 * Social support & health outcomes (Julianne Holt-Lunstad), accountability partner research
 * 
 * CORE PRINCIPLES:
 * 1. Shared Struggles Create Connection (you're not alone)
 * 2. Accountability Partners (peer support)
 * 3. Vulnerability & Authenticity (Brené Brown)
 * 4. Celebration of Wins (positive reinforcement)
 * 5. Safe Spaces (moderated, supportive environment)
 * 6. Mentorship (those ahead help those behind)
 * 
 * COMMUNITY TYPES:
 * - Challenge-based (mental health, addiction, autism parents, young men, etc.)
 * - Goal-based (fitness, career, relationships)
 * - General support (daily check-ins, wins, struggles)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Matches users with compatible accountability partners
 * - Identifies most supportive community members
 * - Learns which types of support are most effective
 * - Predicts when users need extra support
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// User Community Profiles
export const communityProfiles = mysqlTable("community_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Display Info
  displayName: varchar("display_name", { length: 100 }).notNull(),
  bio: text("bio"),
  profilePhoto: varchar("profile_photo", { length: 500 }),
  
  // Sharing Preferences
  shareProgress: boolean("share_progress").default(true),
  shareStruggles: boolean("share_struggles").default(true),
  shareWins: boolean("share_wins").default(true),
  
  // What They're Working On
  primaryChallenges: text("primary_challenges"), // JSON array: mental_health, addiction, autism, etc.
  primaryGoals: text("primary_goals"), // JSON array
  
  // Community Role
  role: mysqlEnum("role", ["member", "mentor", "moderator", "admin"]).default("member"),
  
  // Mentor Availability (if mentor)
  availableAsMentor: boolean("available_as_mentor").default(false),
  mentorshipAreas: text("mentorship_areas"), // JSON array: what can they help with?
  
  // Engagement
  totalPosts: int("total_posts").default(0),
  totalComments: int("total_comments").default(0),
  totalSupportsGiven: int("total_supports_given").default(0), // Likes, encouragements
  totalSupportsReceived: int("total_supports_received").default(0),
  
  // Reputation
  helpfulnessScore: int("helpfulness_score").default(0), // Community-voted
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communities (Groups)
export const communities = mysqlTable("communities", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Community Info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverImage: varchar("cover_image", { length: 500 }),
  
  // Type
  communityType: mysqlEnum("community_type", [
    "mental_health_recovery",
    "addiction_recovery",
    "autism_parents",
    "young_men",
    "relationships",
    "career_growth",
    "fitness",
    "spiritual_growth",
    "general_support"
  ]).notNull(),
  
  // Privacy
  privacy: mysqlEnum("privacy", ["public", "private", "invite_only"]).default("public"),
  
  // Moderation
  moderatorIds: text("moderator_ids"), // JSON array of user IDs
  
  // Guidelines
  guidelines: text("guidelines"),
  
  // Stats
  memberCount: int("member_count").default(0),
  activeMembers: int("active_members").default(0), // Active in last 30 days
  totalPosts: int("total_posts").default(0),
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community Memberships
export const communityMemberships = mysqlTable("community_memberships", {
  id: varchar("id", { length: 255 }).primaryKey(),
  communityId: varchar("community_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Role in Community
  role: mysqlEnum("role", ["member", "moderator", "admin"]).default("member"),
  
  // Engagement
  lastActiveAt: timestamp("last_active_at"),
  postsCount: int("posts_count").default(0),
  commentsCount: int("comments_count").default(0),
  
  // Notifications
  notificationsEnabled: boolean("notifications_enabled").default(true),
  
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Posts
export const communityPosts = mysqlTable("community_posts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  communityId: varchar("community_id", { length: 255 }).notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  
  // Post Type
  postType: mysqlEnum("post_type", [
    "win", // Celebrating a victory
    "struggle", // Asking for support
    "question", // Seeking advice
    "check_in", // Daily check-in
    "milestone", // Achievement
    "gratitude", // Expressing thanks
    "resource", // Sharing helpful content
    "discussion" // General discussion
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  images: text("images"), // JSON array of image URLs
  
  // Tags
  tags: text("tags"), // JSON array
  
  // Engagement
  likesCount: int("likes_count").default(0),
  commentsCount: int("comments_count").default(0),
  supportsCount: int("supports_count").default(0), // "You got this!" reactions
  
  // Moderation
  flagged: boolean("flagged").default(false),
  flagReason: text("flag_reason"),
  
  // Visibility
  visible: boolean("visible").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments
export const communityComments = mysqlTable("community_comments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  postId: varchar("post_id", { length: 255 }).notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  
  // Content
  content: text("content").notNull(),
  
  // Engagement
  likesCount: int("likes_count").default(0),
  
  // Moderation
  flagged: boolean("flagged").default(false),
  
  // Visibility
  visible: boolean("visible").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Accountability Partners
export const accountabilityPartnerships = mysqlTable("accountability_partnerships", {
  id: varchar("id", { length: 255 }).primaryKey(),
  user1Id: varchar("user1_id", { length: 255 }).notNull(),
  user2Id: varchar("user2_id", { length: 255 }).notNull(),
  
  // Partnership Details
  sharedGoals: text("shared_goals"), // JSON array: what are they working on together?
  checkInFrequency: mysqlEnum("check_in_frequency", ["daily", "weekly", "biweekly", "monthly"]),
  
  // Communication
  lastCheckIn: timestamp("last_check_in"),
  totalCheckIns: int("total_check_ins").default(0),
  
  // Effectiveness
  partnershipSatisfaction: int("partnership_satisfaction"), // 1-10 (from both partners)
  helpfulnessRating: int("helpfulness_rating"), // 1-10
  
  // Status
  status: mysqlEnum("status", ["active", "paused", "ended"]).default("active"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Check-Ins (Accountability Partner)
export const partnerCheckIns = mysqlTable("partner_check_ins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  partnershipId: varchar("partnership_id", { length: 255 }).notNull(),
  initiatorId: varchar("initiator_id", { length: 255 }).notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  
  // User 1 Update
  user1Progress: text("user1_progress"),
  user1Struggles: text("user1_struggles"),
  user1Wins: text("user1_wins"),
  user1NextSteps: text("user1_next_steps"),
  
  // User 2 Update
  user2Progress: text("user2_progress"),
  user2Struggles: text("user2_struggles"),
  user2Wins: text("user2_wins"),
  user2NextSteps: text("user2_next_steps"),
  
  // Mutual Support
  encouragementGiven: text("encouragement_given"), // What they said to each other
  
  // Effectiveness
  helpfulness: int("helpfulness"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Mentorship Relationships
export const mentorships = mysqlTable("mentorships", {
  id: varchar("id", { length: 255 }).primaryKey(),
  mentorId: varchar("mentor_id", { length: 255 }).notNull(),
  menteeId: varchar("mentee_id", { length: 255 }).notNull(),
  
  // Focus Area
  focusArea: varchar("focus_area", { length: 255 }).notNull(), // What is the mentorship about?
  
  // Frequency
  meetingFrequency: mysqlEnum("meeting_frequency", ["weekly", "biweekly", "monthly"]),
  
  // Progress
  totalSessions: int("total_sessions").default(0),
  lastSession: timestamp("last_session"),
  
  // Effectiveness
  menteeProgress: int("mentee_progress"), // 1-10: How much has mentee improved?
  menteeSatisfaction: int("mentee_satisfaction"), // 1-10
  
  // Status
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily Check-Ins (Community-wide)
export const dailyCheckIns = mysqlTable("daily_check_ins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  
  // How Are You?
  mood: varchar("mood", { length: 100 }),
  energy: int("energy"), // 1-10
  
  // Today's Focus
  todayGoals: text("today_goals"), // JSON array
  
  // Gratitude
  gratefulFor: text("grateful_for"),
  
  // Struggles
  strugglingWith: text("struggling_with"),
  needSupport: boolean("need_support").default(false),
  
  // Wins
  winsToday: text("wins_today"),
  
  // Visibility
  shareWithCommunity: boolean("share_with_community").default(true),
  
  // Engagement
  supportsReceived: int("supports_received").default(0),
  commentsReceived: int("comments_received").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Challenges
export const communityChallenges = mysqlTable("community_challenges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  communityId: varchar("community_id", { length: 255 }),
  
  // Challenge Details
  challengeName: varchar("challenge_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Type
  challengeType: mysqlEnum("challenge_type", [
    "habit_building", // 30-day habit challenge
    "goal_achievement", // Specific goal
    "streak", // Longest streak wins
    "transformation" // Before/after
  ]).notNull(),
  
  // Duration
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  duration: int("duration"), // days
  
  // Participation
  participantCount: int("participant_count").default(0),
  
  // Status
  status: mysqlEnum("status", ["upcoming", "active", "completed"]).default("upcoming"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Challenge Participants
export const challengeParticipants = mysqlTable("challenge_participants", {
  id: varchar("id", { length: 255 }).primaryKey(),
  challengeId: varchar("challenge_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Progress
  currentStreak: int("current_streak").default(0),
  longestStreak: int("longest_streak").default(0),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // %
  
  // Updates
  lastUpdate: timestamp("last_update"),
  
  // Completion
  completed: boolean("completed").default(false),
  
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Community Analytics (Self-Learning)
export const communityAnalytics = mysqlTable("community_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Support Type Effectiveness
  supportType: varchar("support_type", { length: 100 }).notNull(), // accountability, mentorship, group
  
  // Impact Metrics
  avgUserRetention: decimal("avg_user_retention", { precision: 5, scale: 2 }), // %
  avgGoalAchievement: decimal("avg_goal_achievement", { precision: 5, scale: 2 }), // %
  avgSatisfaction: decimal("avg_satisfaction", { precision: 4, scale: 2 }), // 1-10
  
  // Optimal Parameters
  optimalCheckInFrequency: varchar("optimal_check_in_frequency", { length: 50 }),
  optimalGroupSize: int("optimal_group_size"),
  
  // User Segments
  mostEffectiveFor: text("most_effective_for"), // JSON: different user types
  
  // Sample Size
  userCount: int("user_count"),
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
