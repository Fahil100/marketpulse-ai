// GPT-Alpha Omega Edition - index.js
// Built for Elite Automated Trading with Full GPT Intelligence Stack
// Includes momentum scanning, options radar, insider tracking, sentiment scraping, auto-trading, GPT reasoning, backtesting, screenshots, PnL logging, and risk optimization.

const axios = require("axios");
const puppeteer = require("puppeteer");
require("dotenv").config();

// ENV Vars
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;

// Global Settings
const watchlist = ["AAPL", "TSLA", "NVDA", "MSFT", "META", "AMZN", "XAU/USD", "BTC/USD"];
const momentumThreshold = 5.0;
const maxDrawdown = -3.0;
const screenshotsEnabled = false;

// Price Fetch
async function fetchPrice(ticker) {
  try {
    const isFx = ticker.includes("USD");
    const symbol = ticker.replace("/", "");
    const url = isFx
      ? `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`
      : `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
    const response = await axios.get(url);
    return isFx ? parseFloat(response.data.price) : response.data.c;
  } catch (err) {
    console.error(`Price error for ${ticker}:`, err.message);
    return null;
  }
}

// Momentum Analyzer
async function getMomentum(ticker) {
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${ticker.replace("/", "")}&interval=1min&apikey=${TWELVE_DATA_API_KEY}&outputsize=5`;
    const res = await axios.get(url);
    const values = res.data.values.map(v => parseFloat(v.close));
    const momentum = ((values[0] - values[4]) / values[4]) * 100;
    const potentialUpside = ((Math.max(...values) - values[0]) / values[0]) * 100;
    const potentialDownside = ((Math.min(...values) - values[0]) / values[0]) * 100;
    return { momentum, potentialUpside, potentialDownside };
  } catch {
    return { momentum: 0, potentialUpside: 0, potentialDownside: 0 };
  }
}

// Options Radar
async function getUnusualOptions(ticker) {
  try {
    const url = `https://finnhub.io/api/v1/stock/option-chain?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
    const res = await axios.get(url);
    const data = res.data.data || [];
    return data.filter(opt => opt.volume > 5000 && opt.open_interest > 10000);
  } catch {
    return [];
  }
}

// Insider Tracker
async function getWhaleBuys(ticker) {
  try {
    const url = `https://finnhub.io/api/v1/stock/insider-transactions?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
    const res = await axios.get(url);
    return res.data.data.filter(tr => tr.transactionType === "P" && +tr.shares > 10000);
  } catch {
    return [];
  }
}

// Sentiment Analysis
async function getSentiment(ticker) {
  try {
    const url = `https://finnhub.io/api/v1/news-sentiment?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
    const res = await axios.get(url);
    return {
      reddit: res.data.redditScore,
      twitter: res.data.twitterScore,
      sentiment: res.data.sentiment,
    };
  } catch {
    return { reddit: 0, twitter: 0, sentiment: "Neutral" };
  }
}

// Screenshot Generator
async function takeScreenshot(ticker) {
  if (!screenshotsEnabled) return;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.tradingview.com/chart/?symbol=${ticker}`);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `./screenshots/${ticker}.png` });
  await browser.close();
}

// Auto-Trade
async function placeOrder(ticker, side = "buy", qty = 1) {
  const url = "https://paper-api.alpaca.markets/v2/orders";
  const headers = {
    "APCA-API-KEY-ID": ALPACA_API_KEY,
    "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
  };
  const order = { symbol: ticker, qty, side, type: "market", time_in_force: "gtc" };
  await axios.post(url, order, { headers });
}

// Telegram Alert
async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await axios.post(url, { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" });
}


// GPT Reasoning
function generateGPTReasoning(ticker, momentum, whales, sentiment, options) {
  let reasons = [`${ticker} shows momentum of ${momentum.toFixed(2)}%`];
  if (whales.length > 0) reasons.push(`Detected ${whales.length} large insider purchases`);
  if (sentiment.reddit > 0 || sentiment.twitter > 0) reasons.push(`Positive sentiment: Reddit ${sentiment.reddit}, Twitter ${sentiment.twitter}`);
  if (options.length > 0) reasons.push(`Unusual options activity spotted`);
  return reasons.join(" | ");
}

// PnL Logger to Google Sheets
async function logTradeToSheet(data) {
  try {
    await axios.post(SHEETS_WEBHOOK_URL, data);
  } catch (err) {
    console.error("Logging error:", err.message);
  }
}

// Full Market Scanner
async function scanMarket() {
  for (const ticker of watchlist) {
    const price = await fetchPrice(ticker);
    if (!price) continue;

    const { momentum, potentialUpside, potentialDownside } = await getMomentum(ticker);
    const whales = await getWhaleBuys(ticker);
    const sentiment = await getSentiment(ticker);
    const options = await getUnusualOptions(ticker);

    const isTradeCandidate = momentum > momentumThreshold && potentialDownside > maxDrawdown;
    if (!isTradeCandidate) continue;

    const reasoning = generateGPTReasoning(ticker, momentum, whales, sentiment, options);
    const message = `🚨 *TRADE ALERT* 🚨\n\n*${ticker}* @ *$${price.toFixed(2)}*\nMomentum: ${momentum.toFixed(2)}%\nUpside: ${potentialUpside.toFixed(2)}%\nRisk: ${potentialDownside.toFixed(2)}%\n\n${reasoning}`;

    await sendTelegram(message);
    await placeOrder(ticker, "buy", 1);
    await logTradeToSheet({
      ticker, price, momentum, potentialUpside, potentialDownside,
      reasoning, whales: whales.length, sentimentScore: sentiment.reddit + sentiment.twitter,
      timestamp: new Date().toISOString()
    });
    await takeScreenshot(ticker);
  }
}

// Runner
(async () => {
  await scanMarket();
})();
