/**
 * Pauses the execution for a specified number of milliseconds.
 * 
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Waits for an element identified by an XPath selector to appear on a Puppeteer page.
 * 
 * @param {Object} page - The Puppeteer page instance.
 * @param {string} xpath - The XPath selector of the element.
 * @param {number} [timeout=10000] - The maximum time in milliseconds to wait for the element. Default is 10 seconds.
 * @returns {Promise<Object|null>} The element if found, or null if the element is not found or an error occurs.
 */
const waitForElementByXPath = async (page, xpath, timeout = 10000) => {
  try {
      const element = await page.waitForXPath(xpath, { timeout });
      return element;
  } catch (error) {
      console.error(`Error waiting for element by XPath: ${error}`);
      return null;
  }
};

/**
 * Waits for an element identified by an XPath selector to appear on a Puppeteer page and then clicks it.
 * 
 * @param {Object} page - The Puppeteer page instance.
 * @param {string} xpath - The XPath selector of the element.
 * @returns {Promise<void>} Resolves when the element is clicked or rejects if an error occurs.
 */
const waitAndClickByXPath = async (page, xpath) => {
  try {
      const element = await waitForElementByXPath(page, xpath);
      if (element) {
          await element.click();
          await sleep(1000);
      } else {
          console.error(`Cannot find element with XPath: ${xpath}`);
      }
  } catch (error) {
      console.error(`Error clicking on element with XPath: ${xpath}. Error: ${error}`);
  }
}

module.exports = {
  sleep,
  waitForElementByXPath,
  waitAndClickByXPath
};
