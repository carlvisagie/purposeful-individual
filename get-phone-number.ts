/**
 * Fetch Phone Number Details from Vapi
 */

import { VapiClient } from "@vapi-ai/server-sdk";

const VAPI_API_KEY = "29b4237e-7f4c-44e5-a670-a52fdf3b7f51";
const PHONE_NUMBER_ID = "9942a4fb-96a1-4886-96f6-54db382078d6";

const vapi = new VapiClient({
  token: VAPI_API_KEY,
});

async function getPhoneNumber() {
  console.log("📞 Fetching phone number details...\n");

  try {
    // Get phone number by ID
    const phoneNumber = await vapi.phoneNumbers.get(PHONE_NUMBER_ID);

    console.log("✅ Phone Number Found!\n");
    console.log("=" .repeat(60));
    console.log("\n📞 YOUR 24/7 AI COACHING PHONE NUMBER:\n");
    console.log(`   ${JSON.stringify(phoneNumber, null, 2)}`);
    console.log("\n" + "=".repeat(60));

  } catch (error: any) {
    console.error("❌ Error fetching phone number:");
    console.error(error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    
    // Try listing all phone numbers instead
    console.log("\n📋 Trying to list all phone numbers...\n");
    try {
      const phoneNumbers = await vapi.phoneNumbers.list();
      console.log("Phone Numbers:", JSON.stringify(phoneNumbers, null, 2));
    } catch (listError: any) {
      console.error("Failed to list phone numbers:", listError.message);
    }
  }
}

// Run
getPhoneNumber();
