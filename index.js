const express = require('express');
const sendTelegramAlert = require('./sendTelegramAlert');
require('./marketScanner'); // This runs the market scanner automatically

const app = express();
const port = process.env.PORT || 10000;

// Root endpoint for health check
app.get('/', (req, res) => {
  res.send('✅ MarketPulse-AI server is live and scanning every 30 seconds.');
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 MarketPulse-AI server running on port ${port}`);
});
