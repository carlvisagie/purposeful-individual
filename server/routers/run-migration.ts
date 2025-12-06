import { Router } from 'express';
import fs from 'fs';
import path from 'path';

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

    // Dynamic import of postgres to avoid build-time resolution issues
    const { default: postgres } = await import('postgres');
    
    // Connect to PostgreSQL
    const sql = postgres(process.env.DATABASE_URL);
    console.log('Connected to PostgreSQL database');

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('Loaded migration SQL file');

    // Execute the migration
    await sql.unsafe(migrationSQL);
    console.log('Migration executed successfully');

    // Close the connection
    await sql.end();

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
