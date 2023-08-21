const { captureScreenshot } = require('../utils/screenshot');
const { sleep, waitForElementByXPath, waitAndClickByXPath } = require('../utils/navigation');
const { sanitizeString } = require('../utils/sanitizers');
const markdown = require('../utils/markdown');

let inspectScreenshot;
let resourcesScreenshot;

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
  inspectScreenshot = await captureScreenshot(page, null, `mobile-friendly_${sanitizeString(pageType)}`);

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
      resourcesScreenshot = await captureScreenshot(lastOpenOnResizeDiv, null, `mobile-friendly-page-resources_${sanitizeString(pageType)}`);
    } else {
      console.warn('No <div data-leave-open-on-resize> elements found');
    }
  } catch (err) {
    console.warn('Error taking screenshot of embedded resources:', err);
  }

  const updatedUrl = page.url();

  return {
    testUrl: updatedUrl,
    screenshotPath: inspectScreenshot.screenshotPath,
    resourcesScreenshotPath: resourcesScreenshot.screenshotPath,
  };
};

module.exports = async (browser, pageType, url, markdownFilePath) => {
  const page = await browser.newPage();

  // Set the viewport size
  await page.setViewport({
    width: 1400,
    height: 1000,
  });

  const mobileFriendlyData = await runMobileFriendlyTest(page, url, pageType);
  
  await markdown.generateMarkdownInspectAndMobileFriendly('Google Mobile Friendly Test', pageType, url, mobileFriendlyData.screenshotPath, mobileFriendlyData.resourcesScreenshotPath, mobileFriendlyData.testUrl, markdownFilePath);
  
  await page.close();

  return mobileFriendlyData;
};