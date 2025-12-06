# Final Deployment Steps - Launch Checklist

**Platform**: Purposeful Live Coaching  
**Goal**: Get platform LIVE and generating revenue TODAY  
**Date**: December 6, 2025

---

## 🚨 CRITICAL: Do These Steps IN ORDER

---

## Step 1: Update Render Service Configuration (5 minutes)

### 1.1 Change Branch
1. Go to https://dashboard.render.com
2. Select `purposeful-individual` service
3. Click "Settings"
4. Scroll to "Build & Deploy"
5. **Branch**: Change from `main` to `remove-manus-dependencies`
6. Click "Save Changes"

### 1.2 Remove Old Environment Variables
In "Environment" tab, **DELETE these**:
- `VITE_OAUTH_PORTAL_URL`
- `VITE_APP_ID`

### 1.3 Verify Required Environment Variables
Make sure these exist:
- ✅ `DATABASE_URL` (PostgreSQL connection string)
- ✅ `NODE_ENV=production`
- ✅ `PORT=3000`
- ✅ `OPENAI_API_KEY` (for AI coach)

### 1.4 Add Stripe Variables (if not already there)
- `STRIPE_SECRET_KEY=sk_test_...` (use test key first)
- `STRIPE_PUBLISHABLE_KEY=pk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` (get from Stripe Dashboard)

---

## Step 2: Deploy New Code (10 minutes)

### 2.1 Trigger Manual Deploy
1. In Render Dashboard
2. Click "Manual Deploy"
3. Select branch: `remove-manus-dependencies`
4. Click "Deploy"
5. **Wait for build to complete** (~5-10 minutes)

### 2.2 Monitor Build Logs
Watch for:
- ✅ "Installing dependencies..."
- ✅ "Building frontend..."
- ✅ "Build succeeded"
- ✅ "Starting server..."
- ✅ "Server listening on port 3000"

If build fails:
- Check logs for specific error
- Fix error in code
- Push to GitHub
- Redeploy

---

## Step 3: Run Database Migration (5 minutes)

### 3.1 Open Render Shell
1. In Render Dashboard
2. Click "Shell" tab
3. Wait for shell to connect

### 3.2 Run Migration Script
```bash
./migrate-to-postgresql.sh
```

**Expected output:**
```
🚀 Starting PostgreSQL migration...
✅ DATABASE_URL is set
📦 Installing dependencies...
📋 Backing up old MySQL schema...
🔄 Switching to PostgreSQL schema...
🔧 Updating drizzle config...
🔨 Generating migration...
⚡ Running migration...
✅ Migration complete!
```

### 3.3 Verify Tables Created
```bash
psql $DATABASE_URL -c "\dt"
```

**Should see 25+ tables:**
- users
- auth_sessions
- clients
- coaches
- sessions
- subscriptions
- ai_chat_conversations
- ai_chat_messages
- journal_entries
- emotion_logs
- (and more...)

If tables are missing:
- Re-run migration script
- Check for errors in output
- Verify DATABASE_URL is correct

---

## Step 4: Test Authentication (5 minutes)

### 4.1 Visit Site
Go to: https://purposeful-individual.onrender.com

### 4.2 Test Registration
1. Click "Start Your Journey"
2. **Should redirect to `/login`** (NOT #oauth-not-configured)
3. If still shows #oauth-not-configured:
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)
   - Wait 2 minutes for CDN to update

4. Click "Don't have an account? Sign up"
5. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: testpassword123
6. Click "Create Account"
7. **Should redirect to homepage (logged in)**

### 4.3 Verify Login Persists
1. Refresh page
2. Should still be logged in
3. Name shows in header

### 4.4 Test Logout
1. Click logout
2. Should redirect to homepage (logged out)

### 4.5 Test Login
1. Go to /login
2. Enter email and password
3. Click "Sign In"
4. Should log in successfully

**If any of these fail, STOP and debug before continuing.**

---

## Step 5: Test Session Booking (10 minutes)

### 5.1 Configure Stripe (if not done)
1. Go to https://stripe.com
2. Create test products (see STRIPE_CONFIGURATION_GUIDE.md)
3. Get API keys
4. Add to Render environment variables
5. Redeploy if needed

### 5.2 Test Booking Flow
1. Login to platform
2. Click "Book Foundation Session"
3. **Should redirect to Stripe Checkout**
4. If error, check:
   - Stripe keys are correct
   - Webhook is configured
   - Check Render logs

5. Enter test card: `4242 4242 4242 4242`
6. Expiry: `12/25`
7. CVC: `123`
8. ZIP: `12345`
9. Click "Pay"
10. **Should redirect back to platform**
11. Booking confirmation shows

### 5.3 Verify in Database
In Render Shell:
```bash
psql $DATABASE_URL -c "SELECT * FROM sessions ORDER BY created_at DESC LIMIT 1;"
```

Should show the session you just booked.

---

## Step 6: Test AI Coach (5 minutes)

### 6.1 Start Conversation
1. Login
2. Click "AI Coach" or "Start Coaching"
3. New conversation should open

### 6.2 Send Message
1. Type: "I'm feeling anxious about work"
2. Click send
3. **AI should respond within 5 seconds**
4. Response should be relevant

If AI doesn't respond:
- Check OPENAI_API_KEY is set
- Check Render logs for errors
- Verify API key is valid

### 6.3 Continue Conversation
1. Send 2-3 more messages
2. AI maintains context
3. No errors

---

## Step 7: Test Subscription Flow (10 minutes)

### 7.1 Subscribe to Plan
1. Logout (if logged in)
2. Register new account (different email)
3. Click "AI-Only - $29/month"
4. Should redirect to Stripe Checkout
5. Enter test card
6. Complete subscription
7. Should redirect back
8. Subscription shows "Active"

### 7.2 Verify in Database
```bash
psql $DATABASE_URL -c "SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;"
```

Should show subscription with:
- tier: "ai_only"
- status: "active"
- stripe_subscription_id: "sub_..."

---

## Step 8: Configure DNS (10 minutes)

### 8.1 Get Render Service URL
The service URL is: `purposeful-individual.onrender.com`

### 8.2 Update Cloudflare DNS
1. Login to Cloudflare
2. Select domain: `purposefullivecoaching.academy`
3. Go to DNS settings

### 8.3 Delete Old Records
Delete any existing A records for:
- `@` (root domain)
- `www`

### 8.4 Add CNAME Records
**Record 1:**
- Type: CNAME
- Name: `@`
- Target: `purposeful-individual.onrender.com`
- Proxy status: Proxied (orange cloud)
- TTL: Auto

**Record 2:**
- Type: CNAME
- Name: `www`
- Target: `purposeful-individual.onrender.com`
- Proxy status: Proxied (orange cloud)
- TTL: Auto

### 8.5 Wait for DNS Propagation
- Usually takes 5-15 minutes
- Can take up to 24 hours
- Check status: https://dnschecker.org

### 8.6 Add Custom Domain in Render
1. Go to Render Dashboard
2. Select `purposeful-individual` service
3. Click "Settings"
4. Scroll to "Custom Domains"
5. Click "Add Custom Domain"
6. Enter: `purposefullivecoaching.academy`
7. Click "Save"
8. Repeat for: `www.purposefullivecoaching.academy`

### 8.7 Test Domain
Visit: https://purposefullivecoaching.academy

Should load the platform (may take a few minutes).

---

## Step 9: Final Testing (15 minutes)

### 9.1 Complete User Journey
1. Visit https://purposefullivecoaching.academy
2. Click "Start Your Journey"
3. Register account
4. Book a session
5. Complete payment
6. Start AI conversation
7. Log emotion
8. Create journal entry
9. Subscribe to plan
10. Logout
11. Login again
12. Verify all data persists

**If all steps work: PLATFORM IS LIVE! 🎉**

### 9.2 Test on Mobile
1. Open on phone
2. Test registration
3. Test booking
4. Test AI chat
5. Verify responsive design

### 9.3 Test in Different Browsers
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

---

## Step 10: Switch to Live Mode (when ready)

### 10.1 Stripe Live Mode
1. Create live products in Stripe
2. Get live API keys
3. Create live webhook
4. Update Render environment variables:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_live_...`
5. Redeploy

### 10.2 Test with Real Card
1. Make small test purchase ($1)
2. Verify payment processes
3. Refund test transaction
4. **GO LIVE!**

---

## Troubleshooting

### Issue: Buttons still go to #oauth-not-configured
**Fix:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Verify branch is `remove-manus-dependencies`
4. Check frontend build succeeded

### Issue: Can't login after registration
**Fix:**
1. Check Render logs for database errors
2. Verify DATABASE_URL is correct
3. Verify migration ran successfully
4. Check `users` and `auth_sessions` tables exist

### Issue: Stripe checkout fails
**Fix:**
1. Verify Stripe keys are correct
2. Check webhook is configured
3. Verify products exist in Stripe
4. Check Render logs for errors

### Issue: AI doesn't respond
**Fix:**
1. Verify OPENAI_API_KEY is set
2. Check API key is valid
3. Check Render logs for errors
4. Verify OpenAI account has credits

### Issue: DNS not resolving
**Fix:**
1. Wait longer (up to 24 hours)
2. Verify CNAME records are correct
3. Check Cloudflare proxy is enabled
4. Use https://dnschecker.org to verify

---

## Success Criteria

✅ Platform loads at custom domain  
✅ Users can register  
✅ Users can login  
✅ Sessions can be booked  
✅ Stripe payments work  
✅ AI coach responds  
✅ Database stores data  
✅ No console errors  
✅ Mobile responsive  
✅ All browsers work  

**If all criteria met: PLATFORM IS REVENUE-READY! 💰**

---

## Post-Launch Checklist

### Immediate (Today):
- [ ] Monitor Render logs for errors
- [ ] Watch Stripe dashboard for payments
- [ ] Test all critical flows
- [ ] Fix any bugs immediately

### This Week:
- [ ] Set up email notifications (Resend)
- [ ] Configure monitoring (Sentry)
- [ ] Set up analytics (PostHog/Plausible)
- [ ] Create backup strategy
- [ ] Document known issues

### This Month:
- [ ] Implement conversational onboarding
- [ ] Add automated scheduling
- [ ] Build refund automation
- [ ] Add more session types
- [ ] Improve AI coach prompts

---

## Support

If you encounter issues:
1. Check Render logs
2. Check Stripe dashboard
3. Verify environment variables
4. Review this guide
5. Check database tables

**Platform is now ready to generate revenue! 🚀**

---

## Timeline Summary

**Total Time: ~60-90 minutes**

- Step 1: Update Render (5 min)
- Step 2: Deploy (10 min)
- Step 3: Migrate DB (5 min)
- Step 4: Test Auth (5 min)
- Step 5: Test Booking (10 min)
- Step 6: Test AI (5 min)
- Step 7: Test Subscriptions (10 min)
- Step 8: Configure DNS (10 min)
- Step 9: Final Testing (15 min)
- Step 10: Go Live (when ready)

**You can be LIVE and accepting payments in under 2 hours!**
