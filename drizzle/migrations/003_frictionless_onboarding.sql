-- Migration: Frictionless Onboarding System
-- Created: 2025-12-07
-- Purpose: Add anonymous sessions, magic links, and client folder management

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update subscription tier enum to include new tiers
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'free';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'starter';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'professional';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'enterprise';

-- Anonymous Sessions Table
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token VARCHAR(256) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  converted_to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  converted_at TIMESTAMP,
  
  -- Session metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  
  -- Conversation data
  conversation_data JSONB DEFAULT '[]'::jsonb,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  
  -- Media files
  media_files JSONB DEFAULT '[]'::jsonb,
  
  -- Engagement metrics
  engagement_score INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  session_duration_seconds INTEGER NOT NULL DEFAULT 0,
  value_delivered BOOLEAN NOT NULL DEFAULT false,
  
  -- Conversion tracking
  conversion_prompt_shown BOOLEAN NOT NULL DEFAULT false,
  conversion_prompt_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_anonymous_sessions_token ON anonymous_sessions(session_token);
CREATE INDEX idx_anonymous_sessions_expires ON anonymous_sessions(expires_at);
CREATE INDEX idx_anonymous_sessions_converted ON anonymous_sessions(converted_to_user_id);

-- Magic Links Table (for passwordless login)
CREATE TABLE IF NOT EXISTS magic_links (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  token VARCHAR(256) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_magic_links_token ON magic_links(token);
CREATE INDEX idx_magic_links_email ON magic_links(email);
CREATE INDEX idx_magic_links_expires ON magic_links(expires_at);

-- Add subscription fields to users table if not exists
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50);

-- Client Folders Table (One Client, One Folder)
CREATE TABLE IF NOT EXISTS client_folders (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  anonymous_session_id UUID REFERENCES anonymous_sessions(id),
  folder_path VARCHAR(512) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_folders_client ON client_folders(client_id);
CREATE INDEX idx_client_folders_session ON client_folders(anonymous_session_id);

-- Client Files Table
CREATE TABLE IF NOT EXISTS client_files (
  id SERIAL PRIMARY KEY,
  folder_id INTEGER NOT NULL REFERENCES client_folders(id) ON DELETE CASCADE,
  file_type VARCHAR(64) NOT NULL,
  file_name VARCHAR(512) NOT NULL,
  file_path VARCHAR(1024) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(128),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_files_folder ON client_files(folder_id);
CREATE INDEX idx_client_files_type ON client_files(file_type);

-- Add imported_from_session_id to clients table
ALTER TABLE clients 
  ADD COLUMN IF NOT EXISTS imported_from_session_id UUID REFERENCES anonymous_sessions(id);

-- Function to automatically update last_active_at
CREATE OR REPLACE FUNCTION update_anonymous_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_anonymous_session_activity
  BEFORE UPDATE ON anonymous_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_anonymous_session_activity();

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
  p_message_count INTEGER,
  p_session_duration INTEGER,
  p_value_delivered BOOLEAN
)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Messages: 5 points each (max 50 points for 10+ messages)
  score := score + LEAST(p_message_count * 5, 50);
  
  -- Duration: 1 point per minute (max 30 points for 30+ minutes)
  score := score + LEAST(p_session_duration / 60, 30);
  
  -- Value delivered: 20 points bonus
  IF p_value_delivered THEN
    score := score + 20;
  END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired anonymous sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM anonymous_sessions 
  WHERE expires_at < NOW() 
    AND converted_to_user_id IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE anonymous_sessions IS 'Stores anonymous user sessions for frictionless onboarding';
COMMENT ON TABLE magic_links IS 'Passwordless authentication tokens sent via email';
COMMENT ON TABLE client_folders IS 'One folder per client containing all their data';
COMMENT ON TABLE client_files IS 'All files associated with a client (conversations, media, assessments)';
COMMENT ON FUNCTION calculate_engagement_score IS 'Calculates user engagement score (0-100) based on activity metrics';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Removes expired anonymous sessions that were never converted';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON anonymous_sessions TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON magic_links TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON client_folders TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON client_files TO your_app_user;
