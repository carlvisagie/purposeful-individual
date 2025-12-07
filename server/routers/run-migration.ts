import { Router } from 'express';
import { Client } from 'pg';

const router = Router();

router.get('/run-migration', async (req, res) => {
  try {
    console.log('Starting migration via web endpoint...');
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        success: false, 
        error: 'DATABASE_URL environment variable is not set' 
      });
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    await client.connect();
    console.log('Connected to PostgreSQL database');

    const migrations = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(320) UNIQUE NOT NULL,
        name VARCHAR(255),
        "openId" VARCHAR(64),
        "passwordHash" VARCHAR(255),
        "passwordSalt" VARCHAR(64),
        "loginMethod" VARCHAR(50) DEFAULT 'oauth',
        "lastSignedIn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "authSessions" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        goals TEXT,
        preferences TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS "autismProfiles" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "childName" VARCHAR(255) NOT NULL,
        "dateOfBirth" TIMESTAMP NOT NULL,
        "diagnosisDate" TIMESTAMP,
        severity VARCHAR(20) NOT NULL,
        "atecScore" INTEGER,
        "carsScore" INTEGER,
        "communicationLevel" VARCHAR(50) NOT NULL,
        "giSymptoms" TEXT,
        "sleepIssues" TEXT,
        "sensoryProfile" TEXT,
        "behaviorChallenges" TEXT,
        "familyResources" TEXT,
        "treatmentPriorities" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "interventionPlans" (
        id SERIAL PRIMARY KEY,
        "profileId" INTEGER NOT NULL REFERENCES "autismProfiles"(id) ON DELETE CASCADE,
        "tier1Interventions" TEXT NOT NULL,
        "tier2Interventions" TEXT,
        "tier3Interventions" TEXT,
        "tier4Interventions" TEXT,
        "currentPhase" VARCHAR(50) NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "providerDirectory" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "supplementTracking" (
        id SERIAL PRIMARY KEY,
        "profileId" INTEGER NOT NULL REFERENCES "autismProfiles"(id) ON DELETE CASCADE,
        "supplementName" VARCHAR(255) NOT NULL,
        dosage VARCHAR(255) NOT NULL,
        frequency VARCHAR(50) NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP,
        adherence INTEGER,
        "sideEffects" TEXT,
        "perceivedBenefit" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "dietaryInterventions" (
        id SERIAL PRIMARY KEY,
        "profileId" INTEGER NOT NULL REFERENCES "autismProfiles"(id) ON DELETE CASCADE,
        "dietType" VARCHAR(50) NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP,
        adherence INTEGER,
        "giSymptomChanges" TEXT,
        "behaviorChanges" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "therapySessions" (
        id SERIAL PRIMARY KEY,
        "profileId" INTEGER NOT NULL REFERENCES "autismProfiles"(id) ON DELETE CASCADE,
        "therapyType" VARCHAR(50) NOT NULL,
        "sessionDate" TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL,
        "goalsAddressed" TEXT,
        progress TEXT,
        "parentFeedback" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "autismOutcomeTracking" (
        id SERIAL PRIMARY KEY,
        "profileId" INTEGER NOT NULL REFERENCES "autismProfiles"(id) ON DELETE CASCADE,
        "assessmentDate" TIMESTAMP NOT NULL,
        "atecScore" INTEGER,
        "carsScore" INTEGER,
        "communicationLevel" VARCHAR(50),
        "behaviorScore" INTEGER,
        "adaptiveFunctionScore" INTEGER,
        "giSymptomScore" INTEGER,
        "sleepScore" INTEGER,
        "familyQOL" INTEGER,
        "parentStress" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "autismDailyLogs" (
        id SERIAL PRIMARY KEY,
        "profileId" INTEGER NOT NULL REFERENCES "autismProfiles"(id) ON DELETE CASCADE,
        "logDate" DATE NOT NULL,
        "sleepQuality" INTEGER,
        "sleepHours" DECIMAL(4,2),
        "moodRating" INTEGER,
        "behaviorIncidents" INTEGER,
        "giSymptoms" TEXT,
        "dietAdherence" INTEGER,
        "supplementsGiven" TEXT,
        "therapySessions" TEXT,
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("profileId", "logDate")
      )`,
    ];

    let tablesCreated = 0;
    for (const migration of migrations) {
      try {
        await client.query(migration);
        tablesCreated++;
      } catch (error: any) {
        console.log(`Table might already exist: ${error.message}`);
      }
    }

    console.log(`Migration completed. ${tablesCreated} tables processed.`);
    await client.end();

    res.json({ 
      success: true, 
      message: `Database migration completed! ${tablesCreated} tables processed.`,
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
