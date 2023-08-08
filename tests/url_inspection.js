const { captureScreenshot } = require('../utils/screenshot');
const { sleep, waitForElementByXPath, waitAndClickByXPath } = require('../utils/navigation');
const { sanitizeString } = require('../utils/sanitizers');

const runUrlInspectionTest = async (browser, pageType, url, siteUrl) => {
  const page = await browser.newPage();

  await page.setViewport({
    width: 1400,
    height: 1000,
  });

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
  result = await captureScreenshot(page, null, `mobile-friendly_${sanitizeString(pageType)}`);
  console.log(result);

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

  let resourcesScreenshotPath;

  try {
    await page.waitForXPath(openOnResizeXPath, { timeout: 10000 });
    const openOnResizeDivs = await page.$x(openOnResizeXPath);

    if (openOnResizeDivs && openOnResizeDivs.length > 0) {
      const lastOpenOnResizeDiv = openOnResizeDivs[openOnResizeDivs.length - 1];
      result = await captureScreenshot(lastOpenOnResizeDiv, null, `mobile-friendly-page-resources_${sanitizeString(pageType)}`);
      console.log(result);
    } else {
      console.warn('No <div data-leave-open-on-resize> elements found');
    }
  } catch (err) {
    console.warn('Error taking screenshot of embedded resources:', err);
  }

  const updatedUrl = page.url();

  await page.close();

  // Return the necessary data
  return {
    testUrl: updatedUrl,
    //screenshotPath: filepath,
    //resourcesScreenshotPath: resourcesScreenshotPath,
  };
};

module.exports = async (browser, pageType, url, siteUrl) => {
  const urlInspectionData = await runUrlInspectionTest(browser, pageType, url, siteUrl);
  return urlInspectionData;
};