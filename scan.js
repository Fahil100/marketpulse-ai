const marketScanner = require('./marketScanner');
const sendTelegramAlert = require('./sendTelegramAlert');

(async () => {
  try {
    const opportunities = await marketScanner();

    if (Array.isArray(opportunities) && opportunities.length > 0) {
      await sendTelegramAlert(opportunities);
      console.log('✅ Alerts sent for opportunities:', opportunities);
    } else {
      console.log('ℹ️ No opportunities found at this time.');
    }
  } catch (error) {
    console.error('❌ Error in scan script:', error.message);
    process.exit(1); // Fail the job if there's an error
  }
})();