const axios = require('axios');
const sendTelegramAlert = require('./sendTelegramAlert');

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

let lastAlerts = {};

async function marketScanner() {
  try {
    // === GOLD SCANNER ===
    const goldUrl = `https://api.twelvedata.com/quote?symbol=XAU/USD&apikey=${TWELVE_DATA_API_KEY}`;
    const goldResponse = await axios.get(goldUrl);
    const gold = goldResponse.data;

    const goldPrice = parseFloat(gold.close);
    const goldPrev = parseFloat(gold.previous_close);
    const goldChange = ((goldPrice - goldPrev) / goldPrev) * 100;

    if (Math.abs(goldChange) >= 0.5 && lastAlerts['GOLD'] !== goldPrice) {
      await sendTelegramAlert(
        `🚨 GOLD ALERT\n\nSymbol: XAU/USD\nDirection: ${goldChange > 0 ? 'UP' : 'DOWN'}\nPrice: $${goldPrice.toFixed(2)} (${goldChange.toFixed(2)}%)\n\u23f1 ${new Date().toLocaleTimeString()}\n${goldChange > 0 ? '\ud83d\udd35 Possible breakout' : '\ud83d\udd34 Possible short or rebound'}`
      );
      lastAlerts['GOLD'] = goldPrice;
    }
  } catch (error) {
    console.error('Error fetching gold data:', error.response?.data || error.message);
  }

  try {
    // === STOCK SCANNER ===
    for (const symbol of ['AAPL', 'TSLA', 'NVDA']) {
      const stockUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const response = await axios.get(stockUrl);

      const current = response.data.c;
      const prev = response.data.pc;

      if (!current || !prev) continue;

      const percentChange = ((current - prev) / prev) * 100;

      if (Math.abs(percentChange) >= 5 && lastAlerts[symbol] !== current) {
        await sendTelegramAlert(
          `🚨 STOCK ALERT\n\nSymbol: ${symbol}\nChange: ${percentChange.toFixed(2)}%\nPrice: $${current}\n\u23f1 ${new Date().toLocaleTimeString()}`
        );
        lastAlerts[symbol] = current;
      }
    }
  } catch (error) {
    console.error(`Stock scanner error:`, error.message);
  }

  try {
    // === CRYPTO SCANNER ===
    for (const symbol of ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT']) {
      const cryptoUrl = `https://finnhub.io/api/v1/crypto/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const response = await axios.get(cryptoUrl);

      const current = response.data.c;
      const prev = response.data.pc;

      if (!current || !prev) continue;

      const percentChange = ((current - prev) / prev) * 100;

      if (Math.abs(percentChange) >= 5 && lastAlerts[symbol] !== current) {
        await sendTelegramAlert(
          `₿ CRYPTO ALERT\n\nSymbol: ${symbol}\nChange: ${percentChange.toFixed(2)}%\nPrice: $${current}`
        );
        lastAlerts[symbol] = current;
      }
    }
  } catch (error) {
    console.error(`Crypto scanner error:`, error.message);
  }
}

module.exports = marketScanner;
