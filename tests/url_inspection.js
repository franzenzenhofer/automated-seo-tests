const { google } = require('googleapis');
const searchconsole = google.searchconsole('v1');

const inspectUrl = async (url) => {
  try {
    const authenticate = require('../authenticate');
    const authClient = await authenticate();

    const response = await searchconsole.urlInspection.index.inspect({
      auth: authClient,
      requestBody: {
        inspectionUrl: url,
        siteUrl: 'https://www.fullstackoptimization.com/',
      },
    });

    if (response && response.data) {
      return response.data.inspectionResult;
    }
  } catch (err) {
    console.error(`Error inspecting URL: ${url}`, err);
  }

  return null;
};

const waitForElementByXPath = async (page, xpath, timeout = 60000) => {
  const element = await page.waitForXPath(xpath, { timeout });
  return element;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runUrlInspectionTest = async (browser, pageType, url) => {
  const inspectionResult = await inspectUrl(url);

  if (!inspectionResult) {
    console.warn(`Unable to inspect URL: ${url}`);
    return;
  }

  console.log(`URL Inspection Result Link for ${pageType}:`, inspectionResult.inspectionResultLink);

  const page = await browser.newPage();

  // Set the viewport size
  await page.setViewport({
    width: 1600,
    height: 1000,
  });

  await page.goto(inspectionResult.inspectionResultLink, { waitUntil: 'networkidle2' });

  const testLiveUrlButtonXPath = "//div[@role='button' and contains(., 'Test live URL')]";
  const testLiveUrlButton = await waitForElementByXPath(page, testLiveUrlButtonXPath);
  await testLiveUrlButton.click();

  const liveTestCompleteXPath = "//div[@role='button' and contains(., 'Live test')]";
  
  await waitForElementByXPath(page, liveTestCompleteXPath, 60000);

  await delay(4000);

  // Click the 'View tested page' button
  try {
    await page.waitForXPath("//div[contains(., 'View tested page') and @role='button']", {
      timeout: 10000,
    });

    const [viewTestedPageBtn] = await page.$x(
      "//div[contains(., 'View tested page') and @role='button']"
    );

    if (viewTestedPageBtn) {
      await viewTestedPageBtn.click();
      console.log('Clicked "View tested page" button');
      await delay(2000); // Add a 2-second delay
    }
  } catch (err) {
    console.warn('Error clicking "View tested page" button:', err);
  }

  // Click the 'Screenshot' tab
  const screenshotTabXPath = "//div[@role='tablist']//div[contains(., 'screenshot') and @role='tab']";
  try {
    await page.waitForXPath(screenshotTabXPath, {
      timeout: 10000,
    });

    const screenshotTabs = await page.$x(screenshotTabXPath);

    if (screenshotTabs.length > 1) {
      await screenshotTabs[1].click(); // Click the second matching element
      console.log('Clicked "Screenshot" tab');
      await delay(2000); // Add a 2-second delay
    } else {
      console.warn('Less than two "Screenshot" tabs found');
    }
  } catch (err) {
    console.warn('Error clicking "Screenshot" tab:', err);
  }

  const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
  const filepath = `screenshots/url-inspection_${pageType}_${timestamp}.png`;

  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Screenshot saved at: ${filepath}`);

  // Click the 'More Info' tab
  const moreInfoTabXPath = "//div[contains(., 'more info') and @role='tab']";
  try {
    await page.waitForXPath(moreInfoTabXPath, {
      timeout: 10000,
    });

    const moreInfoTabs = await page.$x(moreInfoTabXPath);

    if (moreInfoTabs.length > 1) {
      await moreInfoTabs[1].click(); // Click the second matching element
      console.log('Clicked "More Info" tab');
      await delay(2000); // Add a 2-second delay
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
      console.log('Clicked the second "Page resources" button');
      await delay(2000); // Add a 2-second delay
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
      const resourcesScreenshotPath = `screenshots/url-inspection-page-resources_${pageType}_${timestamp}.png`;
      await lastOpenOnResizeDiv.screenshot({ path: resourcesScreenshotPath });
      console.log(`Screenshot of embedded resources saved at: ${resourcesScreenshotPath}`);
    } else {
      console.warn('No <div data-leave-open-on-resize> elements found');
    }
  } catch (err) {
    console.warn('Error taking screenshot of embedded resources:', err);
  }

  console.log(`Live Test URL: ${page.url()}`);

  await page.close();
};

module.exports = runUrlInspectionTest;
