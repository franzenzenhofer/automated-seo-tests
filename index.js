const fs = require('fs');
const puppeteer = require('puppeteer');
const config = require('./config');

const screenshotDir = 'screenshots';
const pagespeedUrl = 'https://pagespeed.web.dev/analysis?url=';

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

const runPageSpeedTest = async (page, url) => {
  const psiUrl = `${pagespeedUrl}${encodeURIComponent(url)}`;
  await page.goto(psiUrl);

  await page.waitForSelector('.lh-report', { timeout: 60000 });
  return psiUrl;
};

const clickOkGotIt = async (page, isFirstPage) => {
  if (!isFirstPage) return;

  try {
    await page.waitForXPath("//button[contains(., 'Ok, Got it.')]", {
      timeout: 10000,
    });

    const [button] = await page.$x("//button[contains(., 'Ok, Got it.')]");
    if (button) {
      await button.click();
      console.log('Clicked "Ok, Got it." button');
    }
  } catch (err) {
    console.warn('Cookie banner not found or could not be clicked:', err);
  }
};

const takeScreenshot = async (page, filepath) => {
  try {
    const performanceDiv = await page.$('div#performance');
    const opportunitiesTitle = await page.$x("//span[contains(., 'Opportunities') and contains(@class, 'lh-audit-group__title')]");

    if (performanceDiv && opportunitiesTitle.length) {
      const performanceBox = await performanceDiv.boundingBox();
      const opportunitiesBox = await opportunitiesTitle[0].boundingBox();

      const clip = {
        x: performanceBox.x,
        y: performanceBox.y,
        width: performanceBox.width,
        height: opportunitiesBox.y + opportunitiesBox.height - performanceBox.y,
      };

      // Adding a timeout to allow animations to finish
      await page.waitForTimeout(1500);

      await page.screenshot({ path: filepath, clip });
      console.log(`Screenshot saved at: ${filepath}`);
    } else {
      console.warn('Unable to capture screenshot due to missing elements.');
    }
  } catch (err) {
    console.error(`Error taking screenshot for ${filepath}:`, err);
  }
};

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  let isFirstPage = true;
  for (const [pageType, url] of Object.entries(config)) {
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({
      width: 1280,
      height: 800,
    });

    try {
      const psiUrl = await runPageSpeedTest(page, url);

      await clickOkGotIt(page, isFirstPage);

      const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
      const filepath = `${screenshotDir}/${pageType}_${timestamp}.png`;

      await takeScreenshot(page, filepath);

      const updatedUrl = page.url();
      console.log(`Updated PageSpeed Insights test URL for ${pageType}: ${updatedUrl}`);
    } catch (err) {
      console.error(`Error running PageSpeed test for ${url}:`, err);
    }

    await page.close();

    // Set isFirstPage to false after the first test
    isFirstPage = false;
  }

  await browser.close();
})();
