-- Initial Schema Migration for Purposeful Individual Platform
-- PostgreSQL Database

-- Create ENUM types first
CREATE TYPE role AS ENUM ('user', 'admin');
CREATE TYPE autism_severity AS ENUM ('mild', 'moderate', 'severe');
CREATE TYPE communication_level AS ENUM ('nonverbal', 'minimally_verbal', 'verbal');
CREATE TYPE intervention_phase AS ENUM ('foundation', 'biomedical', 'behavioral', 'advanced');
CREATE TYPE supplement_frequency AS ENUM ('daily', 'twice_daily', 'every_3_days');
CREATE TYPE diet_type AS ENUM ('GFCF', 'ketogenic', 'SCD');
CREATE TYPE therapy_type AS ENUM ('ABA', 'OT', 'speech', 'Floortime', 'neurofeedback');
CREATE TYPE pattern_type AS ENUM ('high_responder', 'moderate_responder', 'non_responder');
CREATE TYPE provider_type AS ENUM ('ABA', 'OT', 'speech', 'FMT_clinic', 'neurofeedback');
CREATE TYPE accepts_insurance AS ENUM ('true', 'false');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(256),
  password_salt VARCHAR(64),
  name TEXT,
  login_method VARCHAR(64) DEFAULT 'email',
  role role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_signed_in TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Auth sessions table
CREATE TABLE IF NOT EXISTS auth_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(256) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Autism profiles table
CREATE TABLE IF NOT EXISTS autism_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_name VARCHAR(255) NOT NULL,
  date_of_birth TIMESTAMP NOT NULL,
  diagnosis_date TIMESTAMP,
  severity autism_severity NOT NULL,
  atec_score INTEGER,
  cars_score INTEGER,
  communication_level communication_level NOT NULL,
  gi_symptoms JSONB,
  sleep_issues JSONB,
  sensory_profile JSONB,
  behavior_challenges JSONB,
  family_resources JSONB,
  treatment_priorities JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Intervention plans table
CREATE TABLE IF NOT EXISTS intervention_plans (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES autism_profiles(id) ON DELETE CASCADE,
  tier1_interventions JSONB NOT NULL,
  tier2_interventions JSONB,
  tier3_interventions JSONB,
  tier4_interventions JSONB,
  current_phase intervention_phase NOT NULL,
  start_date TIMESTAMP NOT NULL,
  provider_directory JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Supplement tracking table
CREATE TABLE IF NOT EXISTS supplement_tracking (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES autism_profiles(id) ON DELETE CASCADE,
  supplement_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(255) NOT NULL,
  frequency supplement_frequency NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  adherence INTEGER,
  side_effects JSONB,
  perceived_benefit INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Dietary interventions table
CREATE TABLE IF NOT EXISTS dietary_interventions (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES autism_profiles(id) ON DELETE CASCADE,
  diet_type diet_type NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  adherence INTEGER,
  gi_symptom_changes JSONB,
  behavior_changes JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Therapy sessions table
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES autism_profiles(id) ON DELETE CASCADE,
  therapy_type therapy_type NOT NULL,
  session_date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,
  goals_addressed JSONB,
  progress JSONB,
  parent_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Autism outcome tracking table
CREATE TABLE IF NOT EXISTS autism_outcome_tracking (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES autism_profiles(id) ON DELETE CASCADE,
  assessment_date TIMESTAMP NOT NULL,
  atec_score INTEGER,
  cars_score INTEGER,
  communication_level communication_level,
  behavior_score INTEGER,
  adaptive_function_score INTEGER,
  gi_symptom_score INTEGER,
  sleep_score INTEGER,
  family_qol INTEGER,
  parent_stress INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Autism pattern detection table
CREATE TABLE IF NOT EXISTS autism_pattern_detection (
  id SERIAL PRIMARY KEY,
  child_profile JSONB NOT NULL,
  intervention_combination JSONB NOT NULL,
  outcome_data JSONB NOT NULL,
  pattern_type pattern_type,
  confidence INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Autism providers table
CREATE TABLE IF NOT EXISTS autism_providers (
  id SERIAL PRIMARY KEY,
  provider_type provider_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(320),
  website VARCHAR(500),
  rating INTEGER,
  review_count INTEGER,
  accepts_insurance accepts_insurance NOT NULL,
  cost_range VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Autism daily logs table
CREATE TABLE IF NOT EXISTS autism_daily_logs (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES autism_profiles(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  mood INTEGER NOT NULL,
  sleep_quality INTEGER NOT NULL,
  sleep_hours INTEGER,
  meltdown_count INTEGER NOT NULL DEFAULT 0,
  communication_attempts INTEGER NOT NULL DEFAULT 0,
  wins TEXT,
  challenges TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_autism_profiles_user_id ON autism_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_intervention_plans_profile_id ON intervention_plans(profile_id);
CREATE INDEX IF NOT EXISTS idx_supplement_tracking_profile_id ON supplement_tracking(profile_id);
CREATE INDEX IF NOT EXISTS idx_dietary_interventions_profile_id ON dietary_interventions(profile_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_profile_id ON therapy_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_autism_outcome_tracking_profile_id ON autism_outcome_tracking(profile_id);
CREATE INDEX IF NOT EXISTS idx_autism_daily_logs_profile_id ON autism_daily_logs(profile_id);
