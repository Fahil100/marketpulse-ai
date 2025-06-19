const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual bot token and chat ID
const TELEGRAM_BOT_TOKEN = "7697144054:AAE-LA8yLnEUUpAVML-8g-mL1NAQBIPKZuU";
const TELEGRAM_CHAT_ID = "-1002890614666";

app.get("/", (req, res) => {
  res.send("MarketPulse AI is running.");
});

app.get("/alert", async (req, res) => {
  const message = req.query.message || "🔥 Market Alert!";
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    });
    res.send("Alert sent!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send alert");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
