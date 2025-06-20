const sendTelegramAlert = require('./sendTelegramAlert');

function runMarketScanner() {
  const message = `
🚨 TRADE ALERT (SIMULATION)

Ticker: $AAPL
Change: +5.3% today
RSI: 29 — Oversold Rebound
Volume Spike: 📈 2.1× normal
News: “Apple launches breakthrough AI product”

🔵 Entry Signal: BUY
🎯 Target: +9–12% gain
⏱ Timeframe: 1–3 days
  `;

  sendTelegramAlert(message);
  console.log("✅ Simulated trade alert sent to Telegram.");
}

runMarketScanner();
setInterval(runMarketScanner, 30000);
