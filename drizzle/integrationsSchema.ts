/**
 * INTEGRATION APIS SYSTEM
 * Enable connections with external services, wearables, apps, and platforms
 * 
 * CORE PRINCIPLES:
 * 1. Privacy First (user controls data sharing)
 * 2. Secure Authentication (OAuth 2.0, API keys)
 * 3. Bidirectional Sync (import & export)
 * 4. Error Resilience (handle API failures gracefully)
 * 5. Rate Limiting (respect API limits)
 * 6. Data Validation (ensure quality)
 * 
 * INTEGRATION CATEGORIES:
 * - Wearables (Oura, Whoop, Apple Watch, Fitbit, Garmin)
 * - Sleep Tracking (Oura, Whoop, Sleep Cycle)
 * - Fitness (Strava, MyFitnessPal, Strong, Peloton)
 * - Meditation (Headspace, Calm, Insight Timer)
 * - Productivity (Todoist, Notion, Google Calendar)
 * - Health (Apple Health, Google Fit)
 * - Nutrition (MyFitnessPal, Cronometer)
 * - Mental Health (Moodpath, Daylio)
 * - Finance (Mint, YNAB)
 * - Communication (Slack, Discord for community)
 * 
 * DATA TYPES:
 * - Biometric data (HRV, heart rate, sleep, activity)
 * - Behavioral data (habits, tasks, calendar events)
 * - Wellness data (mood, energy, stress)
 * - Performance data (workouts, nutrition, productivity)
 * 
 * SELF-LEARNING CAPABILITIES:
 * - Identifies most valuable integrations per user
 * - Learns optimal sync frequency
 * - Detects data quality issues
 * - Suggests new integrations based on goals
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

// Integration Profiles
export const integrationProfiles = mysqlTable("integration_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Integration Preferences
  autoSyncEnabled: boolean("auto_sync_enabled").default(true),
  syncFrequency: mysqlEnum("sync_frequency", ["realtime", "hourly", "daily", "manual"]).default("daily"),
  
  // Privacy
  dataSharing: mysqlEnum("data_sharing", ["minimal", "standard", "full"]).default("standard"),
  
  // Stats
  totalIntegrations: int("total_integrations").default(0),
  activeIntegrations: int("active_integrations").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Available Integrations
export const availableIntegrations = mysqlTable("available_integrations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Integration Details
  integrationName: varchar("integration_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Provider
  provider: varchar("provider", { length: 255 }).notNull(), // Oura, Whoop, etc.
  
  // Category
  category: mysqlEnum("category", [
    "wearable",
    "sleep_tracking",
    "fitness",
    "meditation",
    "productivity",
    "health",
    "nutrition",
    "mental_health",
    "finance",
    "communication",
    "other"
  ]).notNull(),
  
  // Authentication
  authType: mysqlEnum("auth_type", ["oauth2", "api_key", "webhook", "manual"]).notNull(),
  
  // Capabilities
  capabilities: text("capabilities"), // JSON: what data can be imported/exported
  
  // Data Types
  dataTypesSupported: text("data_types_supported"), // JSON: sleep, hrv, activity, etc.
  
  // Sync
  supportsRealtime: boolean("supports_realtime").default(false),
  supportsBidirectional: boolean("supports_bidirectional").default(false),
  
  // API Details
  apiEndpoint: varchar("api_endpoint", { length: 500 }),
  apiDocumentation: varchar("api_documentation", { length: 500 }),
  rateLimitPerHour: int("rate_limit_per_hour"),
  
  // Status
  active: boolean("active").default(true),
  beta: boolean("beta").default(false),
  
  // Popularity
  totalUsers: int("total_users").default(0),
  avgSatisfactionRating: decimal("avg_satisfaction_rating", { precision: 4, scale: 2 }), // 1-10
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Integrations
export const userIntegrations = mysqlTable("user_integrations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  integrationId: varchar("integration_id", { length: 255 }).notNull(),
  
  // Connection Status
  status: mysqlEnum("status", [
    "connected",
    "disconnected",
    "error",
    "pending_auth",
    "expired"
  ]).default("pending_auth"),
  
  // Authentication
  accessToken: varchar("access_token", { length: 500 }), // Encrypted
  refreshToken: varchar("refresh_token", { length: 500 }), // Encrypted
  tokenExpiresAt: timestamp("token_expires_at"),
  
  // API Key (if applicable)
  apiKey: varchar("api_key", { length: 500 }), // Encrypted
  
  // Sync Settings
  syncEnabled: boolean("sync_enabled").default(true),
  syncFrequency: mysqlEnum("sync_frequency", ["realtime", "hourly", "daily", "manual"]).default("daily"),
  lastSyncAt: timestamp("last_sync_at"),
  nextSyncAt: timestamp("next_sync_at"),
  
  // Data Filters
  dataTypesToSync: text("data_types_to_sync"), // JSON: which data types to import
  
  // Stats
  totalSyncs: int("total_syncs").default(0),
  totalRecordsImported: int("total_records_imported").default(0),
  totalRecordsExported: int("total_records_exported").default(0),
  
  // Errors
  lastError: text("last_error"),
  errorCount: int("error_count").default(0),
  
  // User Satisfaction
  satisfactionRating: int("satisfaction_rating"), // 1-10
  
  connectedAt: timestamp("connected_at").defaultNow(),
  disconnectedAt: timestamp("disconnected_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sync Logs
export const syncLogs = mysqlTable("sync_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userIntegrationId: varchar("user_integration_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Sync Details
  syncType: mysqlEnum("sync_type", ["import", "export", "bidirectional"]).notNull(),
  
  // Status
  status: mysqlEnum("status", ["started", "in_progress", "completed", "failed"]).default("started"),
  
  // Data
  recordsProcessed: int("records_processed").default(0),
  recordsSuccessful: int("records_successful").default(0),
  recordsFailed: int("records_failed").default(0),
  
  // Duration
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  durationSeconds: int("duration_seconds"),
  
  // Errors
  errorMessage: text("error_message"),
  errorDetails: text("error_details"), // JSON: detailed error info
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Imported Data
export const importedData = mysqlTable("imported_data", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userIntegrationId: varchar("user_integration_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Data Type
  dataType: mysqlEnum("data_type", [
    "sleep",
    "hrv",
    "heart_rate",
    "activity",
    "steps",
    "calories",
    "workout",
    "nutrition",
    "weight",
    "mood",
    "meditation",
    "task",
    "calendar_event",
    "transaction",
    "other"
  ]).notNull(),
  
  // Source
  sourceId: varchar("source_id", { length: 255 }), // ID in source system
  
  // Data
  dataPayload: text("data_payload"), // JSON: the actual data
  
  // Timestamp
  dataTimestamp: timestamp("data_timestamp").notNull(), // When did this data occur?
  
  // Mapping
  mappedToId: varchar("mapped_to_id", { length: 255 }), // ID in our system (sleep log, workout, etc.)
  mappedToType: varchar("mapped_to_type", { length: 100 }), // Which table?
  
  // Quality
  dataQuality: mysqlEnum("data_quality", ["high", "medium", "low"]),
  validationErrors: text("validation_errors"), // JSON: any validation issues
  
  importedAt: timestamp("imported_at").defaultNow(),
});

// Exported Data
export const exportedData = mysqlTable("exported_data", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userIntegrationId: varchar("user_integration_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Data Type
  dataType: varchar("data_type", { length: 100 }).notNull(),
  
  // Source (in our system)
  sourceId: varchar("source_id", { length: 255 }).notNull(),
  sourceType: varchar("source_type", { length: 100 }).notNull(),
  
  // Data
  dataPayload: text("data_payload"), // JSON: the data we sent
  
  // Destination
  destinationId: varchar("destination_id", { length: 255 }), // ID in destination system
  
  // Status
  status: mysqlEnum("status", ["pending", "sent", "confirmed", "failed"]).default("pending"),
  
  // Error
  errorMessage: text("error_message"),
  
  exportedAt: timestamp("exported_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

// Webhooks
export const webhooks = mysqlTable("webhooks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userIntegrationId: varchar("user_integration_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Webhook Details
  webhookUrl: varchar("webhook_url", { length: 500 }).notNull(),
  webhookSecret: varchar("webhook_secret", { length: 255 }), // For verification
  
  // Events
  eventTypes: text("event_types"), // JSON: which events to listen for
  
  // Status
  active: boolean("active").default(true),
  
  // Stats
  totalReceived: int("total_received").default(0),
  lastReceivedAt: timestamp("last_received_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhook Events
export const webhookEvents = mysqlTable("webhook_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  webhookId: varchar("webhook_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Event Details
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventPayload: text("event_payload"), // JSON: the webhook payload
  
  // Processing
  processed: boolean("processed").default(false),
  processedAt: timestamp("processed_at"),
  
  // Error
  processingError: text("processing_error"),
  
  receivedAt: timestamp("received_at").defaultNow(),
});

// API Rate Limits
export const apiRateLimits = mysqlTable("api_rate_limits", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userIntegrationId: varchar("user_integration_id", { length: 255 }).notNull(),
  
  // Rate Limit Details
  requestsPerHour: int("requests_per_hour"),
  requestsPerDay: int("requests_per_day"),
  
  // Current Usage
  requestsThisHour: int("requests_this_hour").default(0),
  requestsToday: int("requests_today").default(0),
  
  // Reset Times
  hourResetAt: timestamp("hour_reset_at"),
  dayResetAt: timestamp("day_reset_at"),
  
  // Throttling
  throttled: boolean("throttled").default(false),
  throttledUntil: timestamp("throttled_until"),
  
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data Mapping Rules
export const dataMappingRules = mysqlTable("data_mapping_rules", {
  id: varchar("id", { length: 255 }).primaryKey(),
  integrationId: varchar("integration_id", { length: 255 }).notNull(),
  
  // Source Field
  sourceField: varchar("source_field", { length: 255 }).notNull(),
  sourceDataType: varchar("source_data_type", { length: 100 }),
  
  // Destination Field
  destinationTable: varchar("destination_table", { length: 255 }).notNull(),
  destinationField: varchar("destination_field", { length: 255 }).notNull(),
  
  // Transformation
  transformationRule: text("transformation_rule"), // JSON: how to transform the data
  
  // Validation
  validationRule: text("validation_rule"), // JSON: how to validate the data
  
  // Required
  required: boolean("required").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integration Analytics (Self-Learning)
export const integrationAnalytics = mysqlTable("integration_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  integrationId: varchar("integration_id", { length: 255 }).notNull(),
  
  // Usage Stats
  totalUsers: int("total_users").default(0),
  activeUsers: int("active_users").default(0),
  
  // Sync Stats
  avgSyncsPerDay: decimal("avg_syncs_per_day", { precision: 6, scale: 2 }),
  avgRecordsPerSync: decimal("avg_records_per_sync", { precision: 8, scale: 2 }),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // %
  
  // Data Quality
  avgDataQuality: decimal("avg_data_quality", { precision: 4, scale: 2 }), // 1-10
  
  // User Satisfaction
  avgSatisfactionRating: decimal("avg_satisfaction_rating", { precision: 4, scale: 2 }), // 1-10
  
  // Value
  avgBehaviorImpact: decimal("avg_behavior_impact", { precision: 5, scale: 2 }), // % improvement
  
  // Optimal Parameters
  optimalSyncFrequency: varchar("optimal_sync_frequency", { length: 100 }),
  
  // Issues
  commonErrors: text("common_errors"), // JSON: most frequent errors
  
  lastCalculated: timestamp("last_calculated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integration Recommendations
export const integrationRecommendations = mysqlTable("integration_recommendations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profileId: varchar("profile_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  integrationId: varchar("integration_id", { length: 255 }).notNull(),
  
  // Recommendation Reason
  reason: text("reason"), // Why is this integration recommended?
  
  // Potential Value
  potentialValue: text("potential_value"), // What could user gain?
  
  // Confidence
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // %
  
  // Status
  status: mysqlEnum("status", ["pending", "accepted", "declined", "deferred"]).default("pending"),
  
  // User Response
  userFeedback: text("user_feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Export Requests
export const exportRequests = mysqlTable("export_requests", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Export Type
  exportType: mysqlEnum("export_type", [
    "full_data_export", // All user data
    "module_export", // Specific module data
    "date_range_export", // Data from date range
    "custom_export" // Custom query
  ]).notNull(),
  
  // Format
  exportFormat: mysqlEnum("export_format", ["json", "csv", "pdf", "xlsx"]).notNull(),
  
  // Filters
  filters: text("filters"), // JSON: what to include
  
  // Status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  
  // File
  filePath: varchar("file_path", { length: 500 }),
  fileSize: int("file_size"), // bytes
  
  // Download
  downloadUrl: varchar("download_url", { length: 500 }),
  expiresAt: timestamp("expires_at"), // Download link expiry
  
  // Error
  errorMessage: text("error_message"),
  
  requestedAt: timestamp("requested_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});
