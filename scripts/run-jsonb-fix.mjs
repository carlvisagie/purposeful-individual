/**
 * Run JSONB defaults fix migration on Render PostgreSQL database
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read migration SQL
const migrationSQL = readFileSync(join(__dirname, 'fix-jsonb-defaults.sql'), 'utf-8');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Running JSONB defaults fix migration...');
    console.log('');
    
    // Run the migration
    const result = await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Column defaults updated:');
    console.log(result[result.length - 1].rows);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('');
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
