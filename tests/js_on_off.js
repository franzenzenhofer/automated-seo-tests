const path = require('path');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const { captureScreenshot } = require('../utils/screenshot');
const { sanitizeString } = require('../utils/sanitizers');
const markdown = require('../utils/markdown');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

let result;

async function compareScreenshots(imgPath1, imgPath2, outputPath) {
    const img1 = PNG.sync.read(fs.readFileSync(imgPath1));
    const img2 = PNG.sync.read(fs.readFileSync(imgPath2));

    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });

    if (numDiffPixels > 0) {
        diff.pack().pipe(fs.createWriteStream(outputPath));
        return outputPath;
    }

    return null;
}

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

module.exports = async (browser, pageType, url, markdownFilePath) => {
  const page = await browser.newPage();

  // Run the test with JS enabled
  const jsOnResults = await runTest(page, url, true, pageType);

  // Run the test with JS disabled
  const jsOffResults = await runTest(page, url, false, pageType);

  const diffImagePath = path.join(__dirname, '..', 'screenshots', `jsonoff_diff_${sanitizeString(pageType)}__${timestamp}.png`);
  const diffResult = await compareScreenshots(jsOnResults.screenshotPath, jsOffResults.screenshotPath, diffImagePath);

  console.log(diffResult);
  await markdown.generateMarkdownSlideJSonoff('JS on/off', pageType, url, jsOnResults.screenshotPath, jsOffResults.screenshotPath, diffResult, markdownFilePath);

  await page.close();
};