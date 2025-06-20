// ✅ FINAL STEP: Connect Alpha Vantage + Telegram Alert

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const GOLD_SYMBOL = 'XAUUSD';
const ALERT_THRESHOLD = 2000; // ✅ You can change this value to test alerts

async function checkGoldPrice() {
  try {
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: 'XAU',
        to_currency: 'USD',
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const price = parseFloat(
      response.data['Realtime Currency Exchange Rate']['5. Exchange Rate']
    );

    console.log(`Gold price: $${price}`);

    if (price > ALERT_THRESHOLD) {
      await sendTelegramAlert(price);
    }
  } catch (error) {
    console.error('Error checking gold price:', error.message);
  }
}

async function sendTelegramAlert(price) {
  const message = `\uD83D\uDEA8 GOLD PRICE ALERT: $${price}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
  };

  try {
    await axios.post(url, body);
    console.log('Telegram alert sent.');
  } catch (error) {
    console.error('Telegram alert failed:', error.message);
  }
}

// Schedule checks every 60 seconds
setInterval(checkGoldPrice, 60000);

app.get('/', (req, res) => {
  res.send('✅ GPT MarketPulse-AI server is running.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
