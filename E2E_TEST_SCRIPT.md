# End-to-End Test Script

**Platform**: Purposeful Live Coaching  
**Branch**: remove-manus-dependencies  
**Purpose**: Verify complete user journey works

---

## Test Environment

**URL**: https://purposeful-individual.onrender.com  
**Test User**: test@example.com  
**Test Password**: testpassword123

---

## Test 1: Homepage & Navigation

### Steps:
1. Open https://purposeful-individual.onrender.com
2. Verify homepage loads
3. Check console for errors (F12)
4. Verify all images load
5. Verify navigation menu works

### Expected Results:
- ✅ Page loads in < 3 seconds
- ✅ No console errors
- ✅ All images visible
- ✅ Navigation clickable

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 2: Registration Flow

### Steps:
1. Click "Start Your Journey" button
2. Should redirect to `/login`
3. Click "Don't have an account? Sign up"
4. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: testpassword123
5. Click "Create Account"

### Expected Results:
- ✅ Redirects to `/login` (NOT #oauth-not-configured)
- ✅ Registration form appears
- ✅ Form validates input
- ✅ Account created successfully
- ✅ Redirects to homepage (logged in)
- ✅ User name shows in header

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 3: Login Flow

### Steps:
1. Logout (if logged in)
2. Go to `/login`
3. Enter:
   - Email: test@example.com
   - Password: testpassword123
4. Click "Sign In"

### Expected Results:
- ✅ Login successful
- ✅ Redirects to homepage
- ✅ User name shows
- ✅ Session persists on refresh

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 4: Session Booking (Pay-per-session)

### Steps:
1. Login
2. Go to homepage
3. Scroll to "Affordable Coaching Plans" section
4. Click "Book Foundation Session" ($49)
5. Should redirect to `/book-session`
6. Select session type
7. Select date
8. Select time slot
9. Add notes (optional)
10. Click "Book Session"
11. Should redirect to Stripe Checkout
12. Enter test card: 4242 4242 4242 4242
13. Expiry: 12/25
14. CVC: 123
15. ZIP: 12345
16. Click "Pay"

### Expected Results:
- ✅ Redirects to `/book-session`
- ✅ Session types load
- ✅ Calendar shows available dates
- ✅ Time slots appear
- ✅ Redirects to Stripe
- ✅ Stripe shows correct price ($49)
- ✅ Payment processes
- ✅ Redirects back to platform
- ✅ Booking confirmation shows
- ✅ Session appears in database

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 5: AI Subscription (Monthly)

### Steps:
1. Login
2. Scroll to "24/7 AI Coaching Subscriptions" section
3. Click "Start AI Essential" ($49/month)
4. Should redirect to Stripe Checkout
5. Enter test card: 4242 4242 4242 4242
6. Complete subscription

### Expected Results:
- ✅ Redirects to Stripe
- ✅ Shows $49/month recurring
- ✅ Payment processes
- ✅ Redirects back
- ✅ Subscription status "Active"
- ✅ Subscription in database

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 6: AI Coach Conversation

### Steps:
1. Login
2. Go to "AI Coach" page
3. Start new conversation
4. Type: "I'm feeling anxious about work"
5. Click send
6. Wait for AI response

### Expected Results:
- ✅ Conversation interface loads
- ✅ Message sends
- ✅ AI responds within 5 seconds
- ✅ Response is relevant
- ✅ Can continue conversation
- ✅ Messages saved in database

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 7: Emotion Tracking

### Steps:
1. Login
2. Go to "Emotion Tracker"
3. Select emotion: "Anxious"
4. Set intensity: 7/10
5. Add trigger: "Work deadline"
6. Click "Log Emotion"

### Expected Results:
- ✅ Emotion tracker loads
- ✅ Can select emotion
- ✅ Can set intensity
- ✅ Can add trigger
- ✅ Emotion logged successfully
- ✅ Emotion in database

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 8: Journaling

### Steps:
1. Login
2. Go to "Journal"
3. Click "New Entry"
4. Write: "Today was challenging but I'm making progress"
5. Select mood: "Reflective"
6. Click "Save"

### Expected Results:
- ✅ Journal page loads
- ✅ Can create entry
- ✅ Entry saves
- ✅ Entry appears in list
- ✅ Entry in database

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 9: Logout

### Steps:
1. Click logout button
2. Verify redirected to homepage
3. Verify logged out state
4. Try to access protected page

### Expected Results:
- ✅ Logout successful
- ✅ Redirects to homepage
- ✅ User name removed from header
- ✅ Protected pages redirect to login

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 10: Mobile Responsiveness

### Steps:
1. Open on mobile device (or resize browser to mobile width)
2. Test all above flows on mobile

### Expected Results:
- ✅ Homepage responsive
- ✅ Login form usable
- ✅ Booking flow works
- ✅ AI chat usable
- ✅ All buttons tappable

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 11: Browser Compatibility

### Browsers to Test:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Expected Results:
- ✅ All features work in all browsers
- ✅ No console errors
- ✅ Consistent UI

### Actual Results:
- Chrome: [ ] PASS [ ] FAIL
- Firefox: [ ] PASS [ ] FAIL
- Safari: [ ] PASS [ ] FAIL
- Edge: [ ] PASS [ ] FAIL

---

## Test 12: Error Handling

### Test 12a: Invalid Email
1. Try to register with "notanemail"
2. Should show validation error

### Test 12b: Wrong Password
1. Try to login with wrong password
2. Should show "Invalid email or password"

### Test 12c: Duplicate Email
1. Try to register with existing email
2. Should show "Email already registered"

### Expected Results:
- ✅ All validation errors show correctly
- ✅ No crashes
- ✅ User-friendly error messages

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 13: Database Verification

### After completing all tests, verify in database:

```sql
-- Check users table
SELECT * FROM users WHERE email = 'test@example.com';

-- Check auth_sessions table
SELECT * FROM auth_sessions WHERE user_id = [user_id];

-- Check sessions table (coaching sessions)
SELECT * FROM sessions WHERE client_id = [client_id];

-- Check subscriptions table
SELECT * FROM subscriptions WHERE user_id = [user_id];

-- Check ai_chat_conversations table
SELECT * FROM ai_chat_conversations WHERE client_id = [client_id];

-- Check emotion_logs table
SELECT * FROM emotion_logs WHERE client_id = [client_id];

-- Check journal_entries table
SELECT * FROM journal_entries WHERE client_id = [client_id];
```

### Expected Results:
- ✅ User record exists
- ✅ Auth session exists
- ✅ Session booking recorded
- ✅ Subscription recorded
- ✅ AI conversation saved
- ✅ Emotion log saved
- ✅ Journal entry saved

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 14: Stripe Webhook Verification

### Steps:
1. Check Stripe Dashboard → Developers → Webhooks
2. View recent deliveries
3. Verify events received:
   - checkout.session.completed
   - customer.subscription.created
   - invoice.payment_succeeded

### Expected Results:
- ✅ All webhooks delivered successfully
- ✅ No errors in Stripe logs
- ✅ Database updated correctly

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Test 15: Performance Benchmarks

### Metrics to Measure:
- Homepage load time: _____ seconds (target: < 2s)
- Login page load: _____ seconds (target: < 1s)
- AI response time: _____ seconds (target: < 5s)
- Stripe redirect: _____ seconds (target: < 2s)

### Expected Results:
- ✅ All metrics within targets
- ✅ No slow queries
- ✅ No memory leaks

### Actual Results:
- [ ] PASS
- [ ] FAIL: _______________

---

## Critical Path Summary

**Complete User Journey** (must all pass):

1. [ ] Visit homepage
2. [ ] Click "Start Your Journey"
3. [ ] Register account
4. [ ] Login persists
5. [ ] Book session
6. [ ] Complete payment
7. [ ] Subscribe to AI plan
8. [ ] Start AI conversation
9. [ ] Log emotion
10. [ ] Create journal entry
11. [ ] Logout
12. [ ] Login again
13. [ ] All data persists

**Overall Result**: [ ] PASS [ ] FAIL

---

## Blocker Issues

List any blocking issues that prevent launch:

1. _______________
2. _______________
3. _______________

---

## Non-Blocking Issues

List minor issues that can be fixed post-launch:

1. _______________
2. _______________
3. _______________

---

## Sign-Off

**Tested by**: _______________  
**Date**: _______________  
**Platform Status**: [ ] READY TO LAUNCH [ ] NOT READY

**Notes**:
_______________
_______________
_______________

---

## Next Steps

If all tests PASS:
1. ✅ Switch Stripe to live mode
2. ✅ Configure DNS
3. ✅ Test with real card (small amount)
4. ✅ Refund test transaction
5. 🚀 **GO LIVE!**

If any tests FAIL:
1. Document failures
2. Fix issues
3. Re-run tests
4. Repeat until all pass
