/**
 * Setup PostgreSQL Database
 * Generates and runs migrations for PostgreSQL schema
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../drizzle/schema-postgresql";

async function setupDatabase() {
  console.log("🔧 Setting up PostgreSQL database...");
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log("📦 Running migrations...");
    
    // Run migrations (this will create tables from schema-postgresql.ts)
    await migrate(db, { migrationsFolder: "./drizzle/migrations-postgresql" });
    
    console.log("✅ Database setup complete!");
    
    // Test the connection
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connection test successful:", result.rows[0]);
    
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
