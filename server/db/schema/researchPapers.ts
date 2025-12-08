import { pgTable, text, timestamp, integer, boolean, jsonb, varchar, index } from "drizzle-orm/pg-core";

/**
 * Research Papers Table
 * Stores all scraped research papers from various sources
 */
export const researchPapers = pgTable("research_papers", {
  id: text("id").primaryKey(), // Use DOI or PubMed ID as primary key
  
  // Paper metadata
  title: text("title").notNull(),
  abstract: text("abstract"),
  authors: jsonb("authors").$type<string[]>().notNull(), // Array of author names
  journal: text("journal"),
  publicationDate: timestamp("publication_date"),
  doi: text("doi"), // Digital Object Identifier
  pubmedId: text("pubmed_id"), // PubMed ID
  arxivId: text("arxiv_id"), // arXiv ID
  
  // Source tracking
  source: varchar("source", { length: 50 }).notNull(), // pubmed, scholar, arxiv, medrxiv, etc.
  sourceUrl: text("source_url"),
  pdfUrl: text("pdf_url"),
  
  // AI Analysis Results
  evidenceLevel: varchar("evidence_level", { length: 1 }), // A, B, or C (Oxford CEBM)
  studyQuality: integer("study_quality"), // 1-10 score
  practicalApplicability: integer("practical_applicability"), // 1-10 score
  aiSummary: text("ai_summary"), // AI-generated plain English summary
  keyFindings: jsonb("key_findings").$type<string[]>(), // Bullet points of key findings
  
  // Module relevance
  relevantModules: jsonb("relevant_modules").$type<string[]>(), // Array of module names
  recommendedActions: jsonb("recommended_actions").$type<{
    module: string;
    action: string;
    priority: "low" | "medium" | "high";
  }[]>(), // Suggested updates to modules
  
  // Conflict of interest
  hasConflictOfInterest: boolean("has_conflict_of_interest").default(false),
  conflictDetails: text("conflict_details"),
  
  // Study metadata
  studyType: varchar("study_type", { length: 100 }), // RCT, meta-analysis, cohort, etc.
  sampleSize: integer("sample_size"),
  studyDuration: text("study_duration"), // e.g., "12 weeks", "5 years"
  
  // Status tracking
  isReviewed: boolean("is_reviewed").default(false), // Admin reviewed
  isApproved: boolean("is_approved").default(false), // Approved for module updates
  isImplemented: boolean("is_implemented").default(false), // Changes applied to modules
  reviewedBy: text("reviewed_by"), // Admin user ID
  reviewedAt: timestamp("reviewed_at"),
  
  // Timestamps
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Indexes for fast queries
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
export const researchScrapingJobs = pgTable("research_scraping_jobs", {
  id: text("id").primaryKey(),
  
  // Job configuration
  source: varchar("source", { length: 50 }).notNull(), // pubmed, scholar, etc.
  searchQuery: text("search_query").notNull(),
  modules: jsonb("modules").$type<string[]>(), // Which modules this job is for
  
  // Job status
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, running, completed, failed
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  
  // Results
  papersFound: integer("papers_found").default(0),
  papersAdded: integer("papers_added").default(0),
  errorMessage: text("error_message"),
  
  // Schedule
  frequency: varchar("frequency", { length: 20 }).notNull(), // daily, weekly, monthly
  isActive: boolean("is_active").default(true),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  sourceIdx: index("research_scraping_jobs_source_idx").on(table.source),
  statusIdx: index("research_scraping_jobs_status_idx").on(table.status),
  nextRunAtIdx: index("research_scraping_jobs_next_run_at_idx").on(table.nextRunAt),
}));

/**
 * Module Research Updates Table
 * Tracks which research papers led to which module updates
 */
export const moduleResearchUpdates = pgTable("module_research_updates", {
  id: text("id").primaryKey(),
  
  // Relationships
  moduleName: varchar("module_name", { length: 100 }).notNull(),
  researchPaperId: text("research_paper_id").notNull().references(() => researchPapers.id),
  
  // Update details
  updateType: varchar("update_type", { length: 50 }).notNull(), // new_protocol, updated_evidence, deprecated_intervention
  updateDescription: text("update_description").notNull(),
  oldContent: text("old_content"), // What was changed
  newContent: text("new_content"), // What it was changed to
  
  // Status
  isApplied: boolean("is_applied").default(false),
  appliedBy: text("applied_by"), // Admin user ID
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
export const userResearchNotifications = pgTable("user_research_notifications", {
  id: text("id").primaryKey(),
  
  // Relationships
  userId: text("user_id").notNull(),
  researchPaperId: text("research_paper_id").notNull().references(() => researchPapers.id),
  
  // Notification details
  notificationType: varchar("notification_type", { length: 50 }).notNull(), // new_discovery, module_update, breakthrough
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
