// tests/mobile_friendly.js

const readline = require('readline');
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

  const updatedUrl = page.url();
  console.log(`Updated Mobile-Friendly test URL for ${pageType}: ${updatedUrl}`);
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




