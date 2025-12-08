-- Fix JSONB column defaults in anonymous_sessions table
-- These were causing insert failures because Drizzle was trying to use JavaScript values as SQL defaults

ALTER TABLE anonymous_sessions 
  ALTER COLUMN conversation_data SET DEFAULT '[]'::jsonb,
  ALTER COLUMN conversation_data SET NOT NULL;

ALTER TABLE anonymous_sessions 
  ALTER COLUMN extracted_data SET DEFAULT '{}'::jsonb,
  ALTER COLUMN extracted_data SET NOT NULL;

ALTER TABLE anonymous_sessions 
  ALTER COLUMN media_files SET DEFAULT '[]'::jsonb,
  ALTER COLUMN media_files SET NOT NULL;

-- Verify the changes
SELECT column_name, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'anonymous_sessions' 
  AND column_name IN ('conversation_data', 'extracted_data', 'media_files');
