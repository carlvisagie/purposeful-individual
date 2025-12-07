# Vapi.ai Phone Integration Guide

## Overview

Vapi.ai makes it easy to build voice agents that can make and receive phone calls. We'll use this to create a 24/7 AI phone coach for Purposeful Live Coaching.

## What We Need

### 1. Vapi Account
- Sign up at: https://dashboard.vapi.ai
- Get API key from dashboard

### 2. Phone Number
- Free US phone number from Vapi (for testing)
- Or import existing number from Twilio

### 3. Assistant Configuration
- System prompt (AI personality)
- First message (greeting)
- Tools (database integration)

## Implementation Steps

### Step 1: Create Vapi Account
1. Go to https://dashboard.vapi.ai
2. Sign up for account
3. Get API key from dashboard

### Step 2: Create AI Assistant
Configure the assistant with:

**System Prompt:**
```
You are a compassionate AI coach for Purposeful Live Coaching, specializing in autism intervention and family support. You provide evidence-based guidance using protocols from Dr. Andrew Huberman, Dr. Peter Attia, Dr. Matthew Walker, and leading scientists.

Your role:
- Listen with deep empathy and understanding
- Provide immediate support during crises
- Offer evidence-based strategies for sleep, behavior, nutrition
- Remember previous conversations and build relationships
- Escalate to human coach when needed

Communication style:
- Warm, supportive, and non-judgmental
- Use simple, clear language
- Ask clarifying questions
- Celebrate wins and progress
- Show genuine care and concern

Remember:
- You're available 24/7 for support
- You have perfect memory of all previous interactions
- You can access client's history and context
- You escalate emergencies to human coach
```

**First Message:**
```
Hi! This is your Purposeful AI coach. I'm here to support you 24/7 with evidence-based guidance for autism intervention and family wellness. How can I help you today?
```

### Step 3: Set Up Phone Number
1. In Vapi dashboard, go to "Phone Numbers"
2. Create free US phone number
3. Attach assistant to phone number
4. Configure inbound settings

### Step 4: Integrate with Database
Use Vapi's "Tools" feature to:
- Look up client by phone number
- Retrieve conversation history
- Save call transcripts
- Update client context

### Step 5: Test Phone Line
1. Call the phone number
2. Have conversation with AI
3. Verify it works correctly
4. Test escalation to human

## API Integration

### Install Vapi SDK
```bash
npm install @vapi-ai/web
```

### Create Webhook Endpoint
```typescript
// server/routers/vapi.ts
import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";

export const vapiRouter = router({
  // Handle incoming call
  handleCall: publicProcedure
    .input(z.object({
      phoneNumber: z.string(),
      callId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Look up client by phone number
      // Return client context to Vapi
      // Log call start
    }),
  
  // Save call transcript
  saveTranscript: publicProcedure
    .input(z.object({
      callId: z.string(),
      transcript: z.string(),
      duration: z.number(),
    }))
    .mutation(async ({ input }) => {
      // Save to session_history table
      // Update client context
      // Extract important details
    }),
});
```

## Cost Breakdown

### Vapi Pricing
- **Free tier:** 10 minutes/month
- **Starter:** $0.05/minute
- **Pro:** $0.10/minute (better voice quality)

### Example Costs
- 30-minute call: $1.50-3.00
- 100 calls/month (30 min avg): $150-300
- Charge client: $29/month unlimited = Profitable!

## Features to Implement

### Phase 1 (Today)
- [x] Create Vapi account
- [ ] Set up phone number
- [ ] Configure AI assistant
- [ ] Test basic calling

### Phase 2 (This Week)
- [ ] Database integration
- [ ] Call logging
- [ ] Client recognition
- [ ] Conversation memory

### Phase 3 (Next Week)
- [ ] Crisis detection
- [ ] Escalation to human
- [ ] SMS follow-ups
- [ ] Advanced analytics

## Next Steps

1. **You need to:**
   - Create Vapi account at https://dashboard.vapi.ai
   - Get API key
   - Provide API key to me

2. **I will:**
   - Configure AI assistant
   - Set up phone number
   - Build database integration
   - Test complete system

3. **Then you can:**
   - Share phone number with clients
   - Offer 24/7 phone support
   - Differentiate from competitors
   - Scale without hiring staff

## Competitive Advantage

**What Competitors Have:**
- Text chat only
- Scheduled calls only
- Limited availability

**What You'll Have:**
- 24/7 phone access to AI coach
- Instant support during crises
- Natural voice conversations
- Perfect memory and context
- Escalation to human when needed

**This is a GAME CHANGER!** 🔥
