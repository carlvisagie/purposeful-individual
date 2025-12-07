-- Migration: Vapi Phone Integration
-- Created: 2025-12-07
-- Purpose: Add call logging and tracking for 24/7 AI phone coaching

-- Vapi Call Logs Table
CREATE TABLE IF NOT EXISTS vapi_call_logs (
  id SERIAL PRIMARY KEY,
  
  -- Call details
  call_id VARCHAR(256) NOT NULL UNIQUE,
  phone_number VARCHAR(32),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  
  -- Content
  transcript TEXT,
  summary TEXT,
  
  -- Client association
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vapi_calls_client ON vapi_call_logs(client_id);
CREATE INDEX idx_vapi_calls_phone ON vapi_call_logs(phone_number);
CREATE INDEX idx_vapi_calls_created ON vapi_call_logs(created_at DESC);
CREATE INDEX idx_vapi_calls_call_id ON vapi_call_logs(call_id);

-- Add phone number to users table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(32);
    CREATE INDEX idx_users_phone ON users(phone);
  END IF;
END $$;

-- Vapi Assistant Configuration Table
CREATE TABLE IF NOT EXISTS vapi_assistants (
  id SERIAL PRIMARY KEY,
  
  -- Vapi details
  vapi_assistant_id VARCHAR(256) NOT NULL UNIQUE,
  name VARCHAR(256) NOT NULL,
  
  -- Configuration
  system_prompt TEXT,
  first_message TEXT,
  voice_id VARCHAR(256),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vapi Phone Numbers Table
CREATE TABLE IF NOT EXISTS vapi_phone_numbers (
  id SERIAL PRIMARY KEY,
  
  -- Phone details
  vapi_phone_id VARCHAR(256) NOT NULL UNIQUE,
  phone_number VARCHAR(32) NOT NULL,
  
  -- Association
  assistant_id INTEGER REFERENCES vapi_assistants(id) ON DELETE SET NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vapi_phone_numbers_assistant ON vapi_phone_numbers(assistant_id);

-- Function to get client by phone number
CREATE OR REPLACE FUNCTION get_client_by_phone(p_phone_number VARCHAR)
RETURNS TABLE(
  client_id INTEGER,
  client_name VARCHAR,
  email VARCHAR,
  last_session_date TIMESTAMP,
  total_sessions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as client_id,
    u.name as client_name,
    u.email,
    (SELECT MAX(session_date) FROM session_history WHERE client_id = c.id) as last_session_date,
    (SELECT COUNT(*)::INTEGER FROM session_history WHERE client_id = c.id) as total_sessions
  FROM clients c
  JOIN users u ON c.user_id = u.id
  WHERE u.phone = p_phone_number
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to log AI phone call
CREATE OR REPLACE FUNCTION log_ai_phone_call(
  p_call_id VARCHAR,
  p_phone_number VARCHAR,
  p_duration INTEGER,
  p_transcript TEXT,
  p_summary TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_client_id INTEGER;
  v_log_id INTEGER;
BEGIN
  -- Try to find client by phone
  SELECT client_id INTO v_client_id
  FROM get_client_by_phone(p_phone_number);
  
  -- Insert call log
  INSERT INTO vapi_call_logs (
    call_id, phone_number, duration_seconds, transcript, summary, client_id
  ) VALUES (
    p_call_id, p_phone_number, p_duration, p_transcript, p_summary, v_client_id
  )
  RETURNING id INTO v_log_id;
  
  -- If client found, add to session history
  IF v_client_id IS NOT NULL AND p_transcript IS NOT NULL THEN
    INSERT INTO session_history (
      client_id,
      session_type,
      duration_minutes,
      summary,
      session_notes
    ) VALUES (
      v_client_id,
      'phone_ai',
      CEIL(p_duration::FLOAT / 60),
      COALESCE(p_summary, 'AI phone coaching session'),
      p_transcript
    );
    
    -- Update context cache
    PERFORM update_session_context_cache(v_client_id);
  END IF;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- View for call analytics
CREATE OR REPLACE VIEW vapi_call_analytics AS
SELECT
  DATE(created_at) as call_date,
  COUNT(*) as total_calls,
  SUM(duration_seconds) as total_duration_seconds,
  AVG(duration_seconds) as avg_duration_seconds,
  COUNT(DISTINCT client_id) as unique_clients,
  COUNT(CASE WHEN client_id IS NULL THEN 1 END) as new_caller_count,
  COUNT(CASE WHEN client_id IS NOT NULL THEN 1 END) as returning_caller_count
FROM vapi_call_logs
GROUP BY DATE(created_at)
ORDER BY call_date DESC;

-- Comments
COMMENT ON TABLE vapi_call_logs IS 'Logs of all AI phone coaching calls via Vapi';
COMMENT ON TABLE vapi_assistants IS 'Vapi AI assistant configurations';
COMMENT ON TABLE vapi_phone_numbers IS 'Phone numbers connected to Vapi assistants';
COMMENT ON FUNCTION get_client_by_phone IS 'Retrieve client information by phone number';
COMMENT ON FUNCTION log_ai_phone_call IS 'Log an AI phone call and update client history';
COMMENT ON VIEW vapi_call_analytics IS 'Daily analytics for AI phone calls';
