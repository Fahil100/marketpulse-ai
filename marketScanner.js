// 📈 MarketPulse-AI: Full Scanner with Crypto & AI Trade Scoring

const axios = require('axios');
const { sendTelegramAlert } = require('./utils/telegram');
require('dotenv').config();

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const STOCKS = ['AAPL', 'TSLA', 'NVDA', 'MSFT'];
const CRYPTOS = ['BTCUSD', 'ETHUSD'];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAlphaData(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${ALPHA_VANTAGE_API_KEY}`;
  const res = await axios.get(url);
  return res.data['Time Series (1min)'] || null;
}

function analyzeSpike(data) {
  const entries = Object.entries(data);
  if (entries.length < 2) return false;
  const [latestTime, latestData] = entries[0];
  const [previousTime, previousData] = entries[1];

  const latestPrice = parseFloat(latestData['4. close']);
  const previousPrice = parseFloat(previousData['4. close']);
  const percentChange = ((latestPrice - previousPrice) / previousPrice) * 100;

  return percentChange >= 5;
}

function generateAIScore(priceData) {
  const entries = Object.entries(priceData);
  if (entries.length < 2) return 50;
  const [latestTime, latest] = entries[0];
  const [prevTime, prev] = entries[1];

  const delta = parseFloat(latest['4. close']) - parseFloat(prev['4. close']);
  const volumeJump = parseFloat(latest['5. volume']) > parseFloat(prev['5. volume']);

  let score = 50;
  if (delta > 0) score += 25;
  if (volumeJump) score += 25;
  return score;
}

async function scanTicker(ticker) {
  try {
    const data = await fetchAlphaData(ticker);
    if (!data) return;

    const spike = analyzeSpike(data);
    const score = generateAIScore(data);

    if (spike || score >= 80) {
      const alertMsg = `🚨 Trade Opportunity: ${ticker}\nSpike: ${spike ? 'Yes' : 'No'} | AI Score: ${score}/100`;
      await sendTelegramAlert(alertMsg);
    }
  } catch (error) {
    console.error(`❌ Error scanning ${ticker}:`, error.message);
  }
}

async function runScanner() {
  console.log('📡 Running MarketPulse-AI Full Scanner...');
  const allTickers = [...STOCKS, ...CRYPTOS];

  for (const ticker of allTickers) {
    await scanTicker(ticker);
    await delay(12000); // 12 sec delay to avoid API limits
  }
}

runScanner();