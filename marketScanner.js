const axios = require('axios');
const sendTelegramAlert = require('./sendTelegramAlert');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;

const STOCKS = ['AAPL', 'TSLA', 'NVDA'];
const CRYPTOS = ['COINBASE:BTC-USD', 'COINBASE:ETH-USD'];
const GOLD_SYMBOL = 'XAU/USD';

async function scanGold() {
  try {
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(GOLD_SYMBOL)}&apikey=${TWELVE_DATA_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data || !data.close || !data.previous_close) {
      console.error('Invalid gold data:', data);
      return;
    }

    const price = parseFloat(data.close);
    const prevClose = parseFloat(data.previous_close);
    const change = price - prevClose;
    const percentChange = (change / prevClose) * 100;

    const direction = change > 0 ? 'UP' : 'DOWN';
    const action = change < -0.5 ? '🔴 Possible short or rebound' : change > 0.5 ? '🟢 Momentum building' : '🟡 Watch closely';

    const alertMsg = `🚨 GOLD ALERT\n\nSymbol: ${GOLD_SYMBOL}\nDirection: ${direction}\nPrice: $${price.toFixed(2)} (${percentChange.toFixed(2)}%)\n⏱ ${new Date().toLocaleTimeString()}\n${action}`;
    await sendTelegramAlert(alertMsg);
    console.log('✅ Gold alert sent.');
  } catch (error) {
    console.error('Error fetching gold data:', error.response?.data || error.message);
  }
}

async function scanStocks() {
  for (const symbol of STOCKS) {
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const res = await axios.get(url);
      const d = res.data;

      const change = d.c - d.pc;
      const percent = (change / d.pc) * 100;

      if (Math.abs(percent) >= 5) {
        const direction = percent > 0 ? '📈 UP' : '📉 DOWN';
        const message = `🚨 STOCK ALERT\n\nTicker: ${symbol}\nDirection: ${direction}\nCurrent: $${d.c.toFixed(2)}\nChange: ${percent.toFixed(2)}%\n⏱ ${new Date().toLocaleTimeString()}\n💡 Triggered 5%+ movement`;
        await sendTelegramAlert(message);
        console.log(`✅ Stock alert sent: ${symbol}`);
      }
    } catch (err) {
      console.error(`Stock error (${symbol}):`, err.response?.data || err.message);
    }
  }
}

async function scanCrypto() {
  for (const symbol of CRYPTOS) {
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const res = await axios.get(url);
      const d = res.data;

      const change = d.c - d.pc;
      const percent = (change / d.pc) * 100;

      if (Math.abs(percent) >= 3) {
        const direction = percent > 0 ? '📈 UP' : '📉 DOWN';
        const message = `🚨 CRYPTO ALERT\n\nPair: ${symbol}\nDirection: ${direction}\nPrice: $${d.c.toFixed(2)}\nChange: ${percent.toFixed(2)}%\n⏱ ${new Date().toLocaleTimeString()}\n⚠️ 3%+ movement detected`;
        await sendTelegramAlert(message);
        console.log(`✅ Crypto alert sent: ${symbol}`);
      }
    } catch (err) {
      console.error(`Crypto error (${symbol}):`, err.response?.data || err.message);
    }
  }
}

async function marketScanner() {
  await scanGold();
  await scanStocks();
  await scanCrypto();
}

setInterval(marketScanner, 30000); // every 30 seconds
marketScanner();

module.exports = marketScanner;
