const path = require('path')
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const { captureScreenshot } = require('../utils/screenshot');
const { sleep, waitForElementByXPath, waitAndClickByXPath } = require('../utils/navigation');
const { sanitizeString } = require('../utils/sanitizers');
const { validateTest } = require('../utils/validation');
const markdown = require('../utils/markdown');

let inspectScreenshot;
let resourcesScreenshot;

const topDirectory = '_seo-tests-output';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

/**
 * Device specifications for Google-InspectionTool.
 */
const googleInspectionTool = {
  name: 'Google-InspectionTool',
  userAgent:
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0)',
  viewport: {
    width: 412,
    height: 1200,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    isLandscape: false,
  },
};

/**
 * Captures a screenshot of the specified page with the device settings
 * of the Google Inspection Tool.
 * 
 * @param {Object} page - The Puppeteer page instance.
 * @param {string} url - The URL of the page to be screenshot.
 * @param {string} pageType - The type or category of the page to be used in naming the screenshot.
 * 
 * @returns {string} - The path to the captured screenshot.
 * 
 */
const takePageScreenshot = async (page, url, pageType) => {
  // Set user agent and viewport for Google Inspection Tool device
  await page.setUserAgent(googleInspectionTool.userAgent);
  await page.setViewport(googleInspectionTool.viewport);

  // Navigate to the URL and capture screenshot
  await page.goto(url, { waitUntil: 'networkidle2' });

  const screenshotPath = await captureScreenshot(page, null, `mobile_friendly_actual_${sanitizeString(pageType)}`);

  return screenshotPath;
};

/**
 * Compares two images and returns a differential image highlighting the differences.
 * 
 * @param {string} imgPath1 - Path to the first image
 * @param {string} imgPath2 - Path to the second image
 * @param {string} outputPath - Path where the differential image should be saved
 * @returns {string|null} - Path to the differential image if differences exist; null otherwise
 */
async function compareScreenshots(imgPath1, imgPath2, outputPath) {
  const img1 = PNG.sync.read(fs.readFileSync(imgPath1));
  const img2 = PNG.sync.read(fs.readFileSync(imgPath2));

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });

  // To not let a scroll bar falsely considered
  if (numDiffPixels > 50) {
    diff.pack().pipe(fs.createWriteStream(outputPath));
    return outputPath;
  }

  return null;
}

/**
 * Extracts the image from the provided XPath selector on the current Puppeteer page, trims its height to 1200px, 
 * and saves the processed image to disk.
 * 
 * @param {Object} page - Puppeteer page object.
 * @returns {string} - Path to the saved trimmed image.
 * @throws {Error} - If the image element is not found.
 */
const saveMobileFriendlyRender = async (page) => {
  try {
    // Select the image element using the XPath
    const [imgElement] = await page.$x('//span[@jsslot and @jsname and @class and @jsname and @role="tabpanel" and @id]//img');

    if (!imgElement) {
      console.error('Image element not found in saveMobileFriendlyRender');
      return null; // Or some error value indicating a failure
    }

    // Get the src attribute which is a base64 encoded string
    const base64Encoded = await imgElement.getProperty('src');
    const base64 = (await base64Encoded.jsonValue()).split(';base64,')[1];

    // Convert base64 to a Buffer
    const buffer = Buffer.from(base64, 'base64');

    // Decode the image using pngjs
    const img = PNG.sync.read(buffer);

    // Create a new trimmed image
    const trimmed = new PNG({
      width: img.width,
      height: Math.min(img.height, 1200) // Trim height to 1200px
    });

    PNG.bitblt(img, trimmed, 0, 0, img.width, Math.min(img.height, 1200), 0, 0);

    // Save the trimmed image to disk
    const fileName = `${global.siteUrl.domain}_mobile_friendly_render_${timestamp}`;
    const outputPath = path.resolve(process.cwd(), topDirectory, 'screenshots', `${fileName}.png`);

    fs.writeFileSync(outputPath, PNG.sync.write(trimmed));

    return outputPath;
  } catch (err) {
    console.error('Error in saveMobileFriendlyRender:', err);
    return null; // Or some error value indicating a failure
  }
};


/**
 * Extracts mobile friendliness, visual difference, and resources status data from the given Puppeteer page.
 * 
 * @param {Object} page - The Puppeteer page instance currently loaded with the mobile-friendly test results.
 * 
 * @returns {Object} - An object containing:
 *   - mobile_friendly: Contains the text "Page is usable on mobile" if the test passes, null otherwise.
 *   - visual_difference: Intended to contain the path of the differential screenshot between the actual page
 *     and the mobile-friendly test render. This should be added from outside after using this function.
 *   - resources_status: Text content extracted from the 'Page resources' section, which indicates the 
 *     resources' loading status. Null if this section isn't found.
 * 
 * @throws {Error} - Throws an error if any of the XPath selectors used in the function are not found on the page.
 */
const extractMobileFriendlyData = async (page) => {
  const results = {
    mobile_friendly: null,
    visual_difference: null, // This will need to be passed from outside
    resources_status: null
  };

  // Extract mobile_friendly status
  const usableOnMobileElement = await page.$x('//div[contains(text(), "Page is usable on mobile")]');
  if (usableOnMobileElement.length) {
    results.mobile_friendly = await page.evaluate(el => el.textContent, usableOnMobileElement[0]);
  } else {
    results.mobile_friendly = "Page isn't usable on mobile";
  }

  // Extract resources_status
  const resourcesElement = await page.$x('//div[contains(text(), "Page resources")]/following-sibling::div/text()');
  if (resourcesElement.length) {
    results.resources_status = await page.evaluate(el => el.textContent, resourcesElement[0]);
  }

  return results;
};

/**
 * Validates the extracted data from the mobile-friendly test to determine if the tested page meets the required criteria.
 * 
 * Criteria for validation are:
 * - The page must be marked as usable on mobile.
 * - There should be no visual differences detected (i.e., `visual_difference` should be null).
 * - Page resources should have loaded and been evaluated (i.e., `resources_status` should be present).
 * 
 * @param {Object} data - An object containing:
 *   - mobile_friendly: The text status indicating if the page is usable on mobile.
 *   - visual_difference: The path to the differential screenshot (if differences were detected) or null.
 * 
 * @returns {boolean} - Returns true if the page meets all the validation criteria; otherwise, returns false.
 */
const mobileFriendlyValidator = (data) => {
  // Fail if the page isn't usable on mobile.
  if (!data.mobile_friendly) return 'failed';

  // Issue a warning if there are visual differences.
  if (data.visual_difference !== null) return 'warning';

  // Issue a warning if resources couldn't be loaded.
  if (data.resources_status && data.resources_status.includes("couldn't be loaded")) return 'warning';

  // If none of the above conditions met, the test passed.
  return 'passed';
};

/**
 * Executes the mobile-friendly test for a given URL and page type.
 * 
 * @param {Object} page - Puppeteer page object
 * @param {string} url - URL to test
 * @param {string} pageType - Type or category of the page (e.g., homepage, product page)
 * @returns {Object} - Results of the mobile-friendly test, including the tested URL and paths to the screenshots
 */
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

  // Save the page render.
  const mobileFriendlyRenderPath = await saveMobileFriendlyRender(page);

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

  const mobileFriendlyTestResultsExtracted = await extractMobileFriendlyData(page);

  return {
    testUrl: updatedUrl,
    screenshotPath: inspectScreenshot.screenshotPath,
    resourcesScreenshotPath: resourcesScreenshot.screenshotPath,
    mobileFriendlyRenderPath: mobileFriendlyRenderPath,
    mobileFriendlyTestResultsExtracted: mobileFriendlyTestResultsExtracted,
  };
};

/**
 * Initializes and manages the execution of the mobile-friendly test.
 * 
 * @param {Object} browser - Puppeteer browser object
 * @param {string} pageType - Type or category of the page
 * @param {string} url - URL to test
 * @param {string} markdownFilePath - Path to the markdown file where results will be saved
 * @returns {Object} - Results of the mobile-friendly test
 */
module.exports = async (browser, pageType, url, markdownFilePath) => {
  const page = await browser.newPage();

  // Set the viewport size
  await page.setViewport({
    width: 1400,
    height: 1000,
  });

  // Save the current settings
  const originalViewport = page.viewport();
  const originalUserAgent = await page.evaluate(() => navigator.userAgent);

  // Capture the actual page screenshot
  const actualScreenshotPath = await takePageScreenshot(page, url, pageType);

  // Reset to original settings before running the mobile-friendly test
  await page.setViewport(originalViewport);
  await page.setUserAgent(originalUserAgent);

  // Run the mobile-friendly test
  const mobileFriendlyData = await runMobileFriendlyTest(page, url, pageType);

  // Compare actual screenshot with Rendering
  const differenceScreenshotPath = await compareScreenshots(actualScreenshotPath.screenshotPath, mobileFriendlyData.mobileFriendlyRenderPath, `${topDirectory}/screenshots/mobile_friendly_difference_${timestamp}.png`);

  // Assign the result of visual comparison to visual_difference
  mobileFriendlyData.mobileFriendlyTestResultsExtracted.visual_difference = differenceScreenshotPath
    ? "Visual differences in page rendering"
    : "No visual differences in page rendering";

  // Check the Test Status
  const testStatus = await validateTest(null, () => mobileFriendlyValidator(mobileFriendlyData.mobileFriendlyTestResultsExtracted));


  const notes =
`
## IS
- ${mobileFriendlyData.mobileFriendlyTestResultsExtracted.mobile_friendly}
- Page Resources: ${mobileFriendlyData.mobileFriendlyTestResultsExtracted.resources_status}
- ${mobileFriendlyData.mobileFriendlyTestResultsExtracted.visual_difference}
`

  await markdown.generateMarkdownInspectAndMobileFriendly('Google Mobile Friendly Test', pageType, url, mobileFriendlyData.screenshotPath, mobileFriendlyData.resourcesScreenshotPath, mobileFriendlyData.testUrl, testStatus, notes, markdownFilePath);
  if (differenceScreenshotPath) {
    await markdown.generateMarkdownInspectAndMobileFriendlyVisualDifference('Google Mobile Friendly Test - Visual Comparison', pageType, url, actualScreenshotPath.screenshotPath, mobileFriendlyData.mobileFriendlyRenderPath, differenceScreenshotPath, testStatus, markdownFilePath);
  }

  

  await page.close();

  return mobileFriendlyData;
};
