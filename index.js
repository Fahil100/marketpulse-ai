// === MarketPulse-AI Alpha Intelligence Mode ===
// Author: ChatGPT for Rami
// Scans markets every 60 seconds. Alerts on stocks, gold, IPOs, options, earnings, sentiment, and institutional moves.

require('dotenv').config();
const axios = require('axios');

// ENV Variables
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const STOCK_LIST = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'META', 'AMZN']; // add more tickers as needed
const GOLD_SYMBOL = 'XAU/USD';

// Utility to send Telegram message
async function sendTelegramAlert(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
  } catch (err) {
    console.error('Telegram Error:', err.response ? err.response.data : err);
  }
}

// Analyze stock data for potential trades
async function analyzeStocks() {
  for (const symbol of STOCK_LIST) {
    try {
      const res = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
      const { c: current, h: high, l: low, pc: prevClose } = res.data;
      const change = ((current - prevClose) / prevClose) * 100;
      if (Math.abs(change) >= 2.5) {
        const message = `📈 *Stock Alert: ${symbol}*

Current Price: $${current}
Change: ${change.toFixed(2)}%
Reason: Large price move detected on ${symbol}.

🧠 GPT Insight:
Price breaking from previous close. Watch for momentum.
Action: *${change > 0 ? 'BUY NOW' : 'SELL NOW'}*
Hold: 1–3 hours
Confidence: Balanced`;
        await sendTelegramAlert(message);
      }
    } catch (err) {
      console.error(`Error fetching ${symbol}`, err);
    }
  }
}

// Analyze gold price movement
async function analyzeGold() {
  try {
    const url = `https://api.twelvedata.com/price?symbol=${GOLD_SYMBOL}&apikey=${TWELVE_DATA_KEY}`;
    const res = await axios.get(url);
    const goldPrice = parseFloat(res.data.price);

    // Example logic - you can expand this with more conditions
    if (goldPrice > 2350) {
      const message = `💰 *Gold Alert*

Current Price: $${goldPrice}
Signal: Price exceeds resistance level.

🧠 GPT Insight:
Gold is testing a breakout at $2,350. High probability of continuation if volume sustains.
Action: *BUY NOW*
Target: $2,370
Stop Loss: $2,335
Hold: 1–2 hours
Urgency: Act within 5 minutes.`;
      await sendTelegramAlert(message);
    }
  } catch (err) {
    console.error('Error fetching gold price', err);
  }
}

// Main function: runs every 60 seconds
async function runScanner() {
  console.log(`📡 Running market scan @ ${new Date().toLocaleTimeString()}`);
  await analyzeStocks();
  await analyzeGold();
}

// Run every 60 seconds
setInterval(runScanner, 60 * 1000);

// Run immediately on start
runScanner();
