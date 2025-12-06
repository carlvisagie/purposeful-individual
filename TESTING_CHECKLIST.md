# Complete Testing Checklist

**Platform**: Purposeful Live Coaching  
**Branch**: remove-manus-dependencies  
**Date**: December 6, 2025

---

## Pre-Deployment Checklist

### ✅ Code Changes
- [x] Removed all Manus OAuth code
- [x] Removed all Manus SDK references
- [x] Implemented standalone email/password auth
- [x] Converted schema to PostgreSQL
- [x] Created migration script
- [x] Pushed to GitHub

### ✅ Environment Variables
- [ ] DATABASE_URL set to PostgreSQL connection
- [ ] STRIPE_SECRET_KEY configured
- [ ] STRIPE_PUBLISHABLE_KEY configured
- [ ] STRIPE_WEBHOOK_SECRET configured
- [ ] OPENAI_API_KEY configured
- [ ] NODE_ENV=production
- [ ] Removed VITE_OAUTH_PORTAL_URL
- [ ] Removed VITE_APP_ID

### ✅ Render Configuration
- [ ] Service branch changed to `remove-manus-dependencies`
- [ ] Build command correct
- [ ] Start command correct
- [ ] Auto-deploy enabled

---

## Post-Deployment Testing

### 1. Homepage & Navigation

**Test**: Visit homepage
- [ ] Homepage loads without errors
- [ ] No console errors in browser
- [ ] All images load
- [ ] Navigation menu works
- [ ] Footer displays correctly

**Test**: Click "Start Your Journey" button
- [ ] Redirects to `/login` (NOT #oauth-not-configured)
- [ ] Login page loads
- [ ] No errors in console

---

### 2. Authentication Flow

#### Registration

**Test**: Register new account
1. [ ] Go to `/login`
2. [ ] Click "Don't have an account? Sign up"
3. [ ] Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: testpassword123
4. [ ] Click "Create Account"
5. [ ] Should redirect to homepage (logged in)
6. [ ] User name displays in header
7. [ ] Session persists on page refresh

**Expected Database State**:
- [ ] User record created in `users` table
- [ ] Client record created in `clients` table
- [ ] Auth session created in `auth_sessions` table

#### Login

**Test**: Login with existing account
1. [ ] Logout (if logged in)
2. [ ] Go to `/login`
3. [ ] Enter email and password
4. [ ] Click "Sign In"
5. [ ] Should redirect to homepage (logged in)
6. [ ] Session persists

**Test**: Login with wrong password
1. [ ] Enter correct email, wrong password
2. [ ] Click "Sign In"
3. [ ] Should show error: "Invalid email or password"
4. [ ] Should NOT log in

#### Logout

**Test**: Logout
1. [ ] Click logout button (in header/menu)
2. [ ] Should redirect to homepage (logged out)
3. [ ] Session cleared
4. [ ] Cannot access protected pages

---

### 3. Session Booking Flow

**Test**: Book Foundation Session (first-time)
1. [ ] Login as new user
2. [ ] Click "Book Foundation Session"
3. [ ] Should redirect to Stripe Checkout
4. [ ] Price shows $97
5. [ ] Enter test card: 4242 4242 4242 4242
6. [ ] Complete payment
7. [ ] Should redirect back to platform
8. [ ] Booking confirmation shows
9. [ ] Session appears in "My Sessions"

**Expected Database State**:
- [ ] Session record created in `sessions` table
- [ ] Status: "scheduled"
- [ ] Price: 9700 (cents)

**Test**: Book Standard Session
1. [ ] Click "Book Standard Session"
2. [ ] Price shows $147
3. [ ] Complete Stripe checkout
4. [ ] Session created successfully

---

### 4. Subscription Flow

**Test**: Subscribe to AI-Only (Monthly)
1. [ ] Login
2. [ ] Click "AI-Only - $29/month"
3. [ ] Should redirect to Stripe Checkout
4. [ ] Price shows $29/month
5. [ ] Enter test card
6. [ ] Complete subscription
7. [ ] Should redirect back
8. [ ] Subscription status shows "Active"

**Expected Database State**:
- [ ] Subscription record created
- [ ] Tier: "ai_only"
- [ ] Billing period: "monthly"
- [ ] Status: "active"
- [ ] Stripe subscription ID populated

**Test**: Subscribe to Hybrid (Yearly)
1. [ ] Login with different account
2. [ ] Click "Hybrid - $1,527/year"
3. [ ] Price shows $1,527/year
4. [ ] Complete subscription
5. [ ] Subscription active

**Test**: Cancel Subscription
1. [ ] Go to account settings
2. [ ] Click "Cancel Subscription"
3. [ ] Confirm cancellation
4. [ ] Status changes to "cancel_at_period_end"
5. [ ] Still has access until period ends

---

### 5. AI Coach

**Test**: Start AI conversation
1. [ ] Login
2. [ ] Click "AI Coach" or "Start Coaching"
3. [ ] New conversation created
4. [ ] Chat interface loads
5. [ ] Type message: "I'm feeling anxious today"
6. [ ] Click send
7. [ ] AI responds within 5 seconds
8. [ ] Response is relevant and empathetic

**Expected Database State**:
- [ ] Conversation record in `ai_chat_conversations`
- [ ] User message in `ai_chat_messages` (role: "user")
- [ ] AI message in `ai_chat_messages` (role: "assistant")

**Test**: Continue conversation
1. [ ] Send 3-5 more messages
2. [ ] AI maintains context
3. [ ] Responses are coherent
4. [ ] No errors

**Test**: View conversation history
1. [ ] Go to "My Conversations"
2. [ ] All conversations listed
3. [ ] Click on conversation
4. [ ] Full message history loads
5. [ ] Can continue conversation

---

### 6. Emotion Tracking

**Test**: Log emotion
1. [ ] Go to "Emotion Tracker"
2. [ ] Select emotion: "Anxious"
3. [ ] Set intensity: 7/10
4. [ ] Add trigger: "Work deadline"
5. [ ] Click "Log Emotion"
6. [ ] Emotion saved successfully

**Expected Database State**:
- [ ] Record in `emotion_logs` table
- [ ] Emotion: "Anxious"
- [ ] Intensity: 7
- [ ] Trigger: "Work deadline"

**Test**: View emotion history
1. [ ] Go to "Emotion Dashboard"
2. [ ] Chart displays emotions over time
3. [ ] Can filter by date range
4. [ ] Can filter by emotion type

---

### 7. Journaling

**Test**: Create journal entry
1. [ ] Go to "Journal"
2. [ ] Click "New Entry"
3. [ ] Write content: "Today was challenging..."
4. [ ] Select mood: "Reflective"
5. [ ] Click "Save"
6. [ ] Entry saved

**Expected Database State**:
- [ ] Record in `journal_entries` table
- [ ] Content saved
- [ ] Mood: "Reflective"

**Test**: View journal entries
1. [ ] Go to "My Journal"
2. [ ] All entries listed
3. [ ] Can search entries
4. [ ] Can edit entries
5. [ ] Can delete entries

---

### 8. Admin Features (if applicable)

**Test**: Admin dashboard access
1. [ ] Login as admin user
2. [ ] Go to `/admin` or `/dashboard`
3. [ ] Dashboard loads
4. [ ] Can view all users
5. [ ] Can view all sessions
6. [ ] Can view revenue metrics

**Test**: Manage clients
1. [ ] View client list
2. [ ] Search for client
3. [ ] View client details
4. [ ] View client's sessions
5. [ ] View client's subscription

---

### 9. Email Notifications (if configured)

**Test**: Welcome email
1. [ ] Register new account
2. [ ] Check email inbox
3. [ ] Welcome email received
4. [ ] Links work

**Test**: Session confirmation email
1. [ ] Book a session
2. [ ] Check email
3. [ ] Confirmation email received
4. [ ] Calendar invite attached (if applicable)

**Test**: Subscription confirmation
1. [ ] Subscribe to plan
2. [ ] Check email
3. [ ] Subscription confirmation received
4. [ ] Receipt attached

---

### 10. Error Handling

**Test**: Invalid email format
1. [ ] Try to register with "notanemail"
2. [ ] Should show validation error
3. [ ] Should not submit

**Test**: Password too short
1. [ ] Try to register with password "123"
2. [ ] Should show "At least 8 characters"
3. [ ] Should not submit

**Test**: Duplicate email
1. [ ] Try to register with existing email
2. [ ] Should show "Email already registered"
3. [ ] Should not create account

**Test**: Network error handling
1. [ ] Disconnect internet
2. [ ] Try to send AI message
3. [ ] Should show error message
4. [ ] Should not crash

---

### 11. Performance Testing

**Test**: Page load times
- [ ] Homepage loads in < 2 seconds
- [ ] Login page loads in < 1 second
- [ ] Dashboard loads in < 3 seconds
- [ ] AI chat loads in < 2 seconds

**Test**: AI response time
- [ ] AI responds in < 5 seconds
- [ ] No timeout errors
- [ ] Streaming works (if implemented)

**Test**: Database queries
- [ ] No N+1 query issues
- [ ] Queries optimized
- [ ] Indexes created

---

### 12. Security Testing

**Test**: SQL injection protection
1. [ ] Try to login with: `' OR '1'='1`
2. [ ] Should fail safely
3. [ ] No database error exposed

**Test**: XSS protection
1. [ ] Try to enter: `<script>alert('XSS')</script>`
2. [ ] Should be escaped/sanitized
3. [ ] No script execution

**Test**: CSRF protection
1. [ ] Try to submit form from external site
2. [ ] Should be rejected
3. [ ] CSRF token validated

**Test**: Session security
1. [ ] Check cookie is httpOnly
2. [ ] Check cookie is secure (in production)
3. [ ] Check cookie has sameSite
4. [ ] Session expires after 1 year

---

### 13. Mobile Responsiveness

**Test**: Mobile view (iPhone)
- [ ] Homepage displays correctly
- [ ] Login form usable
- [ ] Navigation menu works
- [ ] AI chat interface usable
- [ ] Buttons are tappable

**Test**: Tablet view (iPad)
- [ ] Layout adjusts properly
- [ ] All features accessible
- [ ] No horizontal scrolling

---

### 14. Browser Compatibility

**Test**: Chrome
- [ ] All features work
- [ ] No console errors

**Test**: Firefox
- [ ] All features work
- [ ] No console errors

**Test**: Safari
- [ ] All features work
- [ ] No console errors

**Test**: Edge
- [ ] All features work
- [ ] No console errors

---

### 15. Stripe Webhook Testing

**Test**: Subscription created webhook
1. [ ] Subscribe to plan
2. [ ] Check Render logs
3. [ ] Webhook received
4. [ ] Subscription created in database

**Test**: Payment succeeded webhook
1. [ ] Complete payment
2. [ ] Webhook received
3. [ ] Payment recorded

**Test**: Subscription cancelled webhook
1. [ ] Cancel subscription in Stripe Dashboard
2. [ ] Webhook received
3. [ ] Subscription status updated

---

## Critical Path Test (End-to-End)

**Complete User Journey:**

1. [ ] Visit homepage
2. [ ] Click "Start Your Journey"
3. [ ] Register account
4. [ ] Redirected to homepage (logged in)
5. [ ] Click "Book Foundation Session"
6. [ ] Complete Stripe payment
7. [ ] Session booked successfully
8. [ ] Go to "AI Coach"
9. [ ] Start conversation
10. [ ] AI responds appropriately
11. [ ] Log emotion
12. [ ] Create journal entry
13. [ ] Subscribe to Hybrid plan
14. [ ] Subscription active
15. [ ] Logout
16. [ ] Login again
17. [ ] All data persists
18. [ ] **SUCCESS!** 🎉

---

## Regression Testing

After any code changes, re-test:

- [ ] Authentication (login/register/logout)
- [ ] Session booking
- [ ] Subscription flow
- [ ] AI chat
- [ ] Database operations

---

## Performance Benchmarks

**Target Metrics:**
- Homepage load: < 2s
- API response: < 500ms
- AI response: < 5s
- Database query: < 100ms
- Uptime: > 99.9%

**Actual Metrics:**
- Homepage load: ___ seconds
- API response: ___ ms
- AI response: ___ seconds
- Database query: ___ ms
- Uptime: ___%

---

## Sign-Off

### Testing Complete:
- [ ] All critical tests passed
- [ ] No blocking bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Ready for production

**Tested by**: _______________  
**Date**: _______________  
**Approved for launch**: [ ] YES [ ] NO

---

**If all tests pass, platform is READY TO LAUNCH! 🚀**
