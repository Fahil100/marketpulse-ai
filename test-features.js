const TelegramBot = require('node-telegram-bot-api');

// 🔥 Replace these with your actual values for local testing ONLY
const TELEGRAM_BOT_TOKEN = '7697144054:AAE-LA8yLnEUUpAVML-8g-mL1NAQBIPKZuU';
const TELEGRAM_CHAT_ID = '-1002890614666';  // ← This is your correct channel ID

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

function sendTelegramMessage(message) {
  return bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' })
    .then(() => console.log('✅ Test alert sent'))
    .catch((err) => console.error('❌ Failed to send alert:', err.message));
}

async function testFeatureAlerts() {
  await sendTelegramMessage(
    '🚀 *Crypto Spike Alert*\nBTC/USD surged +6.7% in the past 30 minutes.\nVolume: $1.2B\nRSI: 72.3\nConsider monitoring for pullback or breakout.'
  );

  await sendTelegramMessage(
    '🤖 *AI Trade Score*\nTicker: NVDA\nScore: 9.2/10 – Strong Buy\nReason: High institutional inflow, bullish news sentiment, earnings beat, option volume spike.'
  );
}

testFeatureAlerts();
