const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Store last known gold price
let lastGoldPrice = 0;

// Function to send message to Telegram
async function sendTelegramMessage(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
    });
    console.log('📬 Telegram alert sent.');
  } catch (err) {
    console.error('❌ Failed to send Telegram message:', err.message);
  }
}

// Function to fetch and compare gold price
async function checkGoldPrice() {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );

    const data = response.data;

    if (
      data &&
      data['Realtime Currency Exchange Rate'] &&
      data['Realtime Currency Exchange Rate']['5. Exchange Rate']
    ) {
      const price = parseFloat(
        data['Realtime Currency Exchange Rate']['5. Exchange Rate']
      );

      console.log(`🟡 Gold Price (XAU to USD): $${price}`);

      // Compare with previous price
      if (lastGoldPrice > 0) {
        const changePercent = Math.abs(
          ((price - lastGoldPrice) / lastGoldPrice) * 100
        );

        if (changePercent >= 5) {
          await sendTelegramMessage(
            `🟡 Gold moved ${changePercent.toFixed(2)}% → New Price: $${price}`
          );
        }
      }

      lastGoldPrice = price;
    } else {
      console.error('❌ Unexpected API response:', data);
    }
  } catch (err) {
    console.error('❌ Error checking gold price:', err.message);
  }
}

// Endpoint for test
app.get('/', (req, res) => {
  res.send('✅ GPT MarketPulse-AI server is running.');
});

// Start checking gold every 60 seconds
setInterval(checkGoldPrice, 60000);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
