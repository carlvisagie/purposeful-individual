-- Migration: Client Context Display System
-- Created: 2025-12-07
-- Purpose: Add session history, important dates, alerts, and AI memory for coaching

-- Session History Table
CREATE TABLE IF NOT EXISTS session_history (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Session details
  session_date TIMESTAMP NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,
  session_type VARCHAR(64), -- "coaching", "check-in", "crisis", "celebration"
  
  -- Session content
  summary TEXT, -- 5 bullet point summary
  key_topics JSONB DEFAULT '[]'::jsonb, -- Array of topics discussed
  emotional_state VARCHAR(64), -- Client's emotional state
  energy_level INTEGER, -- 1-10
  
  -- Action items
  action_items JSONB DEFAULT '[]'::jsonb, -- Array of action items
  homework_assigned TEXT,
  
  -- Outcomes
  breakthroughs TEXT, -- Any breakthroughs or insights
  concerns_raised TEXT, -- Any concerns to follow up on
  next_session_focus TEXT, -- What to focus on next time
  
  -- Metadata
  session_notes TEXT, -- Coach's private notes
  recording_url TEXT, -- Link to session recording if any
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_history_client ON session_history(client_id);
CREATE INDEX idx_session_history_date ON session_history(session_date DESC);
CREATE INDEX idx_session_history_coach ON session_history(coach_id);

-- Important Dates Table
CREATE TABLE IF NOT EXISTS important_dates (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Date details
  date_type VARCHAR(64) NOT NULL, -- "birthday", "anniversary", "diagnosis", "treatment_start", "therapy_day"
  person_name VARCHAR(256), -- "Alex", "Sarah", "Grandmother Rose"
  date_value DATE NOT NULL,
  recurring BOOLEAN DEFAULT true, -- Annual event?
  
  -- Importance
  importance INTEGER DEFAULT 5, -- 1-10 scale
  alert_days_before INTEGER DEFAULT 1, -- Alert X days before
  
  -- Context
  notes TEXT,
  celebration_message TEXT, -- Custom message to use
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_important_dates_client ON important_dates(client_id);
CREATE INDEX idx_important_dates_date ON important_dates(date_value);
CREATE INDEX idx_important_dates_type ON important_dates(date_type);

-- Critical Alerts Table
CREATE TABLE IF NOT EXISTS critical_alerts (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type VARCHAR(64) NOT NULL, -- "follow_up", "birthday", "concern", "action_item", "celebration"
  priority INTEGER DEFAULT 5, -- 1-10 (10 = critical)
  
  -- Content
  title VARCHAR(256) NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  status VARCHAR(32) DEFAULT 'active', -- "active", "acknowledged", "resolved"
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  
  -- Timing
  show_from DATE,
  show_until DATE,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_critical_alerts_client ON critical_alerts(client_id);
CREATE INDEX idx_critical_alerts_status ON critical_alerts(status);
CREATE INDEX idx_critical_alerts_priority ON critical_alerts(priority DESC);

-- Personal Details Table (Things to remember)
CREATE TABLE IF NOT EXISTS personal_details (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Detail info
  category VARCHAR(64) NOT NULL, -- "family", "interest", "preference", "value", "trigger"
  detail_key VARCHAR(128) NOT NULL, -- "favorite_scientist", "hobby", "communication_style"
  detail_value TEXT NOT NULL,
  
  -- Context
  importance INTEGER DEFAULT 5, -- 1-10
  mentioned_date DATE,
  context TEXT, -- How/when this came up
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_personal_details_client ON personal_details(client_id);
CREATE INDEX idx_personal_details_category ON personal_details(category);
CREATE INDEX idx_personal_details_importance ON personal_details(importance DESC);

-- AI Memory Table (For AI coaches)
CREATE TABLE IF NOT EXISTS ai_coach_memory (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Complete conversation history
  conversation_history JSONB DEFAULT '[]'::jsonb,
  
  -- Extracted memories
  personal_memory JSONB DEFAULT '{}'::jsonb,
  emotional_memory JSONB DEFAULT '{}'::jsonb,
  progress_memory JSONB DEFAULT '{}'::jsonb,
  
  -- Relationship tracking
  relationship_metrics JSONB DEFAULT '{}'::jsonb,
  
  -- Context for next session (pre-computed)
  next_session_context JSONB DEFAULT '{}'::jsonb,
  
  -- Last interaction
  last_message_at TIMESTAMP,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_memory_client ON ai_coach_memory(client_id);
CREATE INDEX idx_ai_memory_last_message ON ai_coach_memory(last_message_at DESC);

-- Session Context View (Pre-computed for instant display)
CREATE TABLE IF NOT EXISTS session_context_cache (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Last session summary
  last_session_date TIMESTAMP,
  last_session_summary JSONB, -- 5 bullet points
  
  -- Critical alerts (next 7 days)
  critical_alerts JSONB DEFAULT '[]'::jsonb,
  
  -- Upcoming dates (next 30 days)
  upcoming_dates JSONB DEFAULT '[]'::jsonb,
  
  -- Progress metrics
  progress_metrics JSONB DEFAULT '{}'::jsonb,
  
  -- Preemptive intelligence
  suggested_topics JSONB DEFAULT '[]'::jsonb,
  predicted_needs JSONB DEFAULT '[]'::jsonb,
  
  -- Quick stats
  total_sessions INTEGER DEFAULT 0,
  days_since_last_session INTEGER,
  engagement_score INTEGER DEFAULT 0,
  
  -- Cache metadata
  last_computed TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_context_cache_client ON session_context_cache(client_id);

-- Function to update session context cache
CREATE OR REPLACE FUNCTION update_session_context_cache(p_client_id INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Delete existing cache
  DELETE FROM session_context_cache WHERE client_id = p_client_id;
  
  -- Insert new cache
  INSERT INTO session_context_cache (
    client_id,
    last_session_date,
    last_session_summary,
    critical_alerts,
    upcoming_dates,
    total_sessions,
    days_since_last_session,
    last_computed
  )
  SELECT
    p_client_id,
    (SELECT session_date FROM session_history WHERE client_id = p_client_id ORDER BY session_date DESC LIMIT 1),
    (SELECT jsonb_build_object(
      'summary', summary,
      'key_topics', key_topics,
      'emotional_state', emotional_state,
      'action_items', action_items
    ) FROM session_history WHERE client_id = p_client_id ORDER BY session_date DESC LIMIT 1),
    (SELECT jsonb_agg(jsonb_build_object(
      'title', title,
      'message', message,
      'priority', priority
    )) FROM critical_alerts WHERE client_id = p_client_id AND status = 'active' ORDER BY priority DESC),
    (SELECT jsonb_agg(jsonb_build_object(
      'date', date_value,
      'type', date_type,
      'person', person_name,
      'notes', notes
    )) FROM important_dates WHERE client_id = p_client_id AND date_value BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' ORDER BY date_value),
    (SELECT COUNT(*) FROM session_history WHERE client_id = p_client_id),
    (SELECT EXTRACT(DAY FROM NOW() - MAX(session_date)) FROM session_history WHERE client_id = p_client_id),
    NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update cache after session
CREATE OR REPLACE FUNCTION trigger_update_context_cache()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_session_context_cache(NEW.client_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_session_update_cache
  AFTER INSERT OR UPDATE ON session_history
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_context_cache();

-- Function to get upcoming birthdays
CREATE OR REPLACE FUNCTION get_upcoming_birthdays(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE(
  client_id INTEGER,
  person_name VARCHAR,
  date_value DATE,
  days_until INTEGER,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id.client_id,
    id.person_name,
    id.date_value,
    EXTRACT(DAY FROM id.date_value - CURRENT_DATE)::INTEGER as days_until,
    id.notes
  FROM important_dates id
  WHERE id.date_type = 'birthday'
    AND id.date_value BETWEEN CURRENT_DATE AND CURRENT_DATE + days_ahead
  ORDER BY id.date_value;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE session_history IS 'Complete history of all coaching sessions with summaries and action items';
COMMENT ON TABLE important_dates IS 'Birthdays, anniversaries, and other important dates to remember';
COMMENT ON TABLE critical_alerts IS 'High-priority alerts and reminders for coaches';
COMMENT ON TABLE personal_details IS 'Personal information to remember about clients (interests, preferences, family)';
COMMENT ON TABLE ai_coach_memory IS 'AI coach memory system for perfect recall and relationship building';
COMMENT ON TABLE session_context_cache IS 'Pre-computed context for instant display at session start';
COMMENT ON FUNCTION update_session_context_cache IS 'Updates cached context for a client (called automatically after sessions)';
COMMENT ON FUNCTION get_upcoming_birthdays IS 'Returns birthdays coming up in next X days';
