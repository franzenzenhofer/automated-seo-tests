// tests/js_on_off.js

const iPhone13 = {
  name: 'iPhone 13',
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  viewport: {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    isLandscape: false,
  },
};

const takeScreenshot = async (page, filepath) => {
  await page.screenshot({ path: filepath });
  console.log(`Screenshot saved at: ${filepath}`);
};

const runTest = async (page, url, jsEnabled, pageType) => {
  await page.setUserAgent(iPhone13.userAgent);
  await page.setViewport(iPhone13.viewport);
  await page.setJavaScriptEnabled(jsEnabled);

  await page.goto(url, { waitUntil: 'networkidle2' });
  const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
  const prefix = jsEnabled ? 'js-on' : 'js-off';
  const filepath = `screenshots/${prefix}_${pageType}_${timestamp}.png`; // Add pageType

  await takeScreenshot(page, filepath);
};

module.exports = async (browser, pageType, url) => {
  const page = await browser.newPage();

  // Run the test with JS enabled
  await runTest(page, url, true, pageType);

  // Run the test with JS disabled
  await runTest(page, url, false, pageType);

  await page.close();
};
