/**
 * Crisis Alerts Schema
 * Track all crisis detections and interventions
 */

import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const crisisAlerts = pgTable("crisis_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Session/User tracking
  sessionId: uuid("session_id").references(() => require("./schema-postgresql").anonymousSessions.id),
  userId: integer("user_id").references(() => require("./schema-postgresql").users.id),
  
  // Alert details
  alertType: varchar("alert_type", { length: 50 }).notNull(), // suicide, self-harm, abuse, violence, substance
  riskScore: integer("risk_score").notNull(), // 0-100
  status: varchar("status", { length: 50 }).notNull().default("new"), // new, reviewing, resolved, escalated
  
  // Detection details
  keywords: jsonb("keywords").notNull().default(sql`'[]'::jsonb`), // Array of matched keywords
  context: text("context").notNull(), // Message that triggered alert
  fullConversation: jsonb("full_conversation").default(sql`'[]'::jsonb`), // Full conversation history
  
  // Response tracking
  responseGenerated: text("response_generated"), // AI crisis response sent
  resourcesProvided: jsonb("resources_provided").default(sql`'{}'::jsonb`), // Emergency resources shown
  
  // Follow-up
  assignedTo: varchar("assigned_to", { length: 255 }), // Admin/coach assigned
  assignedAt: timestamp("assigned_at"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  escalatedToEmergency: boolean("escalated_to_emergency").default(false),
  
  // Metadata
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const crisisAlertNotifications = pgTable("crisis_alert_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  alertId: uuid("alert_id").references(() => crisisAlerts.id).notNull(),
  
  // Notification details
  notificationType: varchar("notification_type", { length: 50 }).notNull(), // email, sms, slack, webhook
  recipient: varchar("recipient", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, sent, failed
  
  // Delivery tracking
  sentAt: timestamp("sent_at"),
  failedAt: timestamp("failed_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
