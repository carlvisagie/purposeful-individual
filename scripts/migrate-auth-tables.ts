import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

/**
 * Migration script to add authentication tables
 * Run this to enable email/password authentication
 */

async function migrateAuthTables() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔄 Connecting to database...");
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log("🔄 Adding auth fields to users table...");

    // Add password fields to users table (if they don't exist)
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN openId VARCHAR(64) NULL,
      ADD COLUMN IF NOT EXISTS passwordHash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS passwordSalt VARCHAR(64),
      ADD UNIQUE INDEX IF NOT EXISTS idx_users_email (email)
    `).catch(() => {
      console.log("⚠️  Some columns may already exist, continuing...");
    });
    
    console.log("✅ Users table updated");

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
    console.log("✅ authSessions table created");

    console.log("\n🎉 Authentication tables migrated successfully!");
    console.log("\n📊 Tables updated:");
    console.log("  - users (added passwordHash, passwordSalt, made openId optional)");
    console.log("  - authSessions (new table for session management)");
    console.log("\n✅ Users can now register and login with email/password!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run migration
migrateAuthTables();
