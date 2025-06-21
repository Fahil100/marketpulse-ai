const express = require('express');
const goldAnalyzer = require('./goldAnalyzer');
const marketScanner = require('./marketScanner');
const sendTelegramAlert = require('./sendTelegramAlert');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ MarketPulse AI server is running.');
});

app.get('/scan', async (req, res) => {
  try {
    const opportunities = await marketScanner();

    if (opportunities.length > 0) {
      await sendTelegramAlert(opportunities);
      res.json({ message: 'Scan complete. Alerts sent.', data: opportunities });
    } else {
      res.json({ message: 'Scan complete. No opportunities found.' });
    }
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ message: 'Scan failed.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
