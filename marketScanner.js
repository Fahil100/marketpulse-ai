const axios = require("axios");
require("dotenv").config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;

async function sendTelegramAlert(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHANNEL_ID,
      text: message,
      parse_mode: "Markdown"
    });
    console.log("✅ Telegram alert sent.");
  } catch (error) {
    console.error("❌ Failed to send Telegram alert:", error.response?.data || error.message);
  }
}

async function getTrendingStocks() {
  try {
    const res = await axios.get(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`);
    const articles = res.data.slice(0, 10);
    return articles.map(article => article.related).flat().filter(Boolean);
  } catch (error) {
    console.error("❌ Failed to get trending stocks:", error.message);
    return [];
  }
}

async function getLatestNews(ticker) {
  try {
    const res = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=2024-01-01&to=2025-12-31&token=${FINNHUB_API_KEY}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data[0].headline;
    }
  } catch (error) {
    console.error(`❌ Failed to get news for ${ticker}:`, error.message);
  }
  return null;
}

function getTradeSignal(changePercent) {
  if (changePercent >= 7) {
    return "BUY — Momentum breakout on news";
  } else if (changePercent >= 5) {
    return "HOLD — Moderate strength";
  } else {
    return "WATCH — Weak or uncertain";
  }
}

async function analyzeStock(ticker) {
  try {
    const res = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
    const data = res.data;
    const changePercent = ((data.c - data.pc) / data.pc) * 100;

    if (changePercent >= 5) {
      const headline = await getLatestNews(ticker);
      const signal = getTradeSignal(changePercent);
      return {
        ticker,
        price: data.c,
        change: changePercent.toFixed(2),
        reason: headline || "No headline available",
        signal
      };
    }
  } catch (error) {
    console.error(`❌ Failed to analyze ${ticker}:`, error.message);
  }
  return null;
}

async function analyzeGold() {
  try {
    const res = await axios.get(`https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=1min&outputsize=2&apikey=${TWELVE_DATA_API_KEY}`);
    const values = res.data.values;
    const latest = parseFloat(values[0].close);
    const previous = parseFloat(values[1].close);
    const change = ((latest - previous) / previous) * 100;

    if (change >= 0.5) {
      return {
        ticker: "XAU/USD",
        price: latest,
        change: change.toFixed(2)
      };
    }
  } catch (error) {
    console.error("❌ Failed to analyze gold:", error.message);
  }
  return null;
}

async function runScanner() {
  console.log("🔍 Running MarketPulse-AI Live Scanner...");

  const tickers = await getTrendingStocks();
  const uniqueTickers = [...new Set(tickers)].slice(0, 10);

  for (const ticker of uniqueTickers) {
    const result = await analyzeStock(ticker);
    if (result) {
      await sendTelegramAlert(
        `📈 *${result.ticker}* is up *${result.change}%* — Price: $${result.price}\n📰 Reason: ${result.reason}\n📊 Signal: ${result.signal}`
      );
    }
  }

  const gold = await analyzeGold();
  if (gold) {
    await sendTelegramAlert(
      `🪙 *Gold Alert* — XAU/USD is up *${gold.change}%* — Price: $${gold.price}`
    );
  }

  console.log("✅ Scan complete.");
}

runScanner();
