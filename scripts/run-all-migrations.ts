#!/usr/bin/env tsx

/**
 * COMPREHENSIVE DATABASE MIGRATION SCRIPT
 * 
 * This script:
 * 1. Tests database connection
 * 2. Creates all tables from all 31+ modules
 * 3. Validates schema integrity
 * 4. Reports migration status
 * 
 * Usage: tsx scripts/run-all-migrations.ts
 */

import { testConnection, runMigrations, getDatabaseStats, closeConnection } from '../drizzle/db';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 PURPOSEFUL LIVE COACHING - DATABASE MIGRATION');
  console.log('================================================\n');
  
  try {
    // Step 1: Test connection
    console.log('Step 1: Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('Failed to connect to database');
    }
    
    console.log('');
    
    // Step 2: Run migrations
    console.log('Step 2: Running migrations for all modules...');
    console.log('This will create tables for:');
    console.log('  - 6 Life Challenge Modules');
    console.log('  - 6 Wellness Engines');
    console.log('  - 3 Transformation Systems');
    console.log('  - 10 High-Value Features');
    console.log('  - 6 Core Infrastructure Components');
    console.log('');
    
    await runMigrations();
    
    console.log('');
    
    // Step 3: Get database statistics
    console.log('Step 3: Gathering database statistics...');
    const stats = await getDatabaseStats();
    
    console.log('');
    console.log('📊 DATABASE STATISTICS');
    console.log('=====================');
    console.log(`Total Tables: ${stats.totalTables}`);
    console.log(`Active Connections: ${stats.totalConnections}`);
    console.log(`Database Size: ${stats.databaseSize}`);
    console.log('');
    
    // Step 4: Success message
    console.log('✅ MIGRATION COMPLETE!');
    console.log('======================');
    console.log('');
    console.log('Your Purposeful Live Coaching platform is ready!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Access the platform at: http://localhost:5000');
    console.log('3. Begin tracking your transformation journey!');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ MIGRATION FAILED');
    console.error('==================');
    console.error('Error:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Verify DATABASE_URL environment variable is set');
    console.error('2. Ensure database server is running');
    console.error('3. Check database credentials');
    console.error('4. Review error message above for specific issues');
    console.error('');
    process.exit(1);
  } finally {
    // Close connection
    await closeConnection();
  }
}

// Run migration
main();
