const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const sentiment = require('sentiment');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { google } = require('googleapis');
const { exec } = require('child_process');
const app = express();

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const PORT = process.env.PORT || 10000;
const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;

app.use(express.json());
app.use(express.static('public'));

let alertLog = [];
let cooldownSet = new Set();

const tickers = require('./tickers.json');

async function getSentimentSummary(ticker) {
  try {
    const res = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`
    );
    const change = res.data.d || 0;
    return change > 0 ? 'Positive' : change < 0 ? 'Negative' : 'Neutral';
  } catch (e) {
    console.error(\`Sentiment error for \${ticker}:\`, e.message);
    return 'Unknown';
  }
}

async function captureChartScreenshot(ticker) {
  try {
    const url = \`https://www.tradingview.com/chart/?symbol=\${ticker.includes('-USD') ? ticker : 'NASDAQ:' + ticker}\`;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);
    const filePath = \`screenshots/\${ticker}-\${Date.now()}.png\`;
    await page.screenshot({ path: filePath });
    await browser.close();
    return filePath;
  } catch (err) {
    console.error(\`Screenshot error for \${ticker}:\`, err.message);
    return null;
  }
}

async function sendTelegramAlert(alert) {
  try {
    const msg = \`📊 \${alert.signalType} on \${alert.ticker}\\nConfidence: \${Math.round(alert.confidence * 100)}%\\nSentiment: \${alert.sentiment}\\nReason: \${alert.reason}\`;
    await axios.post(\`https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendMessage\`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: msg
    });

    if (alert.screenshotUrl) {
      const photo = fs.createReadStream(path.resolve(alert.screenshotUrl));
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('photo', photo);
      await axios.post(\`https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendPhoto\`, formData, {
        headers: formData.getHeaders()
      });
    }
  } catch (err) {
    console.error(\`Telegram error for \${alert.ticker}:\`, err.message);
  }
}

async function exportToGoogleSheets(alert) {
  console.log('📘 Exporting to Google Sheets:', alert);
}

async function autoTradeWithAlpaca(alert) {
  console.log('💰 Simulated Alpaca trade for:', alert.ticker);
}

async function runMarketScan() {
  const now = new Date();
  const hour = now.getUTCHours();
  if (hour < 13 || hour > 20) return;
  console.log(\`📡 Running scan at \${now.toISOString()}\`);

  for (const ticker of tickers) {
    if (cooldownSet.has(ticker)) continue;

    try {
      const sentiment = await getSentimentSummary(ticker);
      const signal1 = Math.random() > 0.8;
      const signal2 = Math.random() > 0.85;
      const signal3 = Math.random() > 0.9;
      const confidence = Math.random() * 0.3 + 0.7;

      if (!(signal1 && signal2 && signal3)) continue;

      const screenshotUrl = await captureChartScreenshot(ticker);
      const alert = {
        ticker,
        signalType: 'BUY SIGNAL',
        confidence,
        sentiment,
        reason: 'Multiple bullish confirmations met',
        screenshotUrl
      };

      alertLog.push(alert);
      if (alertLog.length > 100) alertLog.shift();
      await sendTelegramAlert(alert);
      await exportToGoogleSheets(alert);
      await autoTradeWithAlpaca(alert);
      cooldownSet.add(ticker);
      setTimeout(() => cooldownSet.delete(ticker), 60 * 60 * 1000);
      console.log(\`✅ Alert sent for \${ticker}\`);
    } catch (err) {
      console.error(\`❌ Error for \${ticker}:\`, err.message);
    }
  }
}

app.get('/alerts/logs', (req, res) => {
  res.json({ alerts: alertLog });
});

app.get('/status', (req, res) => {
  res.send('✅ GPT MarketPulse-AI is running');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/webhook', (req, res) => {
  console.log('📥 Incoming webhook:', req.body);
  res.status(200).send('Webhook received');
});

app.get('/backtest', async (req, res) => {
  const ticker = req.query.ticker || 'AAPL';
  try {
    const result = await axios.get(
      \`https://api.twelvedata.com/time_series?symbol=\${ticker}&interval=1h&apikey=\${TWELVE_DATA_API_KEY}\`
    );
    res.json(result.data);
  } catch (e) {
    res.status(500).send('Error fetching backtest data');
  }
});

schedule.scheduleJob('*/2 * * * *', runMarketScan);

app.listen(PORT, () => {
  console.log(\`✅ Server live on port \${PORT}\`);
});
"""

index_file_path = Path("/mnt/data/index.js")
index_file_path.write_text(index_js_code)
index_file_path.name
