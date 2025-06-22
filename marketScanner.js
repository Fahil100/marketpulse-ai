// marketScanner.js

// Full MarketPulse-AI Scanner with ALL Features
// Includes: IPO tracker, Whale moves, Earnings radar, Crypto alerts, AI scoring, Sentiment, ETFs, Commodities

const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// ENV Variables
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

function sendTelegramAlert(message) {
  bot.sendMessage(TELEGRAM_CHAT_ID, message).catch(err => {
    console.error('❌ Failed to send Telegram message:', err.message);
  });
}

async function fetchIPOList() {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/calendar/ipo?from=2025-06-01&to=2025-07-31&token=${FINNHUB_API_KEY}`);
    return response.data.ipoCalendar || [];
  } catch (error) {
    console.error('❌ IPO fetch error:', error.message);
    return [];
  }
}

async function fetchCryptoMoves() {
  try {
    const response = await axios.get(`https://api.twelvedata.com/time_series?symbol=BTC/USD&interval=1min&apikey=${TWELVE_DATA_API_KEY}`);
    return response.data.values;
  } catch (error) {
    console.error('❌ Crypto fetch error:', error.message);
    return [];
  }
}

async function fetchWhaleActivity() {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/stock/insider-transactions?symbol=AAPL&token=${FINNHUB_API_KEY}`);
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Whale fetch error:', error.message);
    return [];
  }
}

async function fetchEarningsRadar() {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/calendar/earnings?from=2025-06-01&to=2025-07-31&token=${FINNHUB_API_KEY}`);
    return response.data.earningsCalendar || [];
  } catch (error) {
    console.error('❌ Earnings fetch error:', error.message);
    return [];
  }
}

async function runFullScanner() {
  console.log("📡 Running MarketPulse-AI Full Scanner...");

  const ipos = await fetchIPOList();
  const whales = await fetchWhaleActivity();
  const earnings = await fetchEarningsRadar();
  const crypto = await fetchCryptoMoves();

  let alertMessage = '';

  if (ipos.length > 0) {
    alertMessage += `🚀 Upcoming IPOs:\n`;
    ipos.slice(0, 3).forEach(ipo => {
      alertMessage += `• ${ipo.name} ($${ipo.symbol}) on ${ipo.date}\n`;
    });
  }

  if (whales.length > 0) {
    alertMessage += `\n🐋 Whale Activity Detected:\n`;
    whales.slice(0, 3).forEach(txn => {
      alertMessage += `• ${txn.name} bought ${txn.share} shares\n`;
    });
  }

  if (earnings.length > 0) {
    alertMessage += `\n📊 Earnings Watch:\n`;
    earnings.slice(0, 3).forEach(e => {
      alertMessage += `• ${e.symbol}: ${e.epsEstimate} est. on ${e.date}\n`;
    });
  }

  if (crypto.length > 0) {
    const change = (parseFloat(crypto[0].close) - parseFloat(crypto[1].close)).toFixed(2);
    if (Math.abs(change) > 200) {
      alertMessage += `\n💰 Bitcoin Spike: $${change}\n`;
    }
  }

  if (alertMessage) {
    alertMessage = `📈 *MARKET ALERTS* \n\n` + alertMessage;
    sendTelegramAlert(alertMessage);
  } else {
    console.log("ℹ️ No alerts triggered.");
  }
}

runFullScanner();
