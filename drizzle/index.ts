/**
 * PURPOSEFUL LIVE COACHING - UNIFIED SCHEMA INDEX
 * 
 * This file exports all database schemas from all modules for use throughout the application.
 * 
 * MODULECATEGORIES:
 * 1. LIFE CHALLENGE MODULES (6)
 *    - Mental Health & Recovery
 *    - Relationships
 *    - Career & Purpose
 *    - Young Men Without Role Models
 *    - Financial Challenges
 *    - Autism Tracking
 * 
 * 2. WELLNESS ENGINES (6)
 *    - Spiritual Wellness
 *    - Mental Wellness
 *    - Emotional Wellness
 *    - Physical/Exercise
 *    - Nutrition
 *    - Health Optimization
 * 
 * 3. TRANSFORMATION SYSTEMS (3)
 *    - Transformative Principles (12 identity-based principles)
 *    - Memory Mastery (13 techniques)
 *    - Habit Formation (integrated language patterns)
 * 
 * 4. HIGH-VALUE FEATURES (10)
 *    - Sleep Optimization
 *    - Community & Support Network
 *    - Gamification & Motivation
 *    - Progress Analytics & Insights
 *    - Stress Tracking & Management
 *    - Goal Setting & Achievement
 *    - Journal & Reflection
 *    - Progress Visualization
 *    - AI Coaching Assistant
 *    - Integration APIs
 * 
 * 5. CORE INFRASTRUCTURE (6)
 *    - Notification & Reminder System
 *    - User Settings & Preferences
 *    - Security & Audit
 *    - Admin & Support
 *    - Adaptive Learning Engine
 *    - Identity & Authentication
 * 
 * TOTAL: 31+ interconnected modules with 300+ database tables
 */

// ============================================================================
// LIFE CHALLENGE MODULES
// ============================================================================

// Mental Health & Recovery
export * from './mentalHealthSchema';

// Relationships
export * from './relationshipSchema';

// Career & Purpose
export * from './careerSchema';

// Young Men Without Role Models
export * from './youngMenSchema';

// Financial Challenges
export * from './financialSchema';

// Autism Tracking
export * from './autismSchema';

// ============================================================================
// WELLNESS ENGINES
// ============================================================================

// Spiritual Wellness
export * from './spiritualEngineSchema';

// Mental Wellness
export * from './mentalEngineSchema';

// Emotional Wellness
export * from './emotionalEngineSchema';

// Physical/Exercise
export * from './physicalEngineSchema';

// Nutrition
export * from './nutritionEngineSchema';

// Health Optimization
export * from './healthOptimizationSchema';

// ============================================================================
// TRANSFORMATION SYSTEMS
// ============================================================================

// Transformative Principles (12 identity-based principles)
export * from './transformativePrinciplesSchema';

// Memory Mastery (13 techniques)
export * from './memoryMasterySchema';

// Habit Formation (integrated language patterns)
export * from './habitFormationSchema';

// ============================================================================
// HIGH-VALUE FEATURES
// ============================================================================

// Sleep Optimization
export * from './sleepOptimizationSchema';

// Community & Support Network
export * from './communitySchema';

// Gamification & Motivation
export * from './gamificationSchema';

// Progress Analytics & Insights
export * from './analyticsSchema';

// Stress Tracking & Management
export * from './stressSchema';

// Goal Setting & Achievement
export * from './goalsSchema';

// Journal & Reflection
export * from './journalSchema';

// Progress Visualization
export * from './visualizationSchema';

// AI Coaching Assistant
export * from './aiCoachSchema';

// Integration APIs
export * from './integrationsSchema';

// ============================================================================
// CORE INFRASTRUCTURE
// ============================================================================

// Notification & Reminder System
export * from './notificationsSchema';

// User Settings & Preferences
export * from './settingsSchema';

// Security & Audit
export * from './securitySchema';

// Admin & Support
export * from './adminSchema';

// Adaptive Learning Engine
export * from './adaptiveLearningSchema';

// Identity & Authentication
export * from './identitySchema';

// ============================================================================
// LEGACY SCHEMAS (for backward compatibility)
// ============================================================================

// Original schema files (may be deprecated)
export * from './schema';
// export * from './schema-postgresql'; // Disabled - using MySQL only
export * from './relations';
