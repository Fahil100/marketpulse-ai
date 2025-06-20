const axios = require("axios");

async function getGoldData() {
  const url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=GC=F";
  const response = await axios.get(url);
  const data = response.data.quoteResponse.result[0];

  const current = data.regularMarketPrice;
  const previous = data.regularMarketPreviousClose;
  const changePercent = ((current - previous) / previous) * 100;

  return { current, previous, changePercent };
}

async function sendTelegramAlert(message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  await axios.post(url, { chat_id: chatId, text: message });
}

async function goldAnalyzer() {
  try {
    const { current, previous, changePercent } = await getGoldData();

    if (Math.abs(changePercent) >= 5) {
      const direction = changePercent > 0 ? "📈 Bullish" : "📉 Bearish";
      const message = `🚨 Gold Alert (${direction})\nCurrent: $${current}\nPrevious Close: $${previous}\nChange: ${changePercent.toFixed(2)}%`;
      await sendTelegramAlert(message);
    }
  } catch (err) {
    console.error("Error in goldAnalyzer:", err.response?.data || err.message);
  }
}

module.exports = goldAnalyzer;
