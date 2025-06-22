const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

// === Environment Variables ===
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// === Symbols to Scan ===
const symbols = ["AAPL", "GOOGL", "TSLA", "MSFT", "NVDA", "AMZN", "META", "AMD", "NFLX"];

async function fetchStockData(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`;

  try {
    const response = await axios.get(url);
    const timeSeries = response.data["Time Series (5min)"];
    if (!timeSeries) {
      console.error(`❌ No time series for ${symbol}`);
      return null;
    }

    const timestamps = Object.keys(timeSeries);
    const latest = timeSeries[timestamps[0]];
    const previous = timeSeries[timestamps[1]];
    const latestPrice = parseFloat(latest["4. close"]);
    const prevPrice = parseFloat(previous["4. close"]);
    const change = ((latestPrice - prevPrice) / prevPrice) * 100;

    return { symbol, latestPrice, prevPrice, change: change.toFixed(2) };
  } catch (error) {
    console.error(`❌ Error fetching ${symbol}: ${error.message}`);
    return null;
  }
}

async function sendAlert(message) {
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, message);
  } catch (error) {
    console.error("❌ Failed to send Telegram alert:", error.message);
  }
}

async function scanMarket() {
  console.log("📡 Scanning Market...");
  const results = [];

  for (let i = 0; i < symbols.length; i++) {
    const stock = await fetchStockData(symbols[i]);
    if (stock && Math.abs(stock.change) >= 5) {
      results.push(stock);
    }
    await new Promise((r) => setTimeout(r, 15000)); // wait 15 seconds to avoid rate limits
  }

  if (results.length === 0) {
    console.log("✅ No major movers right now.");
    return;
  }

  for (const stock of results) {
    const message = `🚨 ${stock.symbol} moved ${stock.change}% in last 5 mins.\nPrice: $${stock.latestPrice}`;
    await sendAlert(message);
  }
}

// === Entry point ===
if (require.main === module) {
  scanMarket();
}

module.exports = { scanMarket };
