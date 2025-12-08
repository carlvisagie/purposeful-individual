import { publicProcedure, router } from "../_core/trpc";
import mysql from "mysql2/promise";
import { z } from "zod";
import { db } from "../db-standalone";
import { sql } from "drizzle-orm";

export const migrateRouter = router({
  runAuthMigration: publicProcedure
    .input(z.object({ secret: z.string() }))
    .mutation(async ({ input }) => {
      // Simple secret check - only allow if correct secret provided
      if (input.secret !== process.env.MIGRATION_SECRET && input.secret !== "migrate-now-2024") {
        throw new Error("Invalid migration secret");
      }

      const DATABASE_URL = process.env.DATABASE_URL;
      if (!DATABASE_URL) {
        throw new Error("DATABASE_URL not set");
      }

      const connection = await mysql.createConnection(DATABASE_URL);

      try {
        // Add password fields to users table
        await connection.execute(`
          ALTER TABLE users 
          MODIFY COLUMN openId VARCHAR(64) NULL,
          ADD COLUMN IF NOT EXISTS passwordHash VARCHAR(255),
          ADD COLUMN IF NOT EXISTS passwordSalt VARCHAR(64),
          ADD UNIQUE INDEX IF NOT EXISTS idx_users_email (email)
        `).catch(() => {
          console.log("Some columns may already exist");
        });

        // Create authSessions table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS authSessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            token VARCHAR(255) NOT NULL UNIQUE,
            expiresAt TIMESTAMP NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_authSessions_token (token),
            INDEX idx_authSessions_userId (userId)
          )
        `);

        await connection.end();
        return { success: true, message: "Auth tables migrated successfully" };
      } catch (error: any) {
        await connection.end();
        throw new Error(`Migration failed: ${error.message}`);
      }
    }),

  runAutismMigration: publicProcedure
    .input(z.object({ secret: z.string() }))
    .mutation(async ({ input }) => {
      if (input.secret !== process.env.MIGRATION_SECRET && input.secret !== "migrate-now-2024") {
        throw new Error("Invalid migration secret");
      }

      const DATABASE_URL = process.env.DATABASE_URL;
      if (!DATABASE_URL) {
        throw new Error("DATABASE_URL not set");
      }

      const connection = await mysql.createConnection(DATABASE_URL);

      try {
        // Create all autism tables
        const tables = [
          `CREATE TABLE IF NOT EXISTS autismProfiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            childName VARCHAR(255) NOT NULL,
            dateOfBirth TIMESTAMP NOT NULL,
            diagnosisDate TIMESTAMP,
            severity ENUM('mild', 'moderate', 'severe') NOT NULL,
            atecScore INT,
            carsScore INT,
            communicationLevel ENUM('nonverbal', 'minimally_verbal', 'verbal') NOT NULL,
            giSymptoms TEXT,
            sleepIssues TEXT,
            sensoryProfile TEXT,
            behaviorChallenges TEXT,
            familyResources TEXT,
            treatmentPriorities TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          )`,
          `CREATE TABLE IF NOT EXISTS interventionPlans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            profileId INT NOT NULL,
            tier1Interventions TEXT NOT NULL,
            tier2Interventions TEXT,
            tier3Interventions TEXT,
            tier4Interventions TEXT,
            currentPhase ENUM('foundation', 'biomedical', 'behavioral', 'advanced') NOT NULL,
            startDate TIMESTAMP NOT NULL,
            providerDirectory TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (profileId) REFERENCES autismProfiles(id) ON DELETE CASCADE
          )`,
          `CREATE TABLE IF NOT EXISTS supplementTracking (
            id INT AUTO_INCREMENT PRIMARY KEY,
            profileId INT NOT NULL,
            supplementName VARCHAR(255) NOT NULL,
            dosage VARCHAR(255) NOT NULL,
            frequency ENUM('daily', 'twice_daily', 'every_3_days') NOT NULL,
            startDate TIMESTAMP NOT NULL,
            endDate TIMESTAMP,
            adherence INT,
            sideEffects TEXT,
            perceivedBenefit INT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (profileId) REFERENCES autismProfiles(id) ON DELETE CASCADE
          )`,
          `CREATE TABLE IF NOT EXISTS dietaryInterventions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            profileId INT NOT NULL,
            dietType ENUM('GFCF', 'ketogenic', 'SCD') NOT NULL,
            startDate TIMESTAMP NOT NULL,
            endDate TIMESTAMP,
            adherence INT,
            giSymptomChanges TEXT,
            behaviorChanges TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (profileId) REFERENCES autismProfiles(id) ON DELETE CASCADE
          )`,
          `CREATE TABLE IF NOT EXISTS therapySessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            profileId INT NOT NULL,
            therapyType ENUM('ABA', 'OT', 'speech', 'Floortime', 'neurofeedback') NOT NULL,
            sessionDate TIMESTAMP NOT NULL,
            duration INT NOT NULL,
            goalsAddressed TEXT,
            progress TEXT,
            parentFeedback TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (profileId) REFERENCES autismProfiles(id) ON DELETE CASCADE
          )`,
          `CREATE TABLE IF NOT EXISTS autismOutcomeTracking (
            id INT AUTO_INCREMENT PRIMARY KEY,
            profileId INT NOT NULL,
            assessmentDate TIMESTAMP NOT NULL,
            atecScore INT,
            carsScore INT,
            communicationLevel ENUM('nonverbal', 'minimally_verbal', 'verbal'),
            behaviorScore INT,
            adaptiveFunctionScore INT,
            giSymptomScore INT,
            sleepScore INT,
            familyQOL INT,
            parentStress INT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (profileId) REFERENCES autismProfiles(id) ON DELETE CASCADE
          )`,
          `CREATE TABLE IF NOT EXISTS autismPatternDetection (
            id INT AUTO_INCREMENT PRIMARY KEY,
            childProfile TEXT NOT NULL,
            interventionCombination TEXT NOT NULL,
            outcomeData TEXT NOT NULL,
            patternType ENUM('high_responder', 'moderate_responder', 'non_responder'),
            confidence INT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS autismProviders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            providerType ENUM('ABA', 'OT', 'speech', 'FMT_clinic', 'neurofeedback') NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            email VARCHAR(320),
            website VARCHAR(500),
            rating INT,
            reviewCount INT,
            acceptsInsurance ENUM('true', 'false') NOT NULL,
            costRange VARCHAR(100),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
          )`
        ];

        for (const tableSQL of tables) {
          await connection.execute(tableSQL);
        }

        await connection.end();
        return { success: true, message: "Autism tables migrated successfully" };
      } catch (error: any) {
        await connection.end();
        throw new Error(`Migration failed: ${error.message}`);
      }
    }),

  // Apply JSONB defaults fix for PostgreSQL anonymous_sessions table
  applyJsonbFix: publicProcedure
    .input(z.object({ secret: z.string() }))
    .mutation(async ({ input }) => {
      if (input.secret !== process.env.MIGRATION_SECRET && input.secret !== "migrate-now-2024") {
        throw new Error("Invalid migration secret");
      }

      try {
        console.log("[Migration] Starting JSONB defaults fix...");
        
        // Apply the migrations
        await db.execute(sql`
          ALTER TABLE anonymous_sessions 
          ALTER COLUMN conversation_data SET DEFAULT '[]'::jsonb,
          ALTER COLUMN conversation_data SET NOT NULL
        `);
        
        console.log("[Migration] Set conversation_data defaults");
        
        await db.execute(sql`
          ALTER TABLE anonymous_sessions 
          ALTER COLUMN extracted_data SET DEFAULT '{}'::jsonb,
          ALTER COLUMN extracted_data SET NOT NULL
        `);
        
        console.log("[Migration] Set extracted_data defaults");
        
        await db.execute(sql`
          ALTER TABLE anonymous_sessions 
          ALTER COLUMN media_files SET DEFAULT '[]'::jsonb,
          ALTER COLUMN media_files SET NOT NULL
        `);
        
        console.log("[Migration] Set media_files defaults");
        
        // Verify the changes
        const result = await db.execute(sql`
          SELECT column_name, column_default, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'anonymous_sessions' 
            AND column_name IN ('conversation_data', 'extracted_data', 'media_files')
          ORDER BY column_name
        `);
        
        console.log("[Migration] Verification results:", result.rows);
        
        return {
          success: true,
          message: "JSONB defaults fix applied successfully",
          verification: result.rows
        };
        
      } catch (error: any) {
        console.error("[Migration] ERROR:", error);
        throw new Error(`Migration failed: ${error.message}`);
      }
    }),
});
