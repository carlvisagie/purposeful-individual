const { readFileSync } = require('fs');
const { join } = require('path');

async function runMigration() {
  console.log('🔄 Starting database migration...');
  
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  try {
    // Dynamic import for postgres
    const postgres = await import('postgres');
    const sql = postgres.default(DATABASE_URL);
    
    console.log('✅ Connected to PostgreSQL database');
    
    // Read SQL file
    const sqlFile = readFileSync(join(__dirname, '../migrations/001_initial_schema.sql'), 'utf8');
    console.log('📄 Loaded migration SQL file');
    
    // Execute SQL
    await sql.unsafe(sqlFile);
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📊 Created tables:');
    console.log('  ✓ users & auth_sessions');
    console.log('  ✓ autism_profiles');
    console.log('  ✓ intervention_plans');
    console.log('  ✓ supplement_tracking');
    console.log('  ✓ dietary_interventions');
    console.log('  ✓ therapy_sessions');
    console.log('  ✓ autism_outcome_tracking');
    console.log('  ✓ autism_daily_logs');
    console.log('  ✓ autism_pattern_detection');
    console.log('  ✓ autism_providers');
    console.log('');
    console.log('🎉 Your autism tracking platform is ready!');
    console.log('👉 Visit https://purposeful-individual.onrender.com/ to register');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
