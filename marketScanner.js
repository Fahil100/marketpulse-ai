// === File: marketScanner.js ===
require('dotenv').config();
const axios = require('axios');
const { sendTelegramAlert } = require('./utils/telegram');

const STOCKS = ['AAPL', 'TSLA', 'MSFT', 'NVDA'];
const CRYPTOS = ['BTC/USD', 'ETH/USD'];
const MIN_SCORE = 70;

async function fetchStockData(symbol) {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    const res = await axios.get(url);
    const data = res.data['Time Series (5min)'];
    if (!data) throw new Error('No time series returned');
    return Object.values(data)[0];
  } catch (err) {
    console.error(`❌ Failed to fetch stock data for ${symbol}: ${err.message}`);
    return null;
  }
}

async function fetchCryptoData(symbol) {
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&apikey=${process.env.TWELVE_DATA_API_KEY}`;
    const res = await axios.get(url);
    if (!res.data || !res.data.values) throw new Error('No crypto data returned');
    return res.data.values[0];
  } catch (err) {
    console.error(`❌ Failed to fetch crypto data for ${symbol}: ${err.message}`);
    return null;
  }
}

async function fetchIPOCalendar() {
  try {
    const url = `https://finnhub.io/api/v1/calendar/ipo?token=${process.env.FINNHUB_API_KEY}`;
    const res = await axios.get(url);
    return res.data.ipoCalendar || [];
  } catch (err) {
    console.error(`❌ Failed to fetch IPO calendar: ${err.message}`);
    return [];
  }
}

async function fetchEarnings() {
  try {
    const url = `https://finnhub.io/api/v1/calendar/earnings?token=${process.env.FINNHUB_API_KEY}`;
    const res = await axios.get(url);
    return res.data.earningsCalendar || [];
  } catch (err) {
    console.error(`❌ Failed to fetch earnings: ${err.message}`);
    return [];
  }
}

async function fetchWhaleMoves() {
  try {
    const url = `https://finnhub.io/api/v1/stock/insider-transactions?symbol=AAPL&token=${process.env.FINNHUB_API_KEY}`;
    const res = await axios.get(url);
    return res.data.data || [];
  } catch (err) {
    console.error(`❌ Failed to fetch whale moves: ${err.message}`);
    return [];
  }
}

function scoreOpportunity(data) {
  if (!data || !data['4. close']) return 0;
  const close = parseFloat(data['4. close']);
  const open = parseFloat(data['1. open']);
  const change = ((close - open) / open) * 100;
  return Math.round(change * 10);
}

async function scanMarket() {
  console.log('📡 Running MarketPulse-AI Full Scanner...');
  const alerts = [];

  for (const symbol of STOCKS) {
    const data = await fetchStockData(symbol);
    const score = scoreOpportunity(data);
    if (score >= MIN_SCORE) {
      alerts.push(`📈 Stock Alert: ${symbol} — Score: ${score}`);
    }
  }

  for (const symbol of CRYPTOS) {
    const data = await fetchCryptoData(symbol);
    if (data) {
      const change = parseFloat(data.percent_change);
      if (Math.abs(change) > 2) {
        alerts.push(`🪙 Crypto Alert: ${symbol} — Change: ${change.toFixed(2)}%`);
      }
    }
  }

  const ipos = await fetchIPOCalendar();
  if (ipos.length) alerts.push(`🚀 ${ipos.length} IPOs coming soon.`);

  const earnings = await fetchEarnings();
  if (earnings.length) alerts.push(`💰 ${earnings.length} companies reporting earnings.`);

  const whales = await fetchWhaleMoves();
  if (whales.length) alerts.push(`🐋 ${whales.length} insider transactions detected.`);

  if (alerts.length) {
    const message = `📢 *Market Alerts*\n\n${alerts.join('\n')}`;
    await sendTelegramAlert(message);
    console.log('✅ Telegram alert sent');
  } else {
    console.log('ℹ️ No opportunities found at this time.');
  }

  console.log('✅ Market scan complete');
}

scanMarket();
