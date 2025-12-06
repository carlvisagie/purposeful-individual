import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";

/**
 * Migration script to create all autism module tables
 * Run this to set up the autism transformation module in production
 */

async function migrateAutismTables() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔄 Connecting to database...");
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: "default" });

  try {
    console.log("🔄 Creating autism module tables...");

    // Create autismProfiles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS autismProfiles (
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
      )
    `);
    console.log("✅ autismProfiles table created");

    // Create interventionPlans table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS interventionPlans (
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
      )
    `);
    console.log("✅ interventionPlans table created");

    // Create supplementTracking table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS supplementTracking (
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
      )
    `);
    console.log("✅ supplementTracking table created");

    // Create dietaryInterventions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dietaryInterventions (
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
      )
    `);
    console.log("✅ dietaryInterventions table created");

    // Create therapySessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS therapySessions (
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
      )
    `);
    console.log("✅ therapySessions table created");

    // Create autismOutcomeTracking table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS autismOutcomeTracking (
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
      )
    `);
    console.log("✅ autismOutcomeTracking table created");

    // Create autismPatternDetection table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS autismPatternDetection (
        id INT AUTO_INCREMENT PRIMARY KEY,
        childProfile TEXT NOT NULL,
        interventionCombination TEXT NOT NULL,
        outcomeData TEXT NOT NULL,
        patternType ENUM('high_responder', 'moderate_responder', 'non_responder'),
        confidence INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✅ autismPatternDetection table created");

    // Create autismProviders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS autismProviders (
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
      )
    `);
    console.log("✅ autismProviders table created");

    console.log("\n🎉 All autism module tables created successfully!");
    console.log("\n📊 Tables created:");
    console.log("  - autismProfiles");
    console.log("  - interventionPlans");
    console.log("  - supplementTracking");
    console.log("  - dietaryInterventions");
    console.log("  - therapySessions");
    console.log("  - autismOutcomeTracking");
    console.log("  - autismPatternDetection");
    console.log("  - autismProviders");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run migration
migrateAutismTables();
