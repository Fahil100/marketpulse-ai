const express = require('express');
const goldAnalyzer = require('./goldanalyzer');
const marketScanner = require('./marketscanner');
const sendTelegramAlert = require('./sendtelegramalert');

const app = express();
const PORT = process.env.PORT || 3000;

// Root route for health check
app.get('/', (req, res) => {
  res.send('✅ MarketPulse-AI server is live and running.');
});

// /scan route to analyze markets and send alerts
app.get('/scan', async (req, res) => {
  try {
    const goldResult = await goldAnalyzer();
    const stockResults = await marketScanner();

    const alerts = [];

    if (goldResult && goldResult.signal === 'buy') {
      alerts.push(`🟡 Gold Alert: ${goldResult.message}`);
    }

    if (stockResults && Array.isArray(stockResults)) {
      stockResults.forEach(stock => {
        if (stock.signal === 'buy' || stock.signal === 'sell') {
          alerts.push(`📈 ${stock.ticker} Alert: ${stock.message}`);
        }
      });
    }

    // Send alerts to Telegram
    for (const alert of alerts) {
      await sendTelegramAlert(alert);
    }

    res.status(200).json({
      status: 'success',
      alertsSent: alerts.length,
      details: alerts,
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Scan failed',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});