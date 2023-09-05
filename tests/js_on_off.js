const path = require('path');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const { captureScreenshot } = require('../utils/screenshot');
const { sanitizeString } = require('../utils/sanitizers');
const { validateTest } = require('../utils/validation');
const markdown = require('../utils/markdown');

const topDirectory = '_seo-tests-output';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

let result;

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
    if (numDiffPixels > 250) {
        diff.pack().pipe(fs.createWriteStream(outputPath));
        return outputPath;
    }

    return null;
}

/**
 * Validates the JS On/Off test based on the difference between two screenshots.
 * If there are no differences (diffResult is null), the test is passed.
 * 
 * @param {Page} page - Puppeteer page instance (not used in this validator, but kept for consistency).
 * @param {string|null} diffResult - Path to the differential image if differences exist; null otherwise.
 * @returns {string} - Returns 'passed' if the test passes (diffResult is null), otherwise 'failed'.
 */
const jsOnOffValidator = (page, diffResult) => {
  return diffResult === null ? 'passed' : 'failed';
};


/**
 * Device specifications for iPhone 13.
 */
const iPhone13 = {
  name: 'iPhone 13',
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  viewport: {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    isLandscape: false,
  },
};

/**
 * Executes the test for a given page and configuration.
 * 
 * @param {Object} page - Puppeteer page object
 * @param {string} url - URL to test
 * @param {boolean} jsEnabled - Determines if JavaScript should be enabled for the test
 * @param {string} pageType - Type or category of the page (e.g., homepage, product page)
 * @returns {Object} - Results of the test including the state of JS, tested URL, and path to the screenshot
 */
const runTest = async (page, url, jsEnabled, pageType) => {
  await page.setUserAgent(iPhone13.userAgent);
  await page.setViewport(iPhone13.viewport);
  await page.setJavaScriptEnabled(jsEnabled);

  await page.goto(url, { waitUntil: 'networkidle2' });
  const prefix = jsEnabled ? 'js-on' : 'js-off';

  result = await captureScreenshot(page, null, `${prefix}_${sanitizeString(pageType)}`);

  return {
    jsEnabled: jsEnabled,
    testUrl: url,
    screenshotPath: result.screenshotPath,
  };
};

/**
 * Initializes and manages the execution of tests for pages with JS on and off.
 * 
 * @param {Object} browser - Puppeteer browser object
 * @param {string} pageType - Type or category of the page
 * @param {string} url - URL to test
 * @param {string} markdownFilePath - Path to the markdown file where results will be saved
 */
module.exports = async (browser, pageType, url, markdownFilePath) => {
  const page = await browser.newPage();

  // Run the test with JS enabled
  const jsOnResults = await runTest(page, url, true, pageType);

  // Run the test with JS disabled
  const jsOffResults = await runTest(page, url, false, pageType);

  const diffImagePath = path.join(process.cwd(), topDirectory, 'screenshots', `jsonoff_diff_${sanitizeString(pageType)}__${timestamp}.png`);
  const diffResult = await compareScreenshots(jsOnResults.screenshotPath, jsOffResults.screenshotPath, diffImagePath);

  const testStatus = await validateTest(page, jsOnOffValidator, diffResult);

  await markdown.generateMarkdownSlideJSonoff('JS on/off', pageType, url, jsOnResults.screenshotPath, jsOffResults.screenshotPath, diffResult, testStatus, markdownFilePath);

  await page.close();
};