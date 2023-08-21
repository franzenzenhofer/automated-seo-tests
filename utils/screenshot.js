const path = require('path');
const { getSiteUrl } = require('../utils/sanitizers');

/**
 * Asynchronously captures a screenshot of a Puppeteer Page or ElementHandle, with custom options.
 * 
 * @param {Page|ElementHandle} elementOrPage - A Puppeteer Page object or ElementHandle to capture a screenshot of
 * @param {string} screenshotXPath - The XPath to an element on the page to capture a screenshot of, if an ElementHandle is not provided
 * @param {string} screenshotNamePrefix - A prefix to prepend to the screenshot file name
 * @param {number} [padding=5] - Optional: The padding to add to the screenshot dimensions, if an ElementHandle is provided
 * @param {number} [maxHeight=1200] - Optional: The maximum height of the screenshot, if an ElementHandle is provided
 * @returns {Promise<Object>} - A promise that resolves to an object with the screenshot path, or rejects with an error
 */
async function captureScreenshot(elementOrPage, screenshotXPath, screenshotNamePrefix, padding = 5, maxHeight = 1200) {
  let screenshotHolder, screenshotPath;

  const siteUrl = getSiteUrl();

  try {
    // If a Page object is passed and an XPath is provided, find the ElementHandle for the XPath on the page
    if (elementOrPage.constructor.name === 'CDPPage' && screenshotXPath) {
      screenshotHolder = await waitForElementByXPath(elementOrPage, screenshotXPath);
      if (!screenshotHolder) {
        console.error(`Failed to find element with XPath "${screenshotXPath}".`);
        return;
      }
    } else {
      // If an ElementHandle is passed, set it as the screenshotHolder
      screenshotHolder = elementOrPage;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `${siteUrl.domain}_${screenshotNamePrefix}_${timestamp}`;
    screenshotPath = path.resolve(__dirname, '../screenshots', `${screenshotName}.png`);

    // If an ElementHandle was passed or found, capture a screenshot of the element
    if (screenshotHolder.constructor.name === 'ElementHandle' || screenshotHolder.constructor.name === 'CDPElementHandle') {
      const box = await screenshotHolder.boundingBox();

      // Adjust the position and size of the bounding box with padding and limit height to maxHeight
      const paddedBox = {
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: Math.min(box.height + padding * 2, maxHeight)
      };

      // Capture the screenshot of the element
      await screenshotHolder.screenshot({ 
        path: screenshotPath,
        clip: paddedBox 
      });
    } else if (screenshotHolder.constructor.name === 'CDPPage') {
      // If a Page object was passed and no ElementHandle was found, capture a full-page screenshot
      await screenshotHolder.screenshot({ path: screenshotPath });
    } else {
      throw new Error('Invalid argument, expected puppeteer.Page or puppeteer.ElementHandle');
    }
    
    return { screenshotPath };
  } catch (error) {
    console.error(`Failed to capture screenshot. ${error}`);
  }
}

module.exports = {
  captureScreenshot
};
