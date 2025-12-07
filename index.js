const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "titans321";
const PORT = process.env.PORT || 10000;

// Firebase – fine if env not set
let db;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("🔥 Firebase Admin Initialized!");
  } else {
    console.log("⚠️ No Firebase Credential found. Skipping DB init.");
  }
} catch (error) {
  console.error("Firebase Init Error:", error);
}

// GET /webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log(Incoming Verification: Mode='${mode}', Token='${token}');

  if (mode && token) {
    if (mode === "subscribe" && token.trim() === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK_VERIFIED");
      return res.status(200).send(challenge.toString());
    } else {
      console.log("❌ VERIFICATION_FAILED: Token mismatch");
      return res.sendStatus(403);
    }
  } else {
    return res.sendStatus(400);
  }
});

// POST /webhook
app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("📩 Message Received:", JSON.stringify(body, null, 2));

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const messageDetails = body.entry[0].changes[0].value.messages[0];
      const senderPhone = messageDetails.from;
      const messageText = messageDetails.text
        ? messageDetails.text.body
        : null;

      console.log(From: ${senderPhone}, Text: ${messageText});
    }
    return res.sendStatus(200);
  } else {
    return res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(🚀 Server is running on port ${PORT});
  console.log(Verify Token is set to: ${VERIFY_TOKEN});
});
