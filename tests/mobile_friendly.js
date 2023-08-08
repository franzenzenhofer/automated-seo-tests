const { captureScreenshot } = require('../utils/screenshot');
const { sleep, waitForElementByXPath, waitAndClickByXPath } = require('../utils/navigation');
const { getSiteUrl, sanitizeString } = require('../utils/sanitizers');

const siteUrl = getSiteUrl(clean = true);

let result;

const runMobileFriendlyTest = async (page, url, pageType) => {
  const testUrl = `https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(url)}`;
  await page.goto(testUrl, { waitUntil: 'networkidle2' });

  // Wait for the test to finish.
  const testCompleteXPath = "//div[@data-text='Test results']"
  await waitForElementByXPath(page, testCompleteXPath, 120000);

  await sleep(1000);

  // Click the 'View tested page' button.
  await waitAndClickByXPath(page, "//div[contains(., 'View tested page') and @role='button']");

  // Click the 'Screenshot' tab.
  await waitAndClickByXPath(page, "//div[contains(., 'screenshot') and @role='tab']");

  // Capture test result screenshot.
  result = await captureScreenshot(page, siteUrl, null, `mobile-friendly_${sanitizeString(pageType)}`);
  console.log(result);

  // Click the 'More Info' tab.
  await waitAndClickByXPath(page, "//div[contains(., 'more info') and @role='tab']");

  // Click the 'Page resources' tab.
  await waitAndClickByXPath(page, "//div[contains(., 'Page resources') and @role='button']");

  // Select the last <div data-leave-open-on-resize> element and take a screenshot
  const openOnResizeXPath = "//div[@data-leave-open-on-resize]";
  try {
    await page.waitForXPath(openOnResizeXPath, { timeout: 10000 });
    const openOnResizeDivs = await page.$x(openOnResizeXPath);

    if (openOnResizeDivs && openOnResizeDivs.length > 0) {
      const lastOpenOnResizeDiv = openOnResizeDivs[openOnResizeDivs.length - 1];
      result = await captureScreenshot(lastOpenOnResizeDiv, siteUrl, null, `mobile-friendly-page-resources_${sanitizeString(pageType)}`);
      console.log(result);
    } else {
      console.warn('No <div data-leave-open-on-resize> elements found');
    }
  } catch (err) {
    console.warn('Error taking screenshot of embedded resources:', err);
  }

  const updatedUrl = page.url();

  return {
    testUrl: updatedUrl,
    //screenshotPath: filepath,
    //resourcesScreenshotPath: resourcesScreenshotPath,
  };
};

module.exports = async (browser, pageType, url) => {
  const page = await browser.newPage();

  // Set the viewport size
  await page.setViewport({
    width: 1400,
    height: 1000,
  });

  const mobileFriendlyData = await runMobileFriendlyTest(page, url, pageType);

  await page.close();

  return mobileFriendlyData;
};