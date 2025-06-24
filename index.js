# Full working clean index.js file based on all integrated features and corrections
index_js_code = """
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { exec } = require("child_process");
const app = express();
const PORT = process.env.PORT || 10000;

// Load API Keys from environment variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TWELVE_API_KEY = process.env.TWELVE_DATA_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const ALPACA_API_KEY = process.env.ALPACA_API_KEY || "SIMULATED";

// Serve static files from public folder
app.use(express.static("public"));
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Load tickers from JSON file
let tickers = [];
try {
  const data = fs.readFileSync("tickers.json", "utf8");
  tickers = JSON.parse(data);
} catch (e) {
  console.error("❌ Error loading tickers.json:", e.message);
}

// Cooldown tracker
const cooldowns = new Map();

// Helper: Send Telegram Alert
async function sendTelegramAlert(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    });
  } catch (e) {
    console.error("Telegram error:", e.message);
  }
}

// Helper: Get sentiment (using quote data)
async function getSentiment(ticker) {
  try {
    const res = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
    return res.data.dp || 0; // Return percentage change
  } catch (e) {
    console.error(`Sentiment error for ${ticker}:`, e.message);
    return 0;
  }
}

// Helper: Export to Google Sheets (placeholder)
function exportToGoogleSheets(ticker) {
  console.log(`📘 Exporting to Google Sheets: ${ticker}`);
}

// Helper: Screenshot to CDN (placeholder)
function uploadScreenshotToCDN(ticker) {
  console.log(`📸 Uploading chart screenshot for ${ticker}`);
}

// Helper: Simulated Alpaca Trade
function simulateAlpacaTrade(ticker) {
  console.log(`💰 Simulated Alpaca trade for: ${ticker}`);
}

// Main scanner
async function scanMarket() {
  console.log("📡 Running scan at", new Date().toISOString());

  for (let ticker of tickers) {
    const lastAlert = cooldowns.get(ticker) || 0;
    const now = Date.now();
    if (now - lastAlert < 60 * 60 * 1000) continue;

    try {
      const res = await axios.get(`https://api.twelvedata.com/quote?symbol=${ticker}&apikey=${TWELVE_API_KEY}`);
      const price = parseFloat(res.data.close);
      const prevClose = parseFloat(res.data.previous_close);
      const percentChange = ((price - prevClose) / prevClose) * 100;

      const sentiment = await getSentiment(ticker);
      const signalScore = percentChange + sentiment;

      if (signalScore > 5) {
        const alertMsg = `🚨 *TRADE ALERT*\nTicker: ${ticker}\nPrice: $${price}\nChange: ${percentChange.toFixed(2)}%\nSentiment: ${sentiment.toFixed(2)}%\nAction: *Buy* now or on breakout above $${(price * 1.01).toFixed(2)}`;
        await sendTelegramAlert(alertMsg);
        exportToGoogleSheets(ticker);
        uploadScreenshotToCDN(ticker);
        simulateAlpacaTrade(ticker);
        cooldowns.set(ticker, now);
      }
    } catch (err) {
      console.error(`❌ Scan error for ${ticker}:`, err.message);
    }
  }
}

// Auto-scan every 1 minute
setInterval(scanMarket, 60 * 1000);

// Start Express server
app.listen(PORT, () => {
  console.log(`✅ Server live on port ${PORT}`);
});
"""

# Save to file
file_path.write_text(index_js_code)
file_path.name
