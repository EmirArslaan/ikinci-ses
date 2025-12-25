#!/usr/bin/env node

/**
 * Debug script to test verification code flow
 * Run with: node debug-verification.js
 */

const testEmail = "scripttest@example.com";

async function testVerificationFlow() {
    console.log("🧪 === VERIFICATION CODE DEBUG TEST ===\n");

    // Step 1: Send verification code
    console.log("Step 1: Sending verification code...");
    const sendResponse = await fetch("http://localhost:3000/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail })
    });

    const sendData = await sendResponse.json();
    console.log("Response:", sendData);

    if (!sendResponse.ok) {
        console.error("❌ Failed to send code");
        return;
    }

    console.log("✅ Code sent successfully\n");

    // Step 2: Check server logs
    console.log("⚠️  Check the server terminal logs for:");
    console.log("   - Generated code value");
    console.log("   - DB code value");
    console.log("   - Code types and lengths\n");

    console.log("Step 2: Enter the code from server logs:");
    console.log("   You should see logs like:");
    console.log("   🔑 === VERIFICATION CODE DEBUG ===");
    console.log("      Generated code: XXXXXX");
    console.log("      Stored in DB: XXXXXX\n");

    console.log("Then test registration with that code using:");
    console.log("   curl -X POST http://localhost:3000/api/auth/register \\");
    console.log("     -H \"Content-Type: application/json\" \\");
    console.log("     -d '{");
    console.log("       \"email\": \"" + testEmail + "\",");
    console.log("       \"name\": \"Test User\",");
    console.log("       \"password\": \"password123\",");
    console.log("       \"verificationCode\": \"PASTE_CODE_HERE\"");
    console.log("     }'\n");
}

testVerificationFlow().catch(console.error);
