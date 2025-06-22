require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// === Load environment variables ===
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// === Initialize Telegram Bot ===
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// === Utility: Send Telegram alert ===
const sendAlert = async (message) => {
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log("📨 Alert sent.");
  } catch (err) {
    console.error("❌ Failed to send Telegram message:", err.message);
  }
};

// === Utility: Get Stock Data from Alpha Vantage ===
const getStockData = async (symbol) => {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${ALPHA_VANTAGE_KEY}`;
    const res = await axios.get(url);
    const data = res.data['Time Series (5min)'];
    if (!data) throw new Error("No time series returned");
    return Object.entries(data).map(([time, values]) => ({
      time,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseFloat(values['5. volume'])
    }));
  } catch (err) {
    console.error("❌ Failed to fetch stock data:", err.message);
    return [];
  }
};

// === Simulate Short Interest Data ===
const getShortInterest = (symbol) => {
  return Math.random() * 30; // % short float mock
};

// === Simulate Unusual Options Volume ===
const getOptionsVolumeSpike = (symbol) => {
  return Math.random() > 0.85; // 15% chance of spike
};

// === Main Scanner ===
const marketScanner = async () => {
  console.log("📡 Running MarketPulse-AI Full Scanner...");

  const symbols = ['AAPL', 'TSLA', 'NVDA', 'AMD', 'GOOG']; // Add more as needed

  for (let symbol of symbols) {
    const candles = await getStockData(symbol);
    if (candles.length < 2) continue;

    const latest = candles[0];
    const previous = candles[1];

    const priceChange = ((latest.close - previous.close) / previous.close) * 100;
    const volumeSpike = latest.volume > previous.volume * 2;
    const breakout = latest.close > Math.max(...candles.slice(1, 6).map(c => c.high));
    const shortInterest = getShortInterest(symbol);
    const optionsSpike = getOptionsVolumeSpike(symbol);

    if (priceChange > 5 || breakout || volumeSpike || shortInterest > 20 || optionsSpike) {
      let message = `📈 *${symbol} Trade Alert*\n`;
      message += `• Price: $${latest.close.toFixed(2)}\n`;
      message += `• Change: ${priceChange.toFixed(2)}%\n`;

      // Signal tags
      if (breakout) message += `• 🚀 Breakout Detected\n`;
      if (volumeSpike) message += `• 📊 Institutional Volume Spike\n`;
      if (shortInterest > 20) message += `• 🔻 Short Interest: ${shortInterest.toFixed(1)}%\n`;
      if (optionsSpike) message += `• 📈 Unusual Options Volume\n`;

      // GPT-style commentary
      message += `\n🧠 *GPT Insight:* Based on the current surge in ${symbol}, combined with technical indicators like breakout levels and volume surges, this could represent a high-momentum short-term opportunity. Exercise caution if the market shows signs of pullback.\n`;

      await sendAlert(message);
    }
  }
};

marketScanner();
