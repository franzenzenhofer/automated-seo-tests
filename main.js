const fs = require("fs");
const puppeteer = require("puppeteer");
const readline = require('readline');
const config = require("./config");

// Importing required test modules.
const pagespeedTest = require("./tests/pagespeed");
const jsOnOffTest = require("./tests/js_on_off");
const mobileFriendlyTest = require("./tests/mobile_friendly");
const urlInspectionTest = require("./tests/url_inspection");

// Importing utilities.
const { logToCsv } = require('./utils');
const { saveCookies, loadCookies } = require('./utils/cookies');

const screenshotDir = "screenshots";

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

// Helper function to pause execution for a certain duration.
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1400, height: 900 },
    });
  } catch (error) {
    console.error("Error launching the browser:", error);
    return;
  }

  const page = await browser.newPage();
  await page.goto('https://accounts.google.com');

  try {
    await loadCookies(page);
  } catch (error) {
    if (error.message === 'No cookies file found.') {
      console.log('Navigating to Google sign in page.');
      await page.goto('https://accounts.google.com/signin');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      await new Promise((resolve, reject) => {
        rl.question("Please login to your Google account in the browser then press Enter to continue...", function (answer) {
          resolve();
        });
      });

      rl.close();

      await saveCookies(page);

      await sleep(2000);
    } else {
      console.error(`Error loading cookies: ${error}`);
      process.exit(1);
    }
  }

  let isFirstPage = true;
  for (const [pageType, url] of Object.entries(config.pages)) {
    const pagespeedData = await pagespeedTest(browser, pageType, url, isFirstPage);
    const jsOnOffData = await jsOnOffTest(browser, pageType, url);
    const mobileFriendlyData = await mobileFriendlyTest(browser, pageType, url);
    const urlInspectionData = await urlInspectionTest(browser, pageType, url);

    const data = {
      pageUrl: url,
      pagespeedInsightsTestUrl: pagespeedData.testUrl,
      pagespeedInsightsScreenshot: pagespeedData.screenshotPath,
      mobileFriendlyTestUrl: mobileFriendlyData.testUrl,
      mobileFriendlyScreenshot: mobileFriendlyData.screenshotPath,
      mobileFriendlyResourcesScreenshot: mobileFriendlyData.resourcesScreenshotPath,
      jsOnScreenshot: jsOnOffData.jsOnResults.screenshotPath,
      jsOffScreenshot: jsOnOffData.jsOffResults.screenshotPath,
      inspectUrlTestUrl: urlInspectionData.testUrl,
      inspectUrlScreenshot: urlInspectionData.screenshotPath,
      inspectUrlResourcesScreenshot: urlInspectionData.resourcesScreenshotPath,
    };

    logToCsv(pageType, data);

    isFirstPage = false;
  }

  await browser.close();
})();
