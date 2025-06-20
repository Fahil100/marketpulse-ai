const axios = require('axios');

async function sendTelegramAlert(message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !chatId) {
    console.error("❌ Telegram botToken or chatId is missing from env vars.");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const res = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    });

    console.log("✅ Alert sent to Telegram:", res.data);
  } catch (err) {
    console.error("❌ Telegram alert failed:", err.response?.data || err.message);
  }
}

module.exports = sendTelegramAlert;
