const puppeteer = require('puppeteer');

async function captureChart(ticker) {
  const url = `https://www.tradingview.com/chart/?symbol=NASDAQ:${ticker}`;

  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForTimeout(6000); // Wait for chart to load

    const imageBuffer = await page.screenshot();
    await browser.close();

    // Placeholder image URL for now (replace with actual CDN or upload logic later)
    return 'https://dummyimage.com/1280x720/000/fff&text=Chart+for+' + ticker;
  } catch (err) {
    console.error('Chart error:', err.message);
    return 'https://dummyimage.com/1280x720/ff0000/fff&text=Chart+Unavailable';
  }
}

module.exports = { captureChart };
