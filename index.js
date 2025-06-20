const express = require('express');
const sendTelegramAlert = require('./sendTelegramAlert');

const app = express();
const port = process.env.PORT || 10000;

app.get('/', async (req, res) => {
  const message = `
🚨 LIVE TEST ALERT #2

Ticker: $RECHECK
Movement: +5.5%
RSI: 30 (Reversal Watch)
Volume Spike: 🔥
News: “Recheck test from GPT system”

🛒 BUY SIGNAL
🎯 Target: +10% profit
⏱ Timeframe: 1–2 days
`;

  try {
    await sendTelegramAlert(message);
    console.log("✅ Alert sent to Telegram successfully.");
    res.send('✅ LIVE TEST ALERT #2 sent to Telegram.');
  } catch (err) {
    console.error("❌ Telegram failed:", err.message);
    res.status(500).send('❌ Telegram failed to send.');
  }
});

app.listen(port, () => {
  console.log(`🚀 MarketPulse-AI server running on port ${port}`);
});
