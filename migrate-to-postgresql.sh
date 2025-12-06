#!/bin/bash

# Migration script to PostgreSQL with standalone auth
# Run this ONCE to migrate the database

set -e

echo "🚀 Starting PostgreSQL migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "✅ DATABASE_URL is set"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Backup old schema
echo "📋 Backing up old MySQL schema..."
cp drizzle/schema.ts drizzle/schema-mysql-backup.ts

# Replace schema with PostgreSQL version
echo "🔄 Switching to PostgreSQL schema..."
cp drizzle/schema-postgresql.ts drizzle/schema.ts

# Replace drizzle config
echo "🔧 Updating drizzle config..."
cp drizzle.config-postgresql.ts drizzle.config.ts

# Generate migration
echo "🔨 Generating migration..."
pnpm drizzle-kit generate

# Run migration
echo "⚡ Running migration..."
pnpm drizzle-kit migrate

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Verify tables created: psql \$DATABASE_URL -c '\\dt'"
echo "2. Test authentication: Start the server and try to register"
echo "3. Commit changes: git add . && git commit -m 'Migrate to PostgreSQL with standalone auth'"
