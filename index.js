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
    const goldResult = await goldAnalyzer();
    const stockResults = await marketScanner();
    const opportunities = [];

    if (goldResult?.signal === 'buy') {
      opportunities.push({ type: 'gold', message: goldResult.message });
    }

    if (Array.isArray(stockResults)) {
      stockResults.forEach(stock => {
        if (stock.signal === 'buy' || stock.signal === 'sell') {
          opportunities.push({
            type: 'stock',
            ticker: stock.ticker,
            message: stock.message,
          });
        }
      });
    }

    if (opportunities.length > 0) {
      await sendTelegramAlert(opportunities);
      return res.json({ message: 'Scan complete. Alerts sent.', data: opportunities });
    }

    res.json({ message: 'Scan complete. No opportunities found.' });
  } catch (error) {
    res.status(500).json({ message: 'Scan failed.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});