const fs = require("fs");
const puppeteer = require("puppeteer");
const config = require("./config");

const pagespeedTest = require("./tests/pagespeed");
const jsOnOffTest = require("./tests/js_on_off");
const mobileFriendlyTest = require("./tests/mobile_friendly");
const urlInspectionTest = require("./tests/url_inspection");

const { logToCsv } = require('./utils'); // Import logToCsv

const screenshotDir = "screenshots";

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      executablePath: config.chromePath,
    });
  } catch (error) {
    console.error("Error launching the browser:", error);
    return;
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
      jsOnScreenshot: jsOnOffData.jsOnScreenshotPath,
      jsOffScreenshot: jsOnOffData.jsOffScreenshotPath,
      inspectUrlTestUrl: urlInspectionData.testUrl,
      inspectUrlScreenshot: urlInspectionData.screenshotPath,
      inspectUrlResourcesScreenshot: urlInspectionData.resourcesScreenshotPath,
    };

    logToCsv(pageType, data);

    isFirstPage = false;
  }

  await browser.close();
})();
