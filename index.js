const express = require("express");
const app = express();

const VERIFY_TOKEN = "my_verify_token_123"; 

app.use(express.json());

// Webhook verification
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// Receive WhatsApp Messages
app.post("/", (req, res) => {
  console.log("Incoming Message:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(10000, () => {
  console.log("WhatsApp webhook running on port 10000");
});
