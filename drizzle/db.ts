/**
 * DATABASE CONNECTION & MIGRATION UTILITIES
 * 
 * This file provides:
 * - Database connection setup
 * - Migration runner
 * - Schema validation
 * - Connection pooling
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './index';

// Database connection string
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create connection pool
export const pool = mysql.createPool({
  uri: connectionString,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Create Drizzle instance
export const db = drizzle(pool, { schema, mode: 'default' });

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Run migrations
export async function runMigrations(): Promise<void> {
  try {
    console.log('🔄 Running database migrations...');
    
    // Import migrate function
    const { migrate } = await import('drizzle-orm/mysql2/migrator');
    
    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Close database connection
export async function closeConnection(): Promise<void> {
  try {
    await pool.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
}

// Get database statistics
export async function getDatabaseStats(): Promise<{
  totalTables: number;
  totalConnections: number;
  databaseSize: string;
}> {
  try {
    const connection = await pool.getConnection();
    
    // Get total tables
    const [tables] = await connection.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()'
    );
    
    // Get total connections
    const [connections] = await connection.query(
      'SHOW STATUS LIKE "Threads_connected"'
    );
    
    // Get database size
    const [size] = await connection.query(
      'SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size FROM information_schema.tables WHERE table_schema = DATABASE()'
    );
    
    connection.release();
    
    return {
      totalTables: (tables as any)[0].count,
      totalConnections: parseInt((connections as any)[0].Value),
      databaseSize: `${(size as any)[0].size} MB`,
    };
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    throw error;
  }
}

// Export schema for use in application
export { schema };
