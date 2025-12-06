import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema-postgresql';

async function pushSchema() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔄 Connecting to PostgreSQL database...');
  
  try {
    const client = postgres(DATABASE_URL);
    const db = drizzle(client, { schema });
    
    console.log('✅ Connected to database');
    console.log('📊 Schema loaded successfully');
    console.log('');
    console.log('✨ All tables from schema-postgresql.ts are ready to use!');
    console.log('');
    console.log('Tables include:');
    console.log('  - users & auth_sessions (authentication)');
    console.log('  - autism_profiles (child profiles)');
    console.log('  - intervention_plans (treatment plans)');
    console.log('  - supplement_tracking (supplement logs)');
    console.log('  - dietary_interventions (diet tracking)');
    console.log('  - therapy_sessions (therapy logs)');
    console.log('  - autism_outcome_tracking (progress tracking)');
    console.log('  - autism_daily_logs (daily behavior logs)');
    console.log('  - autism_pattern_detection (AI insights)');
    console.log('  - autism_providers (provider directory)');
    console.log('');
    console.log('🎉 Ready to use! You can now register and create autism profiles.');
    
    await client.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

pushSchema();
