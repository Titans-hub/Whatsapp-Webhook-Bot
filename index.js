const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
require('dotenv').config(); // Good practice for local dev

const app = express();
app.use(bodyParser.json());

// 1. ENVIRONMENT VARIABLES
// Render Dashboard -> Environment -> Add VERIFY_TOKEN = titans123
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "titans321";
const PORT = process.env.PORT || 10000;

// ---------------------------------------------------------
// 2. FIRESTORE SETUP (Ready for later)
// ---------------------------------------------------------
/*
// Instructions to enable Firestore later:
// 1. Go to Firebase Console -> Project Settings -> Service Accounts.
// 2. Generate New Private Key (downloads a JSON file).
// 3. Open that JSON, copy the entire content.
// 4. In Render: Add Environment Variable named FIREBASE_SERVICE_ACCOUNT
// 5. Paste the entire JSON string as the value.
*/

let db;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log("🔥 Firebase Admin Initialized!");
  } else {
    console.log("⚠️ No Firebase Credential found. Skipping DB init.");
  }
} catch (error) {
  console.error("Firebase Init Error:", error);
}

// ---------------------------------------------------------
// 3. WEBHOOK VERIFICATION (GET)
// ---------------------------------------------------------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Debug logs to see exactly what we got
  console.log(Incoming Verification: Mode='${mode}', Token='${token}');

  if (mode && token) {
    if (mode === "subscribe" && token.trim() === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK_VERIFIED");
      // IMPORTANT: Send back the challenge as a string explicitly
      res.status(200).send(challenge.toString());
    } else {
      console.log("❌ VERIFICATION_FAILED: Token mismatch");
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// ---------------------------------------------------------
// 4. HANDLE INCOMING MESSAGES (POST)
// ---------------------------------------------------------
app.post("/webhook", async (req, res) => {
  const body = req.body;

  // Log the entire body to understand structure
  console.log("📩 Message Received:", JSON.stringify(body, null, 2));

  // Check if this is an event from a WhatsApp API object
  if (body.object) {
    // Navigate through the complex JSON structure
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const messageDetails = body.entry[0].changes[0].value.messages[0];
      const senderPhone = messageDetails.from; // User's phone number
      const messageText = messageDetails.text ? messageDetails.text.body : null;
      const messageType = messageDetails.type;

      console.log(From: ${senderPhone}, Text: ${messageText});

      // --- FUTURE: FIRESTORE LOGIC HERE ---
      // if (db && messageText) {
      //   await db.collection('expenses').add({
      //     user: senderPhone,
      //     text: messageText,
      //     timestamp: admin.firestore.FieldValue.serverTimestamp()
      //   });
      // }
    }
    
    // Always return 200 OK to Meta, otherwise they will retry
    res.sendStatus(200);
  } else {
    // Return 404 if this is not a WhatsApp API event
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(🚀 Server is running on port ${PORT});
  console.log(Verify Token is set to: ${VERIFY_TOKEN});
});
