// whaleTracker.cjs
const fs = require('fs');
const { sendTelegramMessage } = require('./utils/telegram.cjs');
const { logToGoogleSheet } = require('./utils/googleSheets.cjs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

if (!config.toggles.whaleTracker) {
  console.log('⛔ Whale Tracker is disabled in config.json');
  process.exit(0);
}

console.log('🐋 [WHALE TRACKER] Monitoring for large institutional trades...');

// Simulated whale trade detection
const whaleAlert = {
  ticker: 'NVDA',
  action: 'BUY',
  shares: 850000,
  price: 124.50,
  source: 'Dark Pool Sweep',
  sentiment: 'Ultra Bullish',
  confidence: 'Extreme',
  timestamp: new Date().toISOString()
};

console.log('📈 ALERT:', whaleAlert);

// Send to Telegram
await sendTelegramMessage(
  `🐋 *Whale Tracker Alert*\n\n` +
  `📌 Ticker: ${whaleAlert.ticker}\n` +
  `📥 Action: ${whaleAlert.action} ${whaleAlert.shares.toLocaleString()} shares @ $${whaleAlert.price}\n` +
  `🛠 Source: ${whaleAlert.source}\n` +
  `🧠 Sentiment: ${whaleAlert.sentiment}\n` +
  `📊 Confidence: ${whaleAlert.confidence}\n` +
  `🕒 Time: ${new Date(whaleAlert.timestamp).toLocaleTimeString()}\n`
);

// Log to Google Sheets
await logToGoogleSheet([
  '🐋 Whale Tracker',
  whaleAlert.ticker,
  whaleAlert.action,
  whaleAlert.shares,
  whaleAlert.price,
  whaleAlert.source,
  whaleAlert.sentiment,
  whaleAlert.confidence,
  whaleAlert.timestamp
]);

console.log('✅ [WHALE TRACKER] Execution complete.');
