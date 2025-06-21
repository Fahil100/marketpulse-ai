const axios = require('axios');

// ✅ Replace with your real bot token and channel ID
const TELEGRAM_TOKEN = '7697144054:AAE-LA8yLnEUUpAVML-8g-mL1NAQBIPKZuU';
const CHAT_ID = '-1002890614666'; // Your Telegram channel ID

async function sendTelegramAlert(opportunities) {
  if (!opportunities || opportunities.length === 0) return;

  const message = opportunities.map(op => {
    if (op.type === 'gold') {
      return `📈 GOLD ALERT:\n${op.message}`;
    } else if (op.type === 'stock') {
      return `📊 STOCK ALERT for ${op.ticker}:\n${op.message}`;
    }
    return '';
  }).join('\n\n');

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    });
    console.log('✅ Telegram alert sent!');
  } catch (err) {
    console.error('❌ Telegram alert failed:', err.message);
  }
}

module.exports = sendTelegramAlert;