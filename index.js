const express = require("express");
const app = express();

const VERIFY_TOKEN = "titans321"; // WhatsApp dashboard la idhe type pannunga

app.use(express.json());

// GET - webhook verification + test
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("GET / webhook hit. Query:", req.query);
  console.log("SERVER VERIFY_TOKEN:", "${VERIFY_TOKEN}");
  console.log("TOKEN FROM META:", "${token}");

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
  return res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("WhatsApp webhook running on port " + PORT);
});
