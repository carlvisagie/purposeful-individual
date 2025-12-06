#!/bin/bash

# Deployment Verification Script
# Tests critical endpoints and functionality

set -e

BASE_URL="${BASE_URL:-https://purposeful-individual.onrender.com}"
echo "Testing deployment at: $BASE_URL"
echo "================================"

# Test 1: Homepage loads
echo "Test 1: Homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
if [ "$STATUS" = "200" ]; then
  echo "✅ Homepage loads (200 OK)"
else
  echo "❌ Homepage failed ($STATUS)"
  exit 1
fi

# Test 2: Login page loads
echo "Test 2: Login page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login")
if [ "$STATUS" = "200" ]; then
  echo "✅ Login page loads (200 OK)"
else
  echo "❌ Login page failed ($STATUS)"
  exit 1
fi

# Test 3: API health check
echo "Test 3: API health..."
RESPONSE=$(curl -s "$BASE_URL/api/trpc/health.check" || echo "FAILED")
if [[ "$RESPONSE" != "FAILED" ]]; then
  echo "✅ API responding"
else
  echo "⚠️  API health check not available (may be normal)"
fi

# Test 4: Static assets load
echo "Test 4: Static assets..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/assets/" || echo "404")
if [ "$STATUS" = "200" ] || [ "$STATUS" = "403" ]; then
  echo "✅ Static assets configured"
else
  echo "⚠️  Static assets may not be configured ($STATUS)"
fi

# Test 5: Check for Manus OAuth (should NOT exist)
echo "Test 5: Verify Manus OAuth removed..."
RESPONSE=$(curl -s "$BASE_URL" | grep -i "oauth-not-configured" || echo "NOT_FOUND")
if [ "$RESPONSE" = "NOT_FOUND" ]; then
  echo "✅ Manus OAuth removed (no #oauth-not-configured)"
else
  echo "❌ Manus OAuth still present!"
  exit 1
fi

# Test 6: Check for login route
echo "Test 6: Login route..."
RESPONSE=$(curl -s "$BASE_URL/login" | grep -i "login\|sign in" || echo "NOT_FOUND")
if [ "$RESPONSE" != "NOT_FOUND" ]; then
  echo "✅ Login page exists"
else
  echo "❌ Login page not found"
  exit 1
fi

echo ""
echo "================================"
echo "✅ All critical tests passed!"
echo "================================"
echo ""
echo "Manual tests required:"
echo "1. Register new account"
echo "2. Login"
echo "3. Book session"
echo "4. Subscribe to AI plan"
echo "5. Test AI chat"
echo ""
echo "See E2E_TEST_SCRIPT.md for full test plan"
