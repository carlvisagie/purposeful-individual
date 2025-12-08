#!/usr/bin/env python3
"""
Apply JSONB defaults fix to Render PostgreSQL database
Uses psycopg2 which handles SSL better than pg client
"""

import os
import psycopg2
from urllib.parse import urlparse

# Parse DATABASE_URL
database_url = "postgresql://purposefullive_db_user:l7FOZpyCwsHIKhiTwUhaFUDRSUd4N457@dpg-d3u2ks2j1k6c73a3b1lg-a.oregon-postgres.render.com/purposefullive_db"

result = urlparse(database_url)
username = result.username
password = result.password
database = result.path[1:]
hostname = result.hostname
port = result.port or 5432

print("🔧 Connecting to PostgreSQL database...")
print(f"   Host: {hostname}")
print(f"   Database: {database}")
print()

try:
    # Connect with SSL
    conn = psycopg2.connect(
        database=database,
        user=username,
        password=password,
        host=hostname,
        port=port,
        sslmode='require'
    )
    
    cur = conn.cursor()
    
    print("✅ Connected successfully!")
    print()
    print("🔧 Applying JSONB defaults fix...")
    print()
    
    # Apply the fixes
    migrations = [
        "ALTER TABLE anonymous_sessions ALTER COLUMN conversation_data SET DEFAULT '[]'::jsonb",
        "ALTER TABLE anonymous_sessions ALTER COLUMN conversation_data SET NOT NULL",
        "ALTER TABLE anonymous_sessions ALTER COLUMN extracted_data SET DEFAULT '{}'::jsonb",
        "ALTER TABLE anonymous_sessions ALTER COLUMN extracted_data SET NOT NULL",
        "ALTER TABLE anonymous_sessions ALTER COLUMN media_files SET DEFAULT '[]'::jsonb",
        "ALTER TABLE anonymous_sessions ALTER COLUMN media_files SET NOT NULL",
    ]
    
    for migration in migrations:
        print(f"   Running: {migration[:80]}...")
        cur.execute(migration)
    
    conn.commit()
    
    print()
    print("✅ Migration completed successfully!")
    print()
    
    # Verify the changes
    print("🔍 Verifying column defaults...")
    cur.execute("""
        SELECT column_name, column_default, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'anonymous_sessions' 
          AND column_name IN ('conversation_data', 'extracted_data', 'media_files')
        ORDER BY column_name
    """)
    
    results = cur.fetchall()
    print()
    for row in results:
        print(f"   {row[0]}: default={row[1]}, nullable={row[2]}")
    
    print()
    print("✅ All done!")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
