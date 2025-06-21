const axios = require('axios');
const goldAnalyzer = require('./goldAnalyzer');

const TEST_MODE = true; // 🔁 Set to false to re-enable real scanning logic

module.exports = async function marketScanner() {
  if (TEST_MODE) {
    // ✅ This block sends a fake alert to test Telegram + Render connection
    return [
      {
        symbol: 'XAUUSD',
        price: 2350,
        signal: 'BUY',
        reason: 'Test opportunity for automation system validation.'
      }
    ];
  }

  // 🧠 This is your actual scanning logic
  try {
    const goldData = await goldAnalyzer();

    if (goldData && goldData.length > 0) {
      return goldData; // Pass real gold opportunities
    }

    return []; // No real opportunities
  } catch (err) {
    console.error('Market scan error:', err.message);
    return [];
  }
};
