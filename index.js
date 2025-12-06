const express = require("express");
const app = express();

const VERIFY_TOKEN = "titans123"; // same as WhatsApp dashboard

app.use(express.json());

// GET - webhook verification + test
app.get("/", (req, res) => {
  console.log("GET / webhook hit. Query:", req.query);

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED OK");
    return res.status(200).send(challenge);
  }

  console.log("WEBHOOK VERIFY FAILED");
  return res.sendStatus(403);
});

// POST - incoming WhatsApp messages
app.post("/", (req, res) => {
  console.log("POST / webhook hit. Incoming Message:");
  console.log(JSON.stringify(req.body, null, 2));

  // Always reply 200 fast
  return res.sendStatus(200);
});

// IMPORTANT: use Render's PORT
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("WhatsApp webhook running on port" + PORT);
});
