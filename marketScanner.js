const axios = require('axios');
const sendTelegramAlert = require('./sendTelegramAlert');

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// Tickers to monitor
const STOCKS = ['AAPL', 'TSLA', 'NVDA'];
const CRYPTOS = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT'];
const GOLD_SYMBOL = 'XAU/USD';

// === GOLD ===
async function scanGold() {
  try {
    const url = `https://api.twelvedata.com/quote?symbol=${GOLD_SYMBOL}&apikey=${TWELVE_DATA_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data || !data.close || !data.previous_close) return;

    const current = parseFloat(data.close);
    const prev = parseFloat(data.previous_close);
    const pct = ((current - prev) / prev) * 100;

    if (Math.abs(pct) >= 0.5) {
      const dir = pct > 0 ? 'UP' : 'DOWN';
      await sendTelegramAlert(`
🚨 GOLD ALERT

Symbol: ${GOLD_SYMBOL}
Direction: ${dir}
Price: $${current.toFixed(2)} (${pct.toFixed(2)}%)
⏱ ${new Date().toLocaleTimeString()}
${dir === 'UP' ? '🟢 Possible long entry' : '🔴 Possible short or rebound'}
      `);
      console.log("✅ Gold alert sent.");
    }
  } catch (err) {
    console.error("Gold scan error:", err.message);
  }
}

// === STOCKS ===
async function scanStocks() {
  for (const ticker of STOCKS) {
    try {
      const res = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
      const d = res.data;
      if (!d.c || !d.pc) continue;

      const pct = ((d.c - d.pc) / d.pc) * 100;
      if (Math.abs(pct) >= 2.5) {
        const dir = pct > 0 ? 'UP' : 'DOWN';
        await sendTelegramAlert(`
📈 STOCK ALERT

Ticker: $${ticker}
Change: ${pct.toFixed(2)}%
Price: $${d.c.toFixed(2)}
⏱ ${new Date().toLocaleTimeString()}
${dir === 'UP' ? '🟢 Momentum BUY zone' : '🔻 Dip or short opportunity'}
        `);
        console.log(`✅ Stock alert for ${ticker} sent.`);
      }
    } catch (err) {
      console.error(`Stock error (${ticker}):`, err.message);
    }
  }
}

// === CRYPTO ===
async function scanCrypto() {
  for (const symbol of CRYPTOS) {
    try {
      const res = await axios.get(`https://finnhub.io/api/v1/crypto/candle?symbol=${symbol}&resolution=1&count=2&token=${FINNHUB_API_KEY}`);
      const data = res.data;
      if (!data || !data.c || data.c.length < 2) continue;

      const prev = data.c[data.c.length - 2];
      const curr = data.c[data.c.length - 1];
      const pct = ((curr - prev) / prev) * 100;

      if (Math.abs(pct) >= 1.5) {
        const dir = pct > 0 ? 'UP' : 'DOWN';
        await sendTelegramAlert(`
💰 CRYPTO ALERT

Pair: ${symbol}
Change: ${pct.toFixed(2)}%
Price: $${curr.toFixed(2)}
⏱ ${new Date().toLocaleTimeString()}
${dir === 'UP' ? '🟢 Bullish momentum' : '🔻 Bearish move or dip buy?'}
        `);
        console.log(`✅ Crypto alert for ${symbol} sent.`);
      }
    } catch (err) {
      console.error(`Crypto error (${symbol}):`, err.message);
    }
  }
}

// === RUN ALL ===
async function runScanner() {
  await scanGold();
  await scanStocks();
  await scanCrypto();
}

runScanner();
setInterval(runScanner, 30000);
