const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const waitForElementByXPath = async (page, xpath, timeout = 10000) => {
  try {
      const element = await page.waitForXPath(xpath, { timeout });
      return element;
  } catch (error) {
      console.error(`Error waiting for element by XPath: ${error}`);
      return null;
  }
};

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







