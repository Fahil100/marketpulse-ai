const TelegramBot = require("node-telegram-bot-api");

// 🔒 Replace these with your actual values
const TELEGRAM_TOKEN = "7697144054:AAE-LA8yLnEUUpAVML-8g-mL1NAQBIPKZuU";
const TELEGRAM_CHAT_ID = "-1002890614666";

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

bot.sendMessage(TELEGRAM_CHAT_ID, "🚨 This is a test alert from test-telegram.js!", { parse_mode: "HTML" })
  .then(() => console.log("✅ Test alert sent successfully."))
  .catch((err) => console.error("❌ Failed to send alert:", err.message));
