// marketScanner.js

const axios = require('axios');
const sendTelegramAlert = require('./sendTelegramAlert');

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const GOLD_SYMBOL = 'XAU/USD';

async function runGoldScanner() {
  try {
    const url = `https://api.twelvedata.com/quote?symbol=${GOLD_SYMBOL}&apikey=${TWELVE_DATA_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;

    if (data.code || !data.price) {
      console.error("Error fetching gold data:", data.message || data);
      return;
    }

    const currentPrice = parseFloat(data.close);
    const previousPrice = parseFloat(data.previous_close);
    const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;

    // Only alert if price changes more than 0.5%
    if (Math.abs(changePercent) >= 0.5) {
      const direction = changePercent > 0 ? 'UP' : 'DOWN';
      const alertMessage = `
🚨 GOLD PRICE ALERT

Symbol: XAU/USD
Direction: ${direction}
Current: $${currentPrice.toFixed(2)}
Prev Close: $${previousPrice.toFixed(2)}
Change: ${changePercent.toFixed(2)}%

🟡 Action: ${direction === 'UP' ? 'Consider Buying' : 'Watch for Rebound'}
⏱ Time: ${new Date().toLocaleTimeString()}
      `;

      await sendTelegramAlert(alertMessage);
      console.log("✅ Gold alert sent to Telegram.");
    } else {
      console.log("Gold movement too small, no alert sent.");
    }

  } catch (error) {
    console.error("Error in gold scanner:", error.message);
  }
}

// Run once on start and every 30 seconds
runGoldScanner();
setInterval(runGoldScanner, 30000);
