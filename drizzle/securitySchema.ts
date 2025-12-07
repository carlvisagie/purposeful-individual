/**
 * SECURITY & AUDIT SYSTEM
 * Comprehensive security, compliance, and audit trail management
 * 
 * CORE PRINCIPLES:
 * 1. Defense in Depth (multiple security layers)
 * 2. Least Privilege (minimal access by default)
 * 3. Zero Trust (verify everything)
 * 4. Audit Everything (complete trail)
 * 5. Privacy by Design (GDPR, HIPAA compliant)
 * 6. Incident Response (detect & respond)
 * 
 * SECURITY FEATURES:
 * - Multi-factor authentication (MFA)
 * - Session management
 * - IP whitelisting/blacklisting
 * - Rate limiting
 * - Suspicious activity detection
 * - Data encryption (at rest & in transit)
 * - Audit logging
 * 
 * COMPLIANCE:
 * - GDPR (General Data Protection Regulation)
 * - HIPAA (Health Insurance Portability and Accountability Act)
 * - SOC 2 (Service Organization Control)
 * - ISO 27001 (Information Security Management)
 */

import { mysqlTable, varchar, text, int, timestamp, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

// Security Profiles
export const securityProfiles = mysqlTable("security_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // Multi-Factor Authentication
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaMethod: mysqlEnum("mfa_method", ["totp", "sms", "email", "authenticator_app"]),
  mfaSecret: varchar("mfa_secret", { length: 500 }), // Encrypted
  mfaBackupCodes: text("mfa_backup_codes"), // Encrypted JSON array
  
  // Password
  passwordHash: varchar("password_hash", { length: 500 }).notNull(),
  passwordSalt: varchar("password_salt", { length: 255 }),
  passwordLastChanged: timestamp("password_last_changed"),
  passwordExpiresAt: timestamp("password_expires_at"),
  
  // Password Policy
  requirePasswordChange: boolean("require_password_change").default(false),
  
  // Security Questions (backup recovery)
  securityQuestions: text("security_questions"), // Encrypted JSON
  
  // Account Security
  accountLocked: boolean("account_locked").default(false),
  accountLockedUntil: timestamp("account_locked_until"),
  accountLockedReason: text("account_locked_reason"),
  
  // Failed Login Attempts
  failedLoginAttempts: int("failed_login_attempts").default(0),
  lastFailedLoginAt: timestamp("last_failed_login_at"),
  
  // Suspicious Activity
  suspiciousActivityDetected: boolean("suspicious_activity_detected").default(false),
  suspiciousActivityCount: int("suspicious_activity_count").default(0),
  
  // IP Restrictions
  ipWhitelistEnabled: boolean("ip_whitelist_enabled").default(false),
  ipWhitelist: text("ip_whitelist"), // JSON array
  
  // Session Settings
  maxActiveSessions: int("max_active_sessions").default(5),
  sessionTimeout: int("session_timeout").default(3600), // seconds
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Active Sessions
export const activeSessions = mysqlTable("active_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Session Details
  sessionToken: varchar("session_token", { length: 500 }).notNull().unique(),
  
  // Device Info
  deviceId: varchar("device_id", { length: 255 }),
  deviceName: varchar("device_name", { length: 255 }),
  deviceType: mysqlEnum("device_type", ["desktop", "mobile", "tablet", "other"]),
  
  // Location
  ipAddress: varchar("ip_address", { length: 50 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  
  // Browser
  userAgent: text("user_agent"),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  
  // Status
  active: boolean("active").default(true),
  
  // Activity
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  
  // Expiry
  expiresAt: timestamp("expires_at"),
  
  // Security
  mfaVerified: boolean("mfa_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  terminatedAt: timestamp("terminated_at"),
});

// Login History
export const loginHistory = mysqlTable("login_history", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Login Details
  loginMethod: mysqlEnum("login_method", ["password", "oauth", "magic_link", "sso"]).notNull(),
  
  // Status
  success: boolean("success").notNull(),
  failureReason: varchar("failure_reason", { length: 255 }),
  
  // Device & Location
  ipAddress: varchar("ip_address", { length: 50 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  userAgent: text("user_agent"),
  
  // MFA
  mfaRequired: boolean("mfa_required").default(false),
  mfaCompleted: boolean("mfa_completed").default(false),
  
  // Risk Assessment
  riskScore: int("risk_score"), // 0-100
  riskFactors: text("risk_factors"), // JSON: what made this risky
  
  loginAt: timestamp("login_at").defaultNow(),
});

// Audit Logs
export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }), // Null for system events
  
  // Event Details
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventCategory: mysqlEnum("event_category", [
    "authentication",
    "authorization",
    "data_access",
    "data_modification",
    "settings_change",
    "security_event",
    "system_event",
    "compliance_event"
  ]).notNull(),
  
  // Action
  action: varchar("action", { length: 255 }).notNull(),
  resource: varchar("resource", { length: 255 }), // What was accessed/modified
  resourceId: varchar("resource_id", { length: 255 }),
  
  // Details
  details: text("details"), // JSON: additional context
  
  // Result
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  
  // Context
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id", { length: 255 }),
  
  // Severity
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).default("info"),
  
  eventTimestamp: timestamp("event_timestamp").defaultNow(),
});

// Security Incidents
export const securityIncidents = mysqlTable("security_incidents", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }), // Null for system-wide incidents
  
  // Incident Details
  incidentType: mysqlEnum("incident_type", [
    "unauthorized_access",
    "data_breach",
    "account_takeover",
    "brute_force_attack",
    "suspicious_activity",
    "malware_detected",
    "dos_attack",
    "other"
  ]).notNull(),
  
  // Severity
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  
  // Description
  description: text("description"),
  
  // Detection
  detectedBy: varchar("detected_by", { length: 100 }), // "system", "user", "admin"
  detectionMethod: varchar("detection_method", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", [
    "detected",
    "investigating",
    "contained",
    "resolved",
    "false_positive"
  ]).default("detected"),
  
  // Response
  responseActions: text("response_actions"), // JSON: actions taken
  
  // Impact
  impactAssessment: text("impact_assessment"),
  affectedUsers: int("affected_users"),
  dataCompromised: boolean("data_compromised").default(false),
  
  // Resolution
  resolvedBy: varchar("resolved_by", { length: 255 }),
  resolutionNotes: text("resolution_notes"),
  
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys
export const apiKeys = mysqlTable("api_keys", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Key Details
  keyName: varchar("key_name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 500 }).notNull(), // Hashed API key
  keyPrefix: varchar("key_prefix", { length: 20 }), // First few chars for identification
  
  // Permissions
  permissions: text("permissions"), // JSON: what this key can do
  
  // Restrictions
  ipWhitelist: text("ip_whitelist"), // JSON: allowed IPs
  rateLimit: int("rate_limit"), // requests per hour
  
  // Status
  active: boolean("active").default(true),
  
  // Usage
  lastUsedAt: timestamp("last_used_at"),
  totalRequests: int("total_requests").default(0),
  
  // Expiry
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

// API Request Logs
export const apiRequestLogs = mysqlTable("api_request_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  apiKeyId: varchar("api_key_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }),
  
  // Request Details
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, etc.
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  
  // Response
  statusCode: int("status_code").notNull(),
  responseTime: int("response_time"), // milliseconds
  
  // Context
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  
  // Error
  errorMessage: text("error_message"),
  
  requestTimestamp: timestamp("request_timestamp").defaultNow(),
});

// Rate Limiting
export const rateLimits = mysqlTable("rate_limits", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Identifier (user ID, IP, API key)
  identifier: varchar("identifier", { length: 255 }).notNull(),
  identifierType: mysqlEnum("identifier_type", ["user_id", "ip_address", "api_key"]).notNull(),
  
  // Endpoint
  endpoint: varchar("endpoint", { length: 500 }),
  
  // Limits
  requestsPerMinute: int("requests_per_minute"),
  requestsPerHour: int("requests_per_hour"),
  requestsPerDay: int("requests_per_day"),
  
  // Current Usage
  requestsThisMinute: int("requests_this_minute").default(0),
  requestsThisHour: int("requests_this_hour").default(0),
  requestsToday: int("requests_today").default(0),
  
  // Reset Times
  minuteResetAt: timestamp("minute_reset_at"),
  hourResetAt: timestamp("hour_reset_at"),
  dayResetAt: timestamp("day_reset_at"),
  
  // Throttling
  throttled: boolean("throttled").default(false),
  throttledUntil: timestamp("throttled_until"),
  
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data Access Logs (GDPR/HIPAA compliance)
export const dataAccessLogs = mysqlTable("data_access_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Who accessed
  accessedBy: varchar("accessed_by", { length: 255 }).notNull(),
  accessedByType: mysqlEnum("accessed_by_type", ["user", "admin", "system", "api"]).notNull(),
  
  // What was accessed
  dataType: varchar("data_type", { length: 100 }).notNull(),
  dataId: varchar("data_id", { length: 255 }),
  dataOwnerId: varchar("data_owner_id", { length: 255 }), // Whose data was accessed
  
  // How
  accessMethod: varchar("access_method", { length: 100 }),
  
  // Why
  purpose: varchar("purpose", { length: 255 }),
  
  // Context
  ipAddress: varchar("ip_address", { length: 50 }),
  
  accessedAt: timestamp("accessed_at").defaultNow(),
});

// Encryption Keys (metadata only, not actual keys)
export const encryptionKeys = mysqlTable("encryption_keys", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Key Details
  keyId: varchar("key_id", { length: 255 }).notNull().unique(),
  keyType: mysqlEnum("key_type", ["master", "data", "session"]).notNull(),
  algorithm: varchar("algorithm", { length: 100 }).notNull(),
  
  // Status
  active: boolean("active").default(true),
  
  // Rotation
  rotationSchedule: mysqlEnum("rotation_schedule", ["never", "monthly", "quarterly", "yearly"]),
  lastRotatedAt: timestamp("last_rotated_at"),
  nextRotationAt: timestamp("next_rotation_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  retiredAt: timestamp("retired_at"),
});

// Compliance Reports
export const complianceReports = mysqlTable("compliance_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Report Details
  reportType: mysqlEnum("report_type", ["gdpr", "hipaa", "soc2", "iso27001", "custom"]).notNull(),
  reportPeriodStart: timestamp("report_period_start").notNull(),
  reportPeriodEnd: timestamp("report_period_end").notNull(),
  
  // Status
  status: mysqlEnum("status", ["generating", "completed", "failed"]).default("generating"),
  
  // Findings
  findings: text("findings"), // JSON: compliance findings
  
  // File
  filePath: varchar("file_path", { length: 500 }),
  
  generatedBy: varchar("generated_by", { length: 255 }),
  generatedAt: timestamp("generated_at").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Security Alerts
export const securityAlerts = mysqlTable("security_alerts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }),
  
  // Alert Details
  alertType: mysqlEnum("alert_type", [
    "new_login",
    "new_device",
    "password_changed",
    "mfa_disabled",
    "suspicious_activity",
    "data_export",
    "settings_changed"
  ]).notNull(),
  
  // Severity
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info"),
  
  // Message
  message: text("message"),
  
  // Action Required
  actionRequired: boolean("action_required").default(false),
  actionUrl: varchar("action_url", { length: 500 }),
  
  // Status
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Trusted Devices
export const trustedDevices = mysqlTable("trusted_devices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Device Details
  deviceId: varchar("device_id", { length: 255 }).notNull(),
  deviceName: varchar("device_name", { length: 255 }),
  deviceType: mysqlEnum("device_type", ["desktop", "mobile", "tablet"]),
  
  // Fingerprint
  deviceFingerprint: varchar("device_fingerprint", { length: 500 }),
  
  // Status
  trusted: boolean("trusted").default(true),
  
  // Last Seen
  lastSeenAt: timestamp("last_seen_at"),
  lastSeenIp: varchar("last_seen_ip", { length: 50 }),
  
  trustedAt: timestamp("trusted_at").defaultNow(),
  untrustedAt: timestamp("untrusted_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});
