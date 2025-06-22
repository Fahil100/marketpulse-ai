const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  throw new Error('❌ Telegram Bot Token or Chat ID not set.');
}

const bot = new TelegramBot(token, { polling: false });

async function sendTelegramMessage(message) {
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log('✅ Telegram alert sent');
  } catch (err) {
    console.error('❌ Failed to send alert:', err.message);
  }
}

module.exports = { sendTelegramMessage };
