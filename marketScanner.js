const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const bot = new TelegramBot(TELEGRAM_TOKEN);

const STOCKS = ['AAPL', 'TSLA', 'NVDA', 'GOOGL', 'META', 'MSFT'];

async function getAlphaVantagePrice(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${ALPHA_VANTAGE_API_KEY}`;
  try {
    const response = await axios.get(url);
    const data = response.data['Time Series (1min)'];
    if (!data) return null;
    const times = Object.keys(data);
    const latest = data[times[0]];
    const open = parseFloat(latest['1. open']);
    const close = parseFloat(latest['4. close']);
    return { symbol, open, close };
  } catch (err) {
    console.error(`❌ Failed to fetch price for ${symbol}:`, err.message);
    return null;
  }
}

async function getFinnhubData(symbol) {
  const newsUrl = `https://finnhub.io/api/v1/news/${symbol}?token=${FINNHUB_API_KEY}`;
  const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
  const optionsUrl = `https://finnhub.io/api/v1/stock/option-chain?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
  const shortInterestUrl = `https://finnhub.io/api/v1/stock/short-interest?symbol=${symbol}&token=${FINNHUB_API_KEY}`;

  try {
    const [newsRes, quoteRes, optionsRes, shortRes] = await Promise.all([
      axios.get(newsUrl),
      axios.get(quoteUrl),
      axios.get(optionsUrl),
      axios.get(shortInterestUrl)
    ]);

    return {
      news: newsRes.data.slice(0, 2),
      quote: quoteRes.data,
      options: optionsRes.data.data || [],
      shortInterest: shortRes.data[0] || {}
    };
  } catch (err) {
    console.error(`❌ Finnhub fetch error: ${symbol}`, err.message);
    return {};
  }
}

function analyzeBreakout(open, close) {
  const change = ((close - open) / open) * 100;
  return change >= 5 ? `🚀 Breakout: +${change.toFixed(2)}%` : null;
}

function analyzeOptions(options) {
  const unusual = options.filter(o => o.openInterest > 1000 && o.volume > 1000);
  return unusual.length > 0 ? `🧠 Options Radar: ${unusual.length} unusual contracts` : null;
}

function analyzeShortInterest(short) {
  return short.shortInterest && short.shortInterest > 1000000
    ? `🔥 High Short Interest: ${short.shortInterest.toLocaleString()}`
    : null;
}

function generateSummary(symbol, details) {
  return `📊 ${symbol} ALERT\n${details.filter(Boolean).join('\n')}`;
}

async function runScanner() {
  console.log('📡 Running MarketPulse-AI Full Scanner...');
  for (let symbol of STOCKS) {
    const priceData = await getAlphaVantagePrice(symbol);
    if (!priceData) continue;

    const breakout = analyzeBreakout(priceData.open, priceData.close);
    if (!breakout) continue;

    const { news, options, shortInterest } = await getFinnhubData(symbol);
    const optionLabel = analyzeOptions(options);
    const shortLabel = analyzeShortInterest(shortInterest);

    const headline = news?.[0]?.headline || 'No major news available';
    const summary = generateSummary(symbol, [breakout, optionLabel, shortLabel, `📰 ${headline}`]);

    try {
      await bot.sendMessage(TELEGRAM_CHAT_ID, summary);
      console.log(`✅ Alert sent for ${symbol}`);
    } catch (err) {
      console.error(`❌ Failed to send Telegram message for ${symbol}:`, err.message);
    }
  }
}

module.exports = runScanner;