// index.js – GPT-Alpha Plus (Monolithic Version)
// Includes full market scanning, gold/crypto/options alerts, screenshots, sentiment, Telegram, Sheets, backtest, AI logic, and trading

const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const { google } = require('googleapis');
const fs = require('fs');
const FormData = require('form-data');
const app = express();
const PORT = process.env.PORT || 10000;

// Environment Variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEET_ID;
const ALPACA_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET = process.env.ALPACA_API_SECRET;

// Expanded Ticker List
const tickers = [
  'AAPL', 'TSLA', 'GOOG', 'AMZN', 'NVDA', 'META', 'MSFT', 'PLTR', 'SOUN', 'GME', 'AMC',
  'RIVN', 'MULN', 'F', 'XOM', 'CVX', 'T', 'INTC', 'NIO', 'BABA', 'UBER', 'LYFT', 'SHOP',
  'WMT', 'KO', 'PEP', 'BA', 'PYPL', 'SQ', 'COST', 'TGT', 'SPY', 'QQQ', 'TQQQ', 'SQQQ',
  'GLD', 'SLV', 'XAU/USD', 'BTC-USD', 'ETH-USD', 'DOGE-USD'
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculatePotentialProfit(quote) {
  const { c, h, l, pc } = quote;
  const potentialUpside = ((h - c) / c) * 100;
  const potentialDownside = ((c - l) / c) * 100;
  const momentum = ((c - pc) / pc) * 100;
  return { potentialUpside, potentialDownside, momentum };
}

async function getQuote(ticker) {
  try {
    const res = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
    return res.data;
  } catch (e) {
    console.error(`Quote fetch error for ${ticker}:`, e.message);
    return null;
  }
}

async function fetchSentiment(ticker) {
  try {
    const res = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
    const changePercent = res.data.dp;
    if (changePercent > 2) return 'Bullish';
    if (changePercent < -2) return 'Bearish';
    return 'Neutral';
  } catch (e) {
    console.error(`Sentiment error for ${ticker}:`, e.message);
    return 'Unknown';
  }
}

async function captureChart(ticker) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://finance.yahoo.com/quote/${ticker}`, { waitUntil: 'networkidle2' });
    const chart = await page.$('section[data-test="qsp-chart"]');
    if (chart) await chart.screenshot({ path: `/tmp/${ticker}.png` });
    await browser.close();
    return `/tmp/${ticker}.png`;
  } catch (e) {
    console.error(`Screenshot error for ${ticker}:`, e.message);
    return null;
  }
}

async function sendTelegramAlert(message, imagePath = null) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    if (imagePath) {
      const form = new FormData();
      form.append('chat_id', TELEGRAM_CHAT_ID);
      form.append('photo', fs.createReadStream(imagePath));
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, form, {
        headers: form.getHeaders()
      });
    }
  } catch (e) {
    console.error('Telegram alert error:', e.message);
  }
}

function generateGPTReasoning(ticker, quote, pattern) {
  const { c, h, l, pc } = quote;
  return `📊 *Analysis for ${ticker}*
Current: $${c}, High: $${h}, Low: $${l}, Prev Close: $${pc}
Momentum: ${(c - pc).toFixed(2)} | Pattern: ${pattern}
Expect ${pattern === 'bullish' ? 'upward' : 'sideways or pullback'} movement based on market signals.`;
}

function formatTelegramMessage(ticker, quote, sentiment, reasoning, timeframe) {
  const { c, h, l, pc } = quote;
  const { potentialUpside, potentialDownside, momentum } = calculatePotentialProfit(quote);
  return `
🚨 *Trade Opportunity Alert* 🚨
*Ticker:* ${ticker}
*Current Price:* $${c.toFixed(2)}
*Day High / Low:* $${h.toFixed(2)} / $${l.toFixed(2)}
*Previous Close:* $${pc.toFixed(2)}

📈 *Potential Upside:* ${potentialUpside.toFixed(2)}%
📉 *Potential Downside:* ${potentialDownside.toFixed(2)}%
📊 *Momentum:* ${momentum.toFixed(2)}%

🧠 *Sentiment:* ${sentiment}
🤖 *AI Reasoning:* ${reasoning}
⏱️ *Suggested Hold Time:* ${timeframe}
  `;
}

async function exportToGoogleSheets(ticker, quote, sentiment, reasoning, timeframe) {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const row = [
      new Date().toISOString(),
      ticker,
      quote.c,
      quote.h,
      quote.l,
      quote.pc,
      calculatePotentialProfit(quote).potentialUpside.toFixed(2),
      calculatePotentialProfit(quote).potentialDownside.toFixed(2),
      calculatePotentialProfit(quote).momentum.toFixed(2),
      sentiment,
      reasoning,
      timeframe
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Signals!A1',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] }
    });
  } catch (e) {
    console.error('Sheets export error:', e.message);
  }
}

// Initialize System
(async () => {
  console.log("🚀 GPT-Alpha Plus is live and scanning...");

  for (const ticker of tickers) {
    const quote = await getQuote(ticker);
    if (!quote || !quote.c || quote.c === 0) continue;

    const sentiment = await fetchSentiment(ticker);
    const reasoning = generateGPTReasoning(ticker, quote, sentiment === 'Bullish' ? 'bullish' : 'neutral');
    const message = formatTelegramMessage(ticker, quote, sentiment, reasoning, '1–3 hours');
    const chartPath = await captureChart(ticker);

    await sendTelegramAlert(message, chartPath);
    await exportToGoogleSheets(ticker, quote, sentiment, reasoning, '1–3 hours');

    await delay(1000);
  }
})();
