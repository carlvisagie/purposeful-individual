/**
 * Setup Script for Vapi AI Phone Line
 * Run this to create the AI assistant and get a phone number
 */

import { VapiClient } from "@vapi-ai/server-sdk";

const VAPI_API_KEY = "29b4237e-7f4c-44e5-a670-a52fdf3b7f51";

const vapi = new VapiClient({
  token: VAPI_API_KEY,
});

const COACH_SYSTEM_PROMPT = `You are a compassionate AI coach for Purposeful Live Coaching, providing 24/7 voice support for families navigating autism intervention and wellness challenges. You specialize in evidence-based protocols from leading scientists including Dr. Andrew Huberman, Dr. Peter Attia, Dr. Matthew Walker, and autism intervention specialists.

## Your Core Mission
Provide immediate, empathetic support to parents and caregivers who are often exhausted, overwhelmed, and seeking guidance. You are their lifeline during difficult moments, offering both emotional support and practical, science-backed strategies.

## Communication Style
- Warm and compassionate, like talking to a caring friend
- Patient and understanding, never rushed
- Calm and reassuring, especially during crises
- Professional but approachable
- Use natural conversational language, not clinical jargon

## Key Behaviors
- Listen actively and validate emotions first
- Ask clarifying questions to understand the full situation
- Provide specific, actionable guidance based on evidence
- Celebrate wins and progress, no matter how small
- Show genuine care and concern
- Remember and reference previous conversations when available

## Crisis Detection
If you detect:
- Suicidal ideation or self-harm
- Child safety concerns
- Severe parental distress
- Medical emergencies
- Abuse or neglect

Respond with: "I'm really concerned about what you just shared. This sounds like a situation where you need immediate professional support. If this is an emergency, please call 911 or the crisis hotline at 988. I'd also like to have a human coach from our team reach out to you as soon as possible. Can you provide your contact information?"

## Evidence-Based Knowledge Areas
- Autism intervention (ABA, sensory integration, communication)
- Sleep optimization (Huberman/Walker protocols)
- Nutrition and supplements
- Stress management and mental health
- Behavioral protocols
- Family wellness strategies

Always provide compassionate, evidence-based guidance while maintaining appropriate boundaries.`;

const FIRST_MESSAGE = "Hi! This is your Purposeful AI coach. I'm here to support you 24/7 with evidence-based guidance for autism intervention and family wellness. How can I help you today?";

async function setupVapiPhone() {
  console.log("🚀 Setting up Vapi AI Phone Line...\n");

  try {
    // Step 1: Create AI Assistant
    console.log("Step 1: Creating AI Assistant...");
    const assistant = await vapi.assistants.create({
      name: "Purposeful AI Coach",
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.7,
        systemPrompt: COACH_SYSTEM_PROMPT,
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - warm, friendly female voice
      },
      firstMessage: FIRST_MESSAGE,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en",
      },
      recordingEnabled: true,
    });

    console.log("✅ Assistant created!");
    console.log(`   ID: ${assistant.id}`);
    console.log(`   Name: ${assistant.name}\n`);

    // Step 2: Create Phone Number
    console.log("Step 2: Creating Phone Number...");
    const phoneNumber = await vapi.phoneNumbers.create({
      provider: "vapi",
      assistantId: assistant.id, // Direct field, not nested!
    });

    console.log("✅ Phone number created!");
    console.log(`   Number: ${phoneNumber.number}`);
    console.log(`   ID: ${phoneNumber.id}\n`);

    // Success!
    console.log("🎉 SUCCESS! Your 24/7 AI Phone Line is Ready!\n");
    console.log("=" .repeat(60));
    console.log("\n📞 PHONE NUMBER FOR CLIENTS:\n");
    console.log(`   ${phoneNumber.number}`);
    console.log("\n" + "=".repeat(60));
    console.log("\n✅ What's Working:");
    console.log("   - Clients can call this number 24/7");
    console.log("   - AI coach answers immediately");
    console.log("   - Natural voice conversations");
    console.log("   - Calls are recorded and transcribed");
    console.log("   - Crisis detection active");
    console.log("\n📋 Next Steps:");
    console.log("   1. Test the phone line by calling it");
    console.log("   2. Share the number with your clients");
    console.log("   3. Monitor calls in Vapi dashboard");
    console.log("   4. Review transcripts and analytics");
    console.log("\n💰 Cost:");
    console.log("   - ~$0.05-0.10 per minute");
    console.log("   - 30-min call = $1.50-3.00");
    console.log("   - Charge clients $29/month unlimited = Profitable!");
    console.log("\n🎯 Vapi Dashboard:");
    console.log("   https://dashboard.vapi.ai");
    console.log("\n");

  } catch (error: any) {
    console.error("❌ Error setting up Vapi phone line:");
    console.error(error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run setup
setupVapiPhone();
