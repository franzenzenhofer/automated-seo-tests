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
    width: 1280,
    height: 800,
  });

  await page.goto(inspectionResult.inspectionResultLink, { waitUntil: 'networkidle2' });

  const testLiveUrlButtonXPath = "//div[@role='button' and contains(., 'Test live URL')]";
  const testLiveUrlButton = await waitForElementByXPath(page, testLiveUrlButtonXPath);
  await testLiveUrlButton.click();

  const liveTestCompleteXPath = "//div[@role='button' and contains(., 'Live test')]";
  
  await waitForElementByXPath(page, liveTestCompleteXPath, 60000);

  const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
  const filepath = `screenshots/url-inspection_${pageType}_${timestamp}.png`;

  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Screenshot saved at: ${filepath}`);

  await page.close();
};

module.exports = runUrlInspectionTest;
