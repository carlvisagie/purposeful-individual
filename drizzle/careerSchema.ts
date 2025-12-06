/**
 * CAREER & PURPOSE MODULE
 * Evidence-based approach using Career Development Theory, Ikigai, and Purpose Research
 * Research sources: Stanford Career Development, Positive Psychology, Purpose Research (Damon, Bronk)
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Career Profiles
export const careerProfiles = mysqlTable("career_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Current Status
  employmentStatus: mysqlEnum("employment_status", [
    "employed_full_time",
    "employed_part_time",
    "self_employed",
    "unemployed",
    "student",
    "career_transition",
    "retired"
  ]).notNull(),
  
  currentRole: varchar("current_role", { length: 255 }),
  currentIndustry: varchar("current_industry", { length: 255 }),
  yearsExperience: int("years_experience"),
  
  // Career Goals
  primaryGoal: mysqlEnum("primary_goal", [
    "find_first_job",
    "career_change",
    "advancement",
    "entrepreneurship",
    "find_purpose",
    "work_life_balance",
    "skill_development",
    "leadership_role"
  ]).notNull(),
  
  targetRole: varchar("target_role", { length: 255 }),
  targetIndustry: varchar("target_industry", { length: 255 }),
  targetTimeline: int("target_timeline"), // months
  
  // Ikigai Framework (What you love, what you're good at, what the world needs, what you can be paid for)
  whatYouLove: text("what_you_love"), // JSON array
  whatYoureGoodAt: text("what_youre_good_at"), // JSON array
  whatWorldNeeds: text("what_world_needs"), // JSON array
  whatYouCanBePaidFor: text("what_you_can_be_paid_for"), // JSON array
  
  // Purpose Statement
  purposeStatement: text("purpose_statement"),
  coreValues: text("core_values"), // JSON array
  
  // Skills & Strengths
  currentSkills: text("current_skills"), // JSON array
  skillsToLearn: text("skills_to_learn"), // JSON array
  strengths: text("strengths"), // JSON array (based on VIA Character Strengths or StrengthsFinder)
  
  // Barriers & Challenges
  mainBarriers: text("main_barriers"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job Search Tracking
export const jobSearchActivities = mysqlTable("job_search_activities", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  activityDate: timestamp("activity_date").notNull(),
  
  activityType: mysqlEnum("activity_type", [
    "application_submitted",
    "networking_event",
    "informational_interview",
    "phone_screen",
    "interview",
    "follow_up",
    "offer_received",
    "rejection"
  ]).notNull(),
  
  // Job Details
  companyName: varchar("company_name", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  jobUrl: text("job_url"),
  
  // Application Details
  applicationMethod: varchar("application_method", { length: 255 }), // LinkedIn, company site, referral, etc.
  referralSource: varchar("referral_source", { length: 255 }),
  
  // Interview Details
  interviewType: mysqlEnum("interview_type", ["phone", "video", "in_person", "panel", "technical"]),
  interviewRound: int("interview_round"),
  interviewNotes: text("interview_notes"),
  
  // Outcome
  status: mysqlEnum("status", ["pending", "interviewing", "offered", "rejected", "accepted", "declined"]),
  
  // Follow-up
  nextSteps: text("next_steps"),
  followUpDate: timestamp("follow_up_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Networking Contacts
export const networkingContacts = mysqlTable("networking_contacts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Contact Info
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  company: varchar("company", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  
  // Connection
  howMet: text("how_met"),
  connectionStrength: mysqlEnum("connection_strength", ["weak", "moderate", "strong"]),
  
  // Contact Details
  email: varchar("email", { length: 255 }),
  linkedIn: varchar("linkedin", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  
  // Relationship
  lastContact: timestamp("last_contact"),
  contactFrequency: mysqlEnum("contact_frequency", ["monthly", "quarterly", "yearly", "as_needed"]),
  
  // Value Exchange
  howTheyCanHelp: text("how_they_can_help"),
  howYouCanHelp: text("how_you_can_help"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skill Development Tracking
export const skillDevelopment = mysqlTable("skill_development", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  skillName: varchar("skill_name", { length: 255 }).notNull(),
  skillCategory: mysqlEnum("skill_category", ["technical", "soft_skill", "leadership", "industry_specific"]),
  
  // Current Level
  currentLevel: mysqlEnum("current_level", ["beginner", "intermediate", "advanced", "expert"]),
  targetLevel: mysqlEnum("target_level", ["beginner", "intermediate", "advanced", "expert"]),
  
  // Learning Plan
  learningResources: text("learning_resources"), // JSON array: [{type, name, url, cost}]
  practiceActivities: text("practice_activities"), // JSON array
  
  // Progress
  hoursInvested: decimal("hours_invested", { precision: 10, scale: 2 }).default("0"),
  completedMilestones: text("completed_milestones"), // JSON array
  
  // Application
  projectsUsed: text("projects_used"), // JSON array
  certificationsEarned: text("certifications_earned"), // JSON array
  
  // Timeline
  startDate: timestamp("start_date"),
  targetCompletionDate: timestamp("target_completion_date"),
  completionDate: timestamp("completion_date"),
  
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "on_hold"]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purpose Exploration Activities
export const purposeActivities = mysqlTable("purpose_activities", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  activityDate: timestamp("activity_date").notNull(),
  
  // Activity Type (evidence-based purpose discovery methods)
  activityType: mysqlEnum("activity_type", [
    "values_clarification",
    "life_review",
    "peak_experiences",
    "ideal_day_visualization",
    "legacy_reflection",
    "contribution_mapping",
    "meaning_making"
  ]).notNull(),
  
  // Reflections
  insights: text("insights"),
  patterns: text("patterns"), // What patterns emerged?
  emotions: text("emotions"),
  
  // Purpose Elements Discovered
  passions: text("passions"), // JSON array
  strengths: text("strengths"),
  values: text("values"),
  impact: text("impact"), // How you want to contribute
  
  // Integration
  actionSteps: text("action_steps"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Career Experiments - Test before committing
export const careerExperiments = mysqlTable("career_experiments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  experimentType: mysqlEnum("experiment_type", [
    "informational_interview",
    "job_shadowing",
    "freelance_project",
    "volunteer_work",
    "side_project",
    "online_course",
    "industry_event"
  ]).notNull(),
  
  experimentName: varchar("experiment_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Hypothesis
  hypothesis: text("hypothesis"), // What are you testing?
  successCriteria: text("success_criteria"), // How will you know if it's a fit?
  
  // Timeline
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Results
  whatYouLearned: text("what_you_learned"),
  whatYouLiked: text("what_you_liked"),
  whatYouDisliked: text("what_you_disliked"),
  
  // Decision
  conclusion: text("conclusion"),
  nextSteps: text("next_steps"),
  
  status: mysqlEnum("status", ["planned", "in_progress", "completed"]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Career Milestones
export const careerMilestones = mysqlTable("career_milestones", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  milestoneType: mysqlEnum("milestone_type", [
    "job_offer",
    "promotion",
    "skill_mastery",
    "certification",
    "project_completion",
    "network_milestone",
    "business_launch",
    "revenue_milestone"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  targetDate: timestamp("target_date"),
  achievedDate: timestamp("achieved_date"),
  
  progress: int("progress"), // 0-100%
  status: mysqlEnum("status", ["not_started", "in_progress", "achieved"]),
  
  impact: text("impact"), // How did this move you toward your purpose?
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
