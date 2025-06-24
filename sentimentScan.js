const axios = require('axios');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Dummy placeholder — replace with real API later
async function getSentimentSummary(ticker) {
  try {
    const redditComments = await fetchDummyReddit(ticker);
    const twitterMentions = await fetchDummyTwitter(ticker);

    const allText = redditComments.concat(twitterMentions).join(' ');
    const result = sentiment.analyze(allText);

    if (result.score > 3) return 'Very Bullish';
    if (result.score > 1) return 'Bullish';
    if (result.score < -3) return 'Very Bearish';
    if (result.score < -1) return 'Bearish';
    return 'Neutral';
  } catch (err) {
    return 'Unknown';
  }
}

// Replace with Reddit API
async function fetchDummyReddit(ticker) {
  return [
    `${ticker} is heating up on r/WallStreetBets!`,
    `Huge upside on ${ticker}.`
  ];
}

// Replace with Twitter API
async function fetchDummyTwitter(ticker) {
  return [
    `Traders piling into ${ticker} options.`,
    `${ticker} just got upgraded by major analyst.`
  ];
}

module.exports = { getSentimentSummary };
