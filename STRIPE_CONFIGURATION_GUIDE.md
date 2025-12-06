# Stripe Configuration Guide

**Platform**: Purposeful Live Coaching  
**Revenue Model**: Subscription-based + Pay-per-session  
**Date**: December 6, 2025

---

## Overview

The platform uses Stripe for:
1. **Subscriptions** - Monthly/yearly recurring revenue (AI-Only, Hybrid, Premium tiers)
2. **Session Payments** - One-time payments for individual coaching sessions
3. **Discount Codes** - Promotional pricing
4. **Webhooks** - Automated subscription management

---

## Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Sign up"
3. Complete business verification
4. Enable test mode for initial setup

---

## Step 2: Create Subscription Products

### Product 1: AI-Only Coaching

**Monthly Plan:**
- Name: "AI-Only Coaching - Monthly"
- Price: $29/month
- Billing: Recurring monthly
- Description: "24/7 AI coaching with unlimited conversations"

**Yearly Plan:**
- Name: "AI-Only Coaching - Yearly"
- Price: $297/year ($24.75/month - 15% savings)
- Billing: Recurring yearly
- Description: "24/7 AI coaching with unlimited conversations - Save 15%"

**Features to highlight:**
- Unlimited AI coaching conversations
- Emotion tracking and insights
- Journaling tools
- Progress analytics

---

### Product 2: Hybrid Coaching

**Monthly Plan:**
- Name: "Hybrid Coaching - Monthly"
- Price: $149/month
- Billing: Recurring monthly
- Description: "AI coaching + 2 human coaching sessions per month"

**Yearly Plan:**
- Name: "Hybrid Coaching - Yearly"
- Price: $1,527/year ($127.25/month - 15% savings)
- Billing: Recurring yearly
- Description: "AI coaching + 2 human sessions/month - Save 15%"

**Features to highlight:**
- Everything in AI-Only
- 2 live video coaching sessions per month
- Priority scheduling
- Personalized coaching plans

---

### Product 3: Premium Coaching

**Monthly Plan:**
- Name: "Premium Coaching - Monthly"
- Price: $299/month
- Billing: Recurring monthly
- Description: "Full-service coaching with unlimited AI + 4 human sessions"

**Yearly Plan:**
- Name: "Premium Coaching - Yearly"
- Price: $3,059/year ($254.92/month - 15% savings)
- Billing: Recurring yearly
- Description: "Full-service coaching - Save 15%"

**Features to highlight:**
- Everything in Hybrid
- 4 live video coaching sessions per month
- VIP priority support
- Custom coaching roadmap
- Direct coach messaging

---

## Step 3: Create À La Carte Session Products

### Foundation Session (First-time clients)
- Name: "Foundation Coaching Session"
- Price: $97
- Type: One-time payment
- Duration: 60 minutes
- Description: "Your first coaching session - goal setting and assessment"

### Standard Session
- Name: "Standard Coaching Session"
- Price: $147
- Type: One-time payment
- Duration: 60 minutes
- Description: "One-on-one video coaching session"

### Extended Session
- Name: "Extended Coaching Session"
- Price: $247
- Type: One-time payment
- Duration: 90 minutes
- Description: "Deep-dive coaching session for complex challenges"

---

## Step 4: Get API Keys

### Test Mode (for development):
1. Go to Stripe Dashboard → Developers → API Keys
2. Copy:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Live Mode (for production):
1. Switch to Live mode in Stripe Dashboard
2. Copy:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

---

## Step 5: Configure Webhooks

### Create Webhook Endpoint:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://purposeful-individual.onrender.com/api/stripe/webhook`
4. **Events to listen to**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Webhook signing secret**: `whsec_...`

---

## Step 6: Add Environment Variables to Render

Go to Render Dashboard → purposeful-individual service → Environment

### Add these variables:

```bash
# Stripe Keys (Use test keys first, then switch to live)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (get these from Stripe Dashboard after creating products)
STRIPE_PRICE_AI_MONTHLY=price_...
STRIPE_PRICE_AI_YEARLY=price_...
STRIPE_PRICE_HYBRID_MONTHLY=price_...
STRIPE_PRICE_HYBRID_YEARLY=price_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...

# Session Prices (in cents)
PRICE_FOUNDATION_SESSION=9700
PRICE_STANDARD_SESSION=14700
PRICE_EXTENDED_SESSION=24700
```

---

## Step 7: Update Code with Price IDs

After creating products in Stripe, you'll get Price IDs like `price_1234...`

Update `/server/routers/stripe.ts`:

```typescript
const PRICE_IDS = {
  ai_monthly: process.env.STRIPE_PRICE_AI_MONTHLY!,
  ai_yearly: process.env.STRIPE_PRICE_AI_YEARLY!,
  hybrid_monthly: process.env.STRIPE_PRICE_HYBRID_MONTHLY!,
  hybrid_yearly: process.env.STRIPE_PRICE_HYBRID_YEARLY!,
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY!,
};
```

---

## Step 8: Test Subscription Flow

### Test Cards (Stripe Test Mode):
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Test Flow:
1. Visit https://purposeful-individual.onrender.com
2. Click "Start Your Journey"
3. Register account
4. Select "Hybrid Coaching - Monthly"
5. Click "Subscribe"
6. Should redirect to Stripe Checkout
7. Enter test card: 4242 4242 4242 4242
8. Expiry: Any future date (e.g., 12/25)
9. CVC: Any 3 digits (e.g., 123)
10. ZIP: Any 5 digits (e.g., 12345)
11. Click "Subscribe"
12. Should redirect back to platform
13. Verify subscription is active in database

---

## Step 9: Verify Webhook Processing

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Check "Recent deliveries"
4. Should see events like:
   - `checkout.session.completed` ✅
   - `customer.subscription.created` ✅
   - `invoice.payment_succeeded` ✅

If any fail:
- Check Render logs for errors
- Verify webhook secret is correct
- Ensure endpoint URL is accessible

---

## Step 10: Switch to Live Mode

Once testing is complete:

1. **Create live products** in Stripe (same as test mode)
2. **Get live API keys** from Stripe Dashboard
3. **Create live webhook** endpoint
4. **Update Render environment variables**:
   - Change `sk_test_...` to `sk_live_...`
   - Change `pk_test_...` to `pk_live_...`
   - Change `whsec_test_...` to `whsec_live_...`
   - Update all price IDs to live versions
5. **Redeploy** service in Render
6. **Test with real card** (small amount)
7. **Refund test transaction**
8. **Go live!**

---

## Revenue Projections

### Conservative (10 clients/month):
- 5 AI-Only ($29) = $145/month
- 3 Hybrid ($149) = $447/month
- 2 Premium ($299) = $598/month
- **Total MRR**: $1,190/month ($14,280/year)

### Moderate (50 clients/month):
- 25 AI-Only = $725/month
- 15 Hybrid = $2,235/month
- 10 Premium = $2,990/month
- **Total MRR**: $5,950/month ($71,400/year)

### Aggressive (200 clients/month):
- 100 AI-Only = $2,900/month
- 60 Hybrid = $8,940/month
- 40 Premium = $11,960/month
- **Total MRR**: $23,800/month ($285,600/year)

---

## Discount Codes

### Create in Stripe Dashboard:

**Launch Special:**
- Code: `LAUNCH50`
- Discount: 50% off first month
- Max uses: 100
- Expires: 30 days from launch

**Referral Bonus:**
- Code: `REFER25`
- Discount: 25% off first 3 months
- Max uses: Unlimited
- Expires: Never

**Annual Saver:**
- Code: `ANNUAL20`
- Discount: Additional 20% off yearly plans
- Max uses: Unlimited
- Expires: Never

---

## Troubleshooting

### Error: "No such price"
**Fix**: Price ID is incorrect. Check Stripe Dashboard → Products → Prices

### Error: "Invalid API key"
**Fix**: API key is wrong or expired. Get new key from Stripe Dashboard

### Webhook not firing
**Fix**: 
1. Check endpoint URL is correct
2. Verify webhook secret matches
3. Check Render logs for errors
4. Test webhook in Stripe Dashboard

### Payment succeeds but subscription not created
**Fix**: Check webhook processing code in `server/routers/stripe.ts`

---

## Next Steps

1. ✅ Create Stripe account
2. ✅ Create products and prices
3. ✅ Get API keys
4. ✅ Configure webhooks
5. ✅ Add environment variables to Render
6. ✅ Test subscription flow
7. ✅ Verify webhooks work
8. ✅ Switch to live mode
9. 🚀 **START GENERATING REVENUE!**

---

**Stripe is now configured and ready to process payments!**
