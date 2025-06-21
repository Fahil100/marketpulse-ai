const axios = require('axios');
const sendTelegramAlert = require('./sendTelegramAlert');

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const GOLD_SYMBOL = 'XAU/USD';

async function fetchGoldPrice() {
  try {
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(GOLD_SYMBOL)}&apikey=${TWELVE_DATA_API_KEY}`;
    const response = await axios.get(url);

    if (response.data && response.data.price) {
      return parseFloat(response.data.price);
    } else {
      console.warn('No price data returned for gold:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching gold price:', error.message);
    return null;
  }
}

async function scanMarket() {
  console.log('📡 Scanning gold market...');

  const price = await fetchGoldPrice();
  if (!price) {
    console.log('⚠️ Skipping alert: No price received.');
    return;
  }

  // LIVE TRADING SIGNAL: Very basic logic, expand as needed
  if (price > 3400) {
    await sendTelegramAlert(`📈 GOLD BUY SIGNAL\nCurrent Price: $${price.toFixed(2)}\nConditions met. Consider buying.`);
  } else if (price < 3350) {
    await sendTelegramAlert(`📉 GOLD SELL SIGNAL\nCurrent Price: $${price.toFixed(2)}\nConditions met. Consider selling.`);
  } else {
    console.log('ℹ️ No opportunities found at this time.');
  }
}

scanMarket();
