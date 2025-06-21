const axios = require('axios');

async function fetchGoldPrice() {
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/GC=F';
  try {
    const response = await axios.get(url, {
      params: {
        region: 'US',
        lang: 'en-US',
        includePrePost: false,
        interval: '1m',
        range: '1d',
      },
    });

    const result = response.data.chart.result[0];
    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose;

    return { currentPrice, previousClose };
  } catch (error) {
    console.error('❌ Error fetching gold price:', error.message);
    return null;
  }
}

function analyzeGold({ currentPrice, previousClose }) {
  const priceChangePercent = ((currentPrice - previousClose) / previousClose) * 100;

  if (priceChangePercent >= 0.5) {
    return {
      type: 'BUY',
      message: `📈 GOLD BUY SIGNAL\nCurrent Price: $${currentPrice.toFixed(2)}\nChange: +${priceChangePercent.toFixed(2)}%`,
    };
  }

  if (priceChangePercent <= -0.5) {
    return {
      type: 'SELL',
      message: `📉 GOLD SELL SIGNAL\nCurrent Price: $${currentPrice.toFixed(2)}\nChange: ${priceChangePercent.toFixed(2)}%`,
    };
  }

  return null;
}

module.exports = async function marketScanner() {
  const priceData = await fetchGoldPrice();
  if (!priceData) return [];

  const signal = analyzeGold(priceData);
  if (signal) {
    return [signal.message];
  }

  console.log('ℹ️ No opportunities found at this time.');
  return [];
};
