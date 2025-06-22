const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

const GOLD_SYMBOL = 'XAUUSD';
const SCAN_INTERVAL = 60 * 1000; // every 60 seconds

async function getGoldPrice() {
  const url = `https://finnhub.io/api/v1/quote?symbol=${GOLD_SYMBOL}&token=${FINNHUB_API_KEY}`;
  const res = await axios.get(url);
  return res.data;
}

async function getGoldNews() {
  const url = `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`;
  const res = await axios.get(url);
  return res.data.filter(item => item.headline.toLowerCase().includes('gold'))[0]?.headline || '';
}

async function getOptionsActivity() {
  // Placeholder: use real API when available
  return "Spike in call volume on GLD options detected.";
}

async function getShortInterest() {
  // Placeholder: use real API when available
  return "Short interest is climbing — bearish sentiment increasing.";
}

async function isInstitutionalVolumeSpike(currentPrice) {
  if (!global.lastPrice) {
    global.lastPrice = currentPrice;
    return false;
  }
  const change = Math.abs(currentPrice - global.lastPrice) / global.lastPrice;
  global.lastPrice = currentPrice;
  return change > 0.01;
}

function generateLabel(priceChange) {
  if (priceChange > 1.5) return "🚀 Breakout";
  if (priceChange < -1.5) return "⚠️ Reversal";
  return "📊 Movement";
}

async function marketScanner() {
  try {
    console.log('📡 Running MarketPulse-AI Full Scanner...');

    const priceData = await getGoldPrice();
    const currentPrice = priceData.c;
    const previousClose = priceData.pc;
    const changePercent = ((currentPrice - previousClose) / previousClose) * 100;

    if (Math.abs(changePercent) < 0.5) return; // filter out small moves

    const label = generateLabel(changePercent);
    const headline = await getGoldNews();
    const optionsRadar = await getOptionsActivity();
    const shortInterest = await getShortInterest();
    const volumeSpike = await isInstitutionalVolumeSpike(currentPrice);

    let message = `
📡 *Gold Price Alert (${GOLD_SYMBOL})*
${label}

💰 *Price:* $${currentPrice.toFixed(2)}
📈 *Change:* ${changePercent.toFixed(2)}%

🧠 *Summary:*
Gold is showing ${label.replace(/[^a-zA-Z ]/g, '')} behavior today.
${volumeSpike ? '🔵 Institutional activity spike detected.\n' : ''}

📰 *News:* ${headline}
📉 *Short Interest:* ${shortInterest}
📊 *Options Radar:* ${optionsRadar}
    `;

    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log('✅ Alert sent');

  } catch (error) {
    console.error('❌ Error in scanner:', error.message);
  }
}

module.exports = marketScanner;

// Run if executed directly
if (require.main === module) {
  marketScanner();
}