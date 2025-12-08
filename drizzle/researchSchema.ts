/**
 * TRUTH SEEKERS 2.0 - RESEARCH SCRAPING SYSTEM SCHEMA
 * 
 * Real-time research paper scraping, AI analysis, and module auto-updates
 * 
 * Sources:
 * - PubMed (NIH medical research)
 * - Google Scholar
 * - arXiv (preprints)
 * - medRxiv (medical preprints)
 * - bioRxiv (biology preprints)
 * - Cochrane Library
 * - ClinicalTrials.gov
 */

import { mysqlTable, varchar, text, timestamp, int, boolean, json, index } from "drizzle-orm/mysql-core";

/**
 * Research Papers Table
 * Stores all scraped research papers from various sources
 */
export const researchPapers = mysqlTable("research_papers", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Paper metadata
  title: text("title").notNull(),
  abstract: text("abstract"),
  authors: json("authors").$type<string[]>().notNull(),
  journal: text("journal"),
  publicationDate: timestamp("publication_date"),
  doi: text("doi"),
  pubmedId: varchar("pubmed_id", { length: 50 }),
  arxivId: varchar("arxiv_id", { length: 50 }),
  
  // Source tracking
  source: varchar("source", { length: 50 }).notNull(),
  sourceUrl: text("source_url"),
  pdfUrl: text("pdf_url"),
  
  // AI Analysis Results
  evidenceLevel: varchar("evidence_level", { length: 1 }),
  studyQuality: int("study_quality"),
  practicalApplicability: int("practical_applicability"),
  aiSummary: text("ai_summary"),
  keyFindings: json("key_findings").$type<string[]>(),
  
  // Module relevance
  relevantModules: json("relevant_modules").$type<string[]>(),
  recommendedActions: json("recommended_actions").$type<{
    module: string;
    action: string;
    priority: "low" | "medium" | "high";
  }[]>(),
  
  // Conflict of interest
  hasConflictOfInterest: boolean("has_conflict_of_interest").default(false),
  conflictDetails: text("conflict_details"),
  
  // Study metadata
  studyType: varchar("study_type", { length: 100 }),
  sampleSize: int("sample_size"),
  studyDuration: varchar("study_duration", { length: 100 }),
  
  // Status tracking
  isReviewed: boolean("is_reviewed").default(false),
  isApproved: boolean("is_approved").default(false),
  isImplemented: boolean("is_implemented").default(false),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  reviewedAt: timestamp("reviewed_at"),
  
  // Timestamps
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("research_papers_source_idx").on(table.source),
  evidenceLevelIdx: index("research_papers_evidence_level_idx").on(table.evidenceLevel),
  publicationDateIdx: index("research_papers_publication_date_idx").on(table.publicationDate),
  isReviewedIdx: index("research_papers_is_reviewed_idx").on(table.isReviewed),
  scrapedAtIdx: index("research_papers_scraped_at_idx").on(table.scrapedAt),
}));

/**
 * Research Scraping Jobs Table
 * Tracks scheduled scraping jobs and their status
 */
export const researchScrapingJobs = mysqlTable("research_scraping_jobs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Job configuration
  source: varchar("source", { length: 50 }).notNull(),
  searchQuery: text("search_query").notNull(),
  modules: json("modules").$type<string[]>(),
  
  // Job status
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  
  // Results
  papersFound: int("papers_found").default(0),
  papersAdded: int("papers_added").default(0),
  errorMessage: text("error_message"),
  
  // Schedule
  frequency: varchar("frequency", { length: 20 }).notNull(),
  isActive: boolean("is_active").default(true),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("research_scraping_jobs_source_idx").on(table.source),
  statusIdx: index("research_scraping_jobs_status_idx").on(table.status),
  nextRunAtIdx: index("research_scraping_jobs_next_run_at_idx").on(table.nextRunAt),
}));

/**
 * Module Research Updates Table
 * Tracks which research papers led to which module updates
 */
export const moduleResearchUpdates = mysqlTable("module_research_updates", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Relationships
  moduleName: varchar("module_name", { length: 100 }).notNull(),
  researchPaperId: varchar("research_paper_id", { length: 255 }).notNull(),
  
  // Update details
  updateType: varchar("update_type", { length: 50 }).notNull(),
  updateDescription: text("update_description").notNull(),
  oldContent: text("old_content"),
  newContent: text("new_content"),
  
  // Status
  isApplied: boolean("is_applied").default(false),
  appliedBy: varchar("applied_by", { length: 255 }),
  appliedAt: timestamp("applied_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  moduleNameIdx: index("module_research_updates_module_name_idx").on(table.moduleName),
  researchPaperIdIdx: index("module_research_updates_research_paper_id_idx").on(table.researchPaperId),
  isAppliedIdx: index("module_research_updates_is_applied_idx").on(table.isApplied),
}));

/**
 * User Research Notifications Table
 * Tracks which users have been notified about new research
 */
export const userResearchNotifications = mysqlTable("user_research_notifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Relationships
  userId: varchar("user_id", { length: 255 }).notNull(),
  researchPaperId: varchar("research_paper_id", { length: 255 }).notNull(),
  
  // Notification details
  notificationType: varchar("notification_type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  
  // Status
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_research_notifications_user_id_idx").on(table.userId),
  isReadIdx: index("user_research_notifications_is_read_idx").on(table.isRead),
  createdAtIdx: index("user_research_notifications_created_at_idx").on(table.createdAt),
}));
