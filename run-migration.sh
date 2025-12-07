#!/bin/bash

# Run frictionless onboarding migration on Render PostgreSQL database
# This script connects to the production database

echo "Running frictionless onboarding migration..."

# Database connection string (from Render)
# Format: postgresql://user:password@host:port/database
DB_URL="postgresql://purposeful_individual_user:QQhQGgBHQqGtCGqsJoEQDMDhNOOSQxFO@dpg-d4npae6uk2gs73fppev0-a.oregon-postgres.render.com/purposeful_individual"

# Run migration using psql with SSL
psql "$DB_URL?sslmode=require" -f drizzle/migrations/003_frictionless_onboarding.sql

echo "Migration complete!"
