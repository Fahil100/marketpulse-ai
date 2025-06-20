const axios = require("axios");

async function goldAnalyzer() {
  try {
    const message = `🚨 Test Alert: This is a direct message from your MarketPulse-AI bot.`;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    await axios.post(url, {
      chat_id: chatId,
      text: message,
    });

    console.log("Message sent!");
  } catch (err) {
    console.error("Telegram error:", err.response?.data || err.message);
  }
}

module.exports = goldAnalyzer;
