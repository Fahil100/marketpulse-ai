const axios = require('axios');

const botToken = '7697144054:AAE-LA8yLnEUUpAVML-8g-mL1NAQBIPKZuU';
const chatId = '-1002890614666'; // MUST include the dash and be your channel's full ID

async function sendTelegramAlert(opportunities) {
  try {
    const messages = opportunities.map((op, index) => {
      return `📈 *Opportunity ${index + 1}*\n` +
             `Symbol: ${op.symbol}\n` +
             `Price: $${op.price}\n` +
             `Change: ${op.changePercent}%\n` +
             `Volume: ${op.volume}\n` +
             `\n🕵️‍♂️ Analysis: ${op.analysis || 'N/A'}`;
    });

    for (const msg of messages) {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: msg,
        parse_mode: 'Markdown'
      });
    }

    console.log('✅ Alerts sent successfully to Telegram.');
  } catch (error) {
    console.error('❌ Failed to send alert:', error.response?.data || error.message);
  }
}

module.exports = sendTelegramAlert;