import { Router } from 'express';
import mysql from 'mysql2/promise';

const router = Router();

router.get('/run-migration', async (req, res) => {
  try {
    console.log('Starting migration via web endpoint...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        success: false, 
        error: 'DATABASE_URL environment variable is not set' 
      });
    }

    // Connect to MySQL
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Connected to MySQL database');

    // Run migrations for all core tables
    const migrations = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(320) UNIQUE NOT NULL,
        name VARCHAR(255),
        openId VARCHAR(64),
        passwordHash VARCHAR(255),
        passwordSalt VARCHAR(64),
        loginMethod VARCHAR(50) DEFAULT 'oauth',
        lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email)
      )`,

      // Auth sessions table
      `CREATE TABLE IF NOT EXISTS authSessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expiresAt TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_authSessions_token (token),
        INDEX idx_authSessions_userId (userId)
      )`,

      // Clients table
      `CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL UNIQUE,
        goals TEXT,
        preferences TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Autism profiles table
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

      // Intervention plans table
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

      // Supplement tracking table
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

      // Dietary interventions table
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

      // Therapy sessions table
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

      // Autism outcome tracking table
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

      // Daily logs table
      `CREATE TABLE IF NOT EXISTS autismDailyLogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        profileId INT NOT NULL,
        logDate DATE NOT NULL,
        sleepQuality INT,
        sleepHours DECIMAL(4,2),
        moodRating INT,
        behaviorIncidents INT,
        giSymptoms TEXT,
        dietAdherence INT,
        supplementsGiven TEXT,
        therapySessions TEXT,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (profileId) REFERENCES autismProfiles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_profile_date (profileId, logDate)
      )`,
    ];

    let tablesCreated = 0;
    for (const migration of migrations) {
      try {
        await connection.execute(migration);
        tablesCreated++;
      } catch (error: any) {
        console.log(`Table might already exist: ${error.message}`);
      }
    }

    console.log(`Migration completed. ${tablesCreated} tables processed.`);

    // Close the connection
    await connection.end();

    res.json({ 
      success: true, 
      message: `Database migration completed successfully! ${tablesCreated} tables processed.`,
      tablesCreated
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    });
  }
});

export default router;
