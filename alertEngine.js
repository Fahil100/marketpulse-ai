const axios = require('axios');
require('dotenv').config();

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function scanMarket() {
  const alerts = [];

  const stockUniverse = await fetchStockUniverse();
  const filtered = stockUniverse.filter(s => s.price < 5 && s.volume > 500000);
  const tickers = filtered.slice(0, 150).map(s => s.symbol);

  for (const ticker of tickers) {
    const [priceData, insider, shortInterest, options] = await Promise.all([
      fetchStockData(ticker),
      fetchInsiderActivity(ticker),
      fetchShortInterest(ticker),
      fetchOptionsVolume(ticker)
    ]);

    let bullishScore = 0;
    const reasons = [];

    if (priceData.breakout) {
      bullishScore++;
      reasons.push('📈 Breakout above recent highs');
    }
    if (insider === 'buy') {
      bullishScore++;
      reasons.push('🧑‍💼 Insider buying activity');
    }
    if (shortInterest > 20) {
      bullishScore++;
      reasons.push(`🔥 High short interest: ${shortInterest}%`);
    }
    if (options.unusual) {
      bullishScore++;
      reasons.push('💥 Unusual call option volume');
    }

    if (bullishScore >= 3) {
      alerts.push({
        ticker,
        reason: reasons.join('\n'),
        signalType: 'Bullish Multi-Signal',
        confidence: bullishScore / 4
      });
    }
    await sleep(800);
  }

  for (const symbol of ['BTC/USD', 'ETH/USD', 'XAU/USD', 'XAG/USD', 'WTI/USD']) {
    const price = await fetchTwelveDataPrice(symbol);
    if (price && price.trendingUp) {
      alerts.push({
        ticker: symbol,
        reason: `🚀 ${symbol} is trending upward`,
        signalType: 'Momentum',
        confidence: 0.85
      });
    }
    await sleep(1000);
  }

  return alerts;
}

async function fetchStockUniverse() {
  try {
    const url = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${FINNHUB_KEY}`;
    const res = await axios.get(url);
    const quotes = await Promise.all(res.data.slice(0, 500).map(async (s) => {
      try {
        const quote = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${s.symbol}&token=${FINNHUB_KEY}`);
        return {
          symbol: s.symbol,
          price: quote.data.c,
          volume: quote.data.v
        };
      } catch {
        return null;
      }
    }));
    return quotes.filter(q => q);
  } catch {
    return [];
  }
}

async function fetchStockData(ticker) {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&apikey=${ALPHA_KEY}`;
    const res = await axios.get(url);
    const data = res.data['Time Series (5min)'];
    const prices = Object.values(data).map((bar) => parseFloat(bar['4. close']));
    const breakout = prices[0] > Math.max(...prices.slice(1, 6));
    return { breakout };
  } catch {
    return { breakout: false };
  }
}

async function fetchInsiderActivity(ticker) {
  try {
    const url = `https://finnhub.io/api/v1/stock/insider-transactions?symbol=${ticker}&token=${FINNHUB_KEY}`;
    const res = await axios.get(url);
    const txs = res.data.data || [];
    const recent = txs.filter(tx => tx.transactionCode === 'P' && tx.share > 10000);
    return recent.length ? 'buy' : 'none';
  } catch {
    return 'none';
  }
}

async function fetchShortInterest(ticker) {
  try {
    const url = `https://finnhub.io/api/v1/stock/short-interest?symbol=${ticker}&token=${FINNHUB_KEY}`;
    const res = await axios.get(url);
    return res.data.shortInterest || 0;
  } catch {
    return 0;
  }
}

async function fetchOptionsVolume(ticker) {
  try {
    const url = `https://finnhub.io/api/v1/stock/option-chain?symbol=${ticker}&token=${FINNHUB_KEY}`;
    const res = await axios.get(url);
    const calls = res.data.data.filter(opt => opt.type === 'CALL');
    const totalCallVol = calls.reduce((sum, o) => sum + (o.volume || 0), 0);
    return { unusual: totalCallVol > 10000 };
  } catch {
    return { unusual: false };
  }
}

async function fetchTwelveDataPrice(symbol) {
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=15min&apikey=${TWELVE_DATA_KEY}`;
    const res = await axios.get(url);
    const series = res.data.values;
    const trendingUp = parseFloat(series[0].close) > parseFloat(series[4].close);
    return { trendingUp };
  } catch {
    return null;
  }
}

module.exports = { scanMarket };
