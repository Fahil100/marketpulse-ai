const axios = require('axios');
const sendTelegramAlert = require('./sendTelegramAlert');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// === STOCKS TO MONITOR ===
const STOCKS = ['AAPL', 'TSLA', 'NVDA'];
// === CRYPTO FROM COINBASE (not Binance) ===
const CRYPTOS = ['COINBASE:BTC-USD', 'COINBASE:ETH-USD'];

// === Track last alerts ===
const lastAlerts = {};

async function scanMarket() {
  try {
    // === STOCK SCANNER ===
    for (const symbol of STOCKS) {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const response = await axios.get(url);
      const { c: current, pc: prev } = response.data;

      if (!current || !prev) continue;

      const percentChange = ((current - prev) / prev) * 100;

      if (Math.abs(percentChange) >= 5 && lastAlerts[symbol] !== current) {
        await sendTelegramAlert(`📈 STOCK ALERT\n\nSymbol: ${symbol}\nChange: ${percentChange.toFixed(2)}%\nPrice: $${current}`);
        lastAlerts[symbol] = current;
      }
    }

    // === CRYPTO SCANNER ===
    for (const symbol of CRYPTOS) {
      const url = `https://finnhub.io/api/v1/crypto/candle?symbol=${symbol}&resolution=1&count=1&token=${FINNHUB_API_KEY}`;
      const response = await axios.get(url);
      const { c, pc } = response.data;

      if (!c || !pc) continue;

      const current = c[0];
      const prev = pc[0];
      const percentChange = ((current - prev) / prev) * 100;

      if (Math.abs(percentChange) >= 5 && lastAlerts[symbol] !== current) {
        await sendTelegramAlert(`₿ CRYPTO ALERT\n\nSymbol: ${symbol}\nChange: ${percentChange.toFixed(2)}%\nPrice: $${current}`);
        lastAlerts[symbol] = current;
      }
    }

  } catch (error) {
    console.error('Market Scanner Error:', error.message);
  }
}

setInterval(scanMarket, 30 * 1000); // every 30 seconds

module.exports = scanMarket;
