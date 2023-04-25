const fs = require('fs');
const puppeteer = require('puppeteer');
const config = require('./config');

const pagespeedTest = require('./tests/pagespeed');
const jsOnOffTest = require('./tests/js_on_off'); // Add this line

const screenshotDir = 'screenshots';

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: config.chromePath,
    args: ['--incognito'],
  });

  let isFirstPage = true;
  for (const [pageType, url] of Object.entries(config.pages)) {
    await pagespeedTest(browser, pageType, url, isFirstPage);
    await jsOnOffTest(browser, pageType, url); // Add this line
    isFirstPage = false;
  }

  await browser.close();
})();