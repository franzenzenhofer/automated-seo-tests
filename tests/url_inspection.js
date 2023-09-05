const path = require('path')
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const { captureScreenshot } = require('../utils/screenshot');
const { sleep, waitForElementByXPath, waitAndClickByXPath } = require('../utils/navigation');
const { sanitizeString } = require('../utils/sanitizers');
const { validateTestInspectUrl } = require('../utils/validation');
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

  const screenshotPath = await captureScreenshot(page, null, `inspect_url_actual_${sanitizeString(pageType)}`);

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

  console.log(numDiffPixels);

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
const saveInspectUrlRender = async (page) => {
  // Select the image element using the XPath
  const [imgElement] = await page.$x('//span[@jsslot and @jsname and @class and @jsname and @role="tabpanel" and @id]//img');

  if (!imgElement) {
    throw new Error('Image element not found');
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
  const fileName = `${global.siteUrl.domain}_inspect_url_render_${timestamp}`;
  const outputPath = path.resolve(process.cwd(), topDirectory, 'screenshots', `${fileName}.png`);

  fs.writeFileSync(outputPath, PNG.sync.write(trimmed));

  return outputPath;
};

/**
 * Extracts visual difference, and resources status data from the given Puppeteer page.
 * 
 * @param {Object} page - The Puppeteer page instance currently loaded with the Inspect URL test results.
 * 
 * @returns {Object} - An object containing:
 *   - visual_difference: Intended to contain the path of the differential screenshot between the actual page
 *     and the inspect-url test render. This should be added from outside after using this function.
 *   - resources_status: Text content extracted from the 'Page resources' section, which indicates the 
 *     resources' loading status. Null if this section isn't found.
 * 
 * @throws {Error} - Throws an error if any of the XPath selectors used in the function are not found on the page.
 */
const extractInspectUrlData = async (page) => {
  const results = {
    visual_difference: null, // This will need to be passed from outside
    resources_status: null
  };

  // Extract resources_status
  const resourcesElement = await page.$x('//div[contains(text(), "Page resources")]/following-sibling::div/text()');
  if (resourcesElement.length) {
    results.resources_status = await page.evaluate(el => el.textContent, resourcesElement[0]);
  }

  return results;
};

/**
 * Validates the extracted data from the Inspect URL test to determine if the tested page meets the required criteria.
 * 
 * Criteria for validation are:
 * - There should be no visual differences detected (i.e., `visual_difference` should be null).
 * - Page resources should have loaded and been evaluated (i.e., `resources_status` should be present).
 * 
 * @param {Object} data - An object containing:
 *   - visual_difference: The path to the differential screenshot (if differences were detected) or null.
 *   - resources_status: How many page resources couldn't be loaded.
 * 
 * @returns {boolean} - Returns true if the page meets all the validation criteria; otherwise, returns false.
 */
const inspectUrlValidator = (data) => {
  if (data.visual_difference !== null) return false;
  if (data.resources_status && data.resources_status.includes("couldn't be loaded")) return false;

  return true;
};

/**
 * Runs the URL inspection test using Google's Search Console.
 * 
 * @param {object} browser - Puppeteer browser instance.
 * @param {string} pageType - Type of the page being inspected.
 * @param {string} url - The URL to inspect.
 * @param {object} siteUrl - The site URL information.
 * @returns {Promise<object>} - Object containing test URL, screenshot path, and resources screenshot path.
 */
const runUrlInspectionTest = async (browser, pageType, url, siteUrl) => {
  const page = await browser.newPage();

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

  const testUrl = `https://search.google.com/search-console?resource_id=${encodeURIComponent(siteUrl.full)}`
  await page.goto(testUrl, { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Type the URL to test in the search input.
  const inputXPath = "//input[@aria-label='Inspect any URL in the current resource']";
  const inputField = await page.waitForXPath(inputXPath, { visible: true });
  await inputField.type(url);
  await sleep(1000);

  // Click the search button.
  const buttonXPath = "//button[@aria-label='Search' and @role='button']";
  const searchButton = await page.waitForXPath(buttonXPath, { visible: true });
  await searchButton.click();

  // Long delay so the initial inspect URL request can finish.
  await sleep(20000);

  // Click the Test Live URL button
  const testLiveUrlButtonXPath = "//div[@role='button' and contains(., 'Test live URL')]";
  const testLiveUrlButton = await waitForElementByXPath(page, testLiveUrlButtonXPath, 120000);
  await testLiveUrlButton.click();

  const liveTestCompleteXPath = "//div[@role='button' and contains(., 'Live test')]";
  await waitForElementByXPath(page, liveTestCompleteXPath, 120000);

  await sleep(2000);

  // Click the 'View tested page' button
  await waitAndClickByXPath(page, "//div[contains(., 'View tested page') and @role='button']");

  // Click the 'Screenshot' tab
  const screenshotTabXPath = "//div[@role='tablist']//div[contains(., 'screenshot') and @role='tab']";
  try {
    await page.waitForXPath(screenshotTabXPath, {
      timeout: 10000,
    });

    const screenshotTabs = await page.$x(screenshotTabXPath);

    if (screenshotTabs.length > 1) {
      await screenshotTabs[1].click(); // Click the second matching element
      await sleep(2000); // Add a 2-second delay
    } else {
      console.warn('Less than two "Screenshot" tabs found');
    }
  } catch (err) {
    console.warn('Error clicking "Screenshot" tab:', err);
  }

  // Capture test result screenshot.
  inspectScreenshot = await captureScreenshot(page, null, `inspect-url_${sanitizeString(pageType)}`);

  // Save the page render.
  const inspectUrlRenderPath = await saveInspectUrlRender(page);

  // Click the 'More Info' tab
  const moreInfoTabXPath = "//div[contains(., 'more info') and @role='tab']";
  try {
    await page.waitForXPath(moreInfoTabXPath, {
      timeout: 10000,
    });

    const moreInfoTabs = await page.$x(moreInfoTabXPath);

    if (moreInfoTabs.length > 1) {
      await moreInfoTabs[1].click(); // Click the second matching element
      await sleep(2000); // Add a 2-second delay
    } else {
      console.warn('Less than two "More Info" tabs found');
    }
  } catch (err) {
    console.warn('Error clicking "More Info" tab:', err);
  }

  // Click the second 'Page resources' button
  const pageResourcesButtonXPath = "//div[contains(., 'Page resources') and @role='button']";
  try {
    await page.waitForXPath(pageResourcesButtonXPath, {
      timeout: 10000,
    });

    const pageResourcesButtons = await page.$x(pageResourcesButtonXPath);

    if (pageResourcesButtons.length > 1) {
      await pageResourcesButtons[1].click(); // Click the second matching element
      await sleep(2000); // Add a 2-second delay
    } else {
      console.warn('Less than two "Page resources" buttons found');
    }
  } catch (err) {
    console.warn('Error clicking the second "Page resources" button:', err);
  }

  // Select the last <div data-leave-open-on-resize> element and take a screenshot
  const openOnResizeXPath = "//div[@data-leave-open-on-resize]";

  try {
    await page.waitForXPath(openOnResizeXPath, { timeout: 10000 });
    const openOnResizeDivs = await page.$x(openOnResizeXPath);

    if (openOnResizeDivs && openOnResizeDivs.length > 0) {
      const lastOpenOnResizeDiv = openOnResizeDivs[openOnResizeDivs.length - 1];
      resourcesScreenshot = await captureScreenshot(lastOpenOnResizeDiv, null, `inspect-url-page-resources_${sanitizeString(pageType)}`);
    } else {
      console.warn('No <div data-leave-open-on-resize> elements found');
    }
  } catch (err) {
    console.warn('Error taking screenshot of embedded resources:', err);
  }

  const updatedUrl = page.url();

  const inspectUrlTestResultsExtracted = await extractInspectUrlData(page);

  await page.close();

  // Return the necessary data
  return {
    testUrl: updatedUrl,
    screenshotPath: inspectScreenshot.screenshotPath,
    resourcesScreenshotPath: resourcesScreenshot.screenshotPath,
    inspectUrlRenderPath: inspectUrlRenderPath,
    inspectUrlTestResultsExtracted: inspectUrlTestResultsExtracted,
    actualScreenshotPath: actualScreenshotPath,
  };
};

/**
 * Main function to run the URL inspection test and generate a markdown section.
 * 
 * @param {object} browser - Puppeteer browser instance.
 * @param {string} pageType - Type of the page being inspected.
 * @param {string} url - The URL to inspect.
 * @param {object} siteUrl - The site URL information.
 * @param {string} markdownFilePath - Path to the markdown file.
 * @returns {Promise<object>} - Object containing test results and screenshots.
 */
module.exports = async (browser, pageType, url, siteUrl, markdownFilePath) => {
  const urlInspectionData = await runUrlInspectionTest(browser, pageType, url, siteUrl);
  
  // Compare actual screenshot with Rendering
  const differenceScreenshotPath = await compareScreenshots(urlInspectionData.actualScreenshotPath.screenshotPath, urlInspectionData.inspectUrlRenderPath, `${topDirectory}/screenshots/inspect_url_difference_${timestamp}.png`);

  // Assign the result of visual comparison to visual_difference
  urlInspectionData.inspectUrlTestResultsExtracted.visual_difference = differenceScreenshotPath
    ? "Visual differences in page rendering"
    : "No visual differences in page rendering";

  // Check the Test Status
  const inspectUrlValidationResult = inspectUrlValidator(urlInspectionData.inspectUrlTestResultsExtracted);

  const testStatus = await validateTestInspectUrl(inspectUrlValidationResult);

  const notes =
  `
  ## IS
  - Page Resources: ${urlInspectionData.inspectUrlTestResultsExtracted.resources_status}
  - ${urlInspectionData.inspectUrlTestResultsExtracted.visual_difference}
  `

  await markdown.generateMarkdownInspectAndMobileFriendly('Google Search Console - URL Inspection', pageType, url, urlInspectionData.screenshotPath, urlInspectionData.resourcesScreenshotPath, urlInspectionData.testUrl, testStatus, notes, markdownFilePath);
  return urlInspectionData;
};