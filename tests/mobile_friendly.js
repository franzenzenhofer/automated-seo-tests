const readline = require('readline');
const { logToCsv } = require('../utils');

const mobileFriendlyTestUrl = 'https://search.google.com/test/mobile-friendly?url=';

const waitForUserInput = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Press Enter to continue after solving the reCAPTCHA and after the Mobile Friendly Test is finished ...', () => {
      rl.close();
      resolve();
    });
  });
};

const takeScreenshot = async (page, filepath) => {
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Screenshot saved at: ${filepath}`);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runMobileFriendlyTest = async (page, url, pageType) => {
  const testUrl = `${mobileFriendlyTestUrl}${encodeURIComponent(url)}`;
  await page.goto(testUrl, { waitUntil: 'networkidle2' });

  console.log('Please solve the reCAPTCHA manually.');
  await waitForUserInput();

  // Click the 'View tested page' button
  try {
    await page.waitForXPath("//div[contains(., 'View tested page') and @role='button']", {
      timeout: 10000,
    });

    const [viewTestedPageBtn] = await page.$x(
      "//div[contains(., 'View tested page') and @role='button']"
    );

    if (viewTestedPageBtn) {
      await viewTestedPageBtn.click();
      console.log('Clicked "View tested page" button');
      await delay(2000);
    }
  } catch (err) {
    console.warn('Error clicking "View tested page" button:', err);
  }

  // Click the 'Screenshot' tab
  try {
    await page.waitForXPath("//div[contains(., 'screenshot') and @role='tab']", {
      timeout: 10000,
    });

    const [screenshotTab] = await page.$x(
      "//div[contains(., 'screenshot') and @role='tab']"
    );

    if (screenshotTab) {
      await screenshotTab.click();
      console.log('Clicked "Screenshot" tab');
    }
  } catch (err) {
    console.warn('Error clicking "Screenshot" tab:', err);
  }

  const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
  const filepath = `screenshots/mobile-friendly_${pageType}_${timestamp}.png`;

  await takeScreenshot(page, filepath);

  // Click the 'More Info' tab
  try {
    await page.waitForXPath("//div[contains(., 'more info') and @role='tab']", {
      timeout: 10000,
    });

    const [moreInfoTab] = await page.$x(
      "//div[contains(., 'more info') and @role='tab']"
    );

    if (moreInfoTab) {
      await moreInfoTab.click();
      console.log('Clicked "More Info" tab');
      await delay(1000);
    }
  } catch (err) {
    console.warn('Error clicking "More Info" tab:', err);
  }

  // Click the 'Page resources' tab
  try {
    await page.waitForXPath("//div[contains(., 'Page resources') and @role='button']", {
      timeout: 10000,
    });

    const [pageResources] = await page.$x(
      "//div[contains(., 'Page resources') and @role='button']"
    );

    if (pageResources) {
      await pageResources.click();
      console.log('Clicked "More Info" tab');
      await delay(1000);
    }
  } catch (err) {
    console.warn('Error clicking "Page Resources" tab:', err);
  }

  // Select the last <div data-leave-open-on-resize> element and take a screenshot
  const openOnResizeXPath = "//div[@data-leave-open-on-resize]";
  try {
    await page.waitForXPath(openOnResizeXPath, { timeout: 10000 });
    const openOnResizeDivs = await page.$x(openOnResizeXPath);

    if (openOnResizeDivs && openOnResizeDivs.length > 0) {
      const lastOpenOnResizeDiv = openOnResizeDivs[openOnResizeDivs.length - 1];
      const resourcesScreenshotPath = `screenshots/mobile-friendly-page-resources_${pageType}_${timestamp}.png`;
      await lastOpenOnResizeDiv.screenshot({ path: resourcesScreenshotPath });
      console.log(`Screenshot of embedded resources saved at: ${resourcesScreenshotPath}`);
    } else {
      console.warn('No <div data-leave-open-on-resize> elements found');
    }
  } catch (err) {
    console.warn('Error taking screenshot of embedded resources:', err);
  }

  const updatedUrl = page.url();
  console.log(`Updated Mobile-Friendly test URL for ${pageType}: ${updatedUrl}`);
  logToCsv(pageType, updatedUrl); 
};


module.exports = async (browser, pageType, url) => {
  const page = await browser.newPage();

  // Set the viewport size
  await page.setViewport({
    width: 1400,
    height: 1000,
  });

  await runMobileFriendlyTest(page, url, pageType); // Pass pageType as an argument

  await page.close();
};




