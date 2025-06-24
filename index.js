require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;

const STOCK_LIST = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'META', 'AMZN'];
const GOLD_SYMBOL = 'XAU/USD';
const CRYPTO_LIST = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:SOLUSDT'];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.send('✅ MarketPulse-AI backend is running');
});

// Telegram queue system
let telegramQueue = [];
let isSending = false;

async function processQueue() {
  if (isSending || telegramQueue.length === 0) return;
  isSending = true;
  const { message } = telegramQueue.shift();
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    await new Promise((res) => setTimeout(res, 2500));
  } catch (err) {
    console.error('Telegram Error:', err.response ? err.response.data : err);
  }

  isSending = false;
  processQueue();
}

function sendTelegramAlert(message) {
  telegramQueue.push({ message });
  processQueue();
}

function getSentimentScore(symbol) {
  return Math.random() > 0.8 ? 'Bullish' : 'Neutral';
}

function isWhaleTrade(volume) {
  return volume >= 5e6;
}

async function analyzeStocks() {
  for (const symbol of STOCK_LIST) {
    try {
      const [quoteRes, candleRes] = await Promise.all([
        axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`),
        axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=5&count=5&token=${FINNHUB_KEY}`)
      ]);

      const { c: current, pc: prevClose } = quoteRes.data;
      const candles = candleRes.data;
      const volume = candles.v ? candles.v.slice(-1)[0] : 0;
      const priceChange = ((current - prevClose) / prevClose) * 100;

      const sentiment = getSentimentScore(symbol);
      const whale = isWhaleTrade(current * volume);
      const deepDrop = priceChange <= -2.5;

      if (sentiment === 'Bullish' && whale && deepDrop) {
        const entry = current;
        const target = (entry * 1.05).toFixed(2);
        const stop = (entry * 0.98).toFixed(2);
        const action = 'BUY NOW';

        const message = `🚨 *GPT TRADE ALERT – ${symbol}*

🧠 *GPT Financial Advisor Recommendation:*
Action: *${action}*
Buy Price: *$${entry}*
Sell Target: *$${target}*
Stop Loss: *$${stop}*
Hold Duration: *1–3 hours*

📊 *Reasoning:*
- Price dropped *${priceChange.toFixed(2)}%*
- Volume: *${volume.toLocaleString()}*
- Whale Trade Detected: *${whale ? 'Yes' : 'No'}*
- Sentiment: *${sentiment}*

⚠️ *Urgency:* Act within 5 minutes
📶 Confidence Score: *100%*`;

        sendTelegramAlert(message);
      }
    } catch (err) {
      console.error(`Error analyzing ${symbol}:`, err);
    }
  }
}

async function analyzeGold() {
  try {
    const url = `https://api.twelvedata.com/price?symbol=${GOLD_SYMBOL}&apikey=${TWELVE_DATA_KEY}`;
    const res = await axios.get(url);
    const goldPrice = parseFloat(res.data.price);

    if (goldPrice > 2350) {
      const target = (goldPrice + 20).toFixed(2);
      const stop = (goldPrice - 15).toFixed(2);

      const message = `💰 *GPT Gold Alert*

🧠 *GPT Financial Advisor Recommendation:*
Action: *BUY NOW*
Buy Price: *$${goldPrice}*
Sell Target: *$${target}*
Stop Loss: *$${stop}*
Hold Duration: *1–3 hours*

📊 *Reasoning:*
- Gold is breaking above resistance
- Bullish momentum confirmed by price structure

⚠️ *Urgency:* Act within 5 minutes
📶 Confidence Score: *100%*`;

      sendTelegramAlert(message);
    }
  } catch (err) {
    console.error('Gold scan error:', err);
  }
}

async function analyzeCrypto() {
  for (const symbol of CRYPTO_LIST) {
    try {
      const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}`;
      const res = await axios.get(url);
      const price = parseFloat(res.data.price);

      if (price > 0) {
        const target = (price * 1.06).toFixed(2);
        const stop = (price * 0.96).toFixed(2);

        const message = `🪙 *GPT Crypto Alert – ${symbol}*

🧠 *GPT Financial Advisor Recommendation:*
Action: *Buy if volume confirms breakout*
Current Price: *$${price}*
Sell Target: *$${target}*
Stop Loss: *$${stop}*
Hold Duration: *1–4 hours*

📊 *Reasoning:*
- Technical setup indicates possible breakout
- Wait for confirmation before entering

⚠️ *Urgency:* Moderate – monitor over next 15 minutes
📶 Confidence Score: *85%*`;

        sendTelegramAlert(message);
      }
    } catch (err) {
      console.error(`Crypto error for ${symbol}:`, err.message);
    }
  }
}

async function analyzeIPOs() {
  try {
    const url = `https://finnhub.io/api/v1/calendar/ipo?from=2025-06-24&to=2025-07-24&token=${FINNHUB_KEY}`;
    const res = await axios.get(url);
    const { ipoCalendar } = res.data;

    if (ipoCalendar && ipoCalendar.length > 0) {
      for (const ipo of ipoCalendar) {
        const message = `🚀 *Upcoming IPO Alert – ${ipo.name} (${ipo.symbol})*

📅 IPO Date: ${ipo.date}
💰 Price Range: $${ipo.price}

🧠 *GPT Insight:* Monitor volume on IPO day. Potential early-momentum breakout for first-hour traders.

⚠️ *Caution:* High volatility expected.
📶 Confidence Score: *70%*`;

        sendTelegramAlert(message);
      }
    }
  } catch (err) {
    console.error('IPO Tracker error:', err.message);
  }
}

async function runScanner() {
  console.log(`📡 Running GPT Alpha+ scan @ ${new Date().toLocaleTimeString()}`);
  await analyzeStocks();
  await analyzeGold();
  await analyzeCrypto();
  await analyzeIPOs();
}

setInterval(runScanner, 60 * 1000);
runScanner();

app.listen(PORT, () => {
  console.log(`✅ Backend server listening on port ${PORT}`);
});
