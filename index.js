const express = require('express');
const sendTelegramAlert = require('./sendTelegramAlert');

const app = express();
const port = process.env.PORT || 10000;

// Root route for testing Telegram
app.get('/', async (req, res) => {
  const testMessage = `
🚨 TEST ALERT: Telegram is working perfectly.
This is just a test to confirm the system is live and alerts are flowing. ✅
  `;

  try {
    await sendTelegramAlert(testMessage);
    res.send('✅ Telegram test alert sent.');
  } catch (error) {
    console.error('❌ Error sending alert:', error.message);
    res.status(500).send('❌ Failed to send Telegram alert.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 MarketPulse-AI server running on port ${port}`);
});
