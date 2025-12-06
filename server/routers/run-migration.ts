import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

    // Dynamic import of pg (already installed as dependency)
    const { Client } = await import('pg');
    
    // Connect to PostgreSQL
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('Loaded migration SQL file');

    // Execute the migration
    await client.query(migrationSQL);
    console.log('Migration executed successfully');

    // Close the connection
    await client.end();

    res.json({ 
      success: true, 
      message: 'Database migration completed successfully! All tables created.' 
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
