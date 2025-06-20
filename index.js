const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Telegram config
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Finnhub config
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// Function to send Telegram message
async function sendTelegramMessage(message) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    });
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error.message);
  }
}

// Function to check gold price from Finnhub
async function checkGoldPrice() {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=OANDA:XAU_USD&token=${FINNHUB_API_KEY}`;
    const response = await axios.get(url);
    const price = response.data.c;

    if (!price) {
      console.log('❌ No price returned from Finnhub.');
      return;
    }

    console.log(`🟡 Gold price: $${price}`);

    // Example logic for alert (adjust as needed)
    if (price > 2400) {
      await sendTelegramMessage(`📈 Gold Alert: Price is high at $${price}`);
    } else if (price < 2300) {
      await sendTelegramMessage(`📉 Gold Alert: Price dropped to $${price}`);
    }
  } catch (error) {
    console.error('❌ Error checking gold price:', error.message);
  }
}

// Call gold price check every 5 minutes
setInterval(checkGoldPrice, 5 * 60 * 1000);

// Start Express server
app.get('/', (req, res) => {
  res.send('✅ GPT MarketPulse-AI server is running.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
