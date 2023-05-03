const fs = require('fs');

const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');


const logToCsv = async (pageType, data) => {
  const resultsFolderPath = './results';
  const csvFilename = `results-${timestamp}.csv`;
  const csvFilePath = `${resultsFolderPath}/${csvFilename}`;

  // Create the "results" folder if it doesn't exist
  if (!fs.existsSync(resultsFolderPath)) {
    fs.mkdirSync(resultsFolderPath);
  }

  const csvExists = fs.existsSync(csvFilePath);

  if (!csvExists) {
    const headers = [
      'page_type',
      'page_url',
      'pagespeedinsights_test_url',
      'pagespeedinsights_screenshot',
      'mobilefriendly_test_url',
      'mobilefriendly_screenshot',
      'mobilefriendly_resources_screenshot',
      'js_on_screenshot',
      'js_off_screenshot',
      'inspecturl_test_url',
      'inspect_url_screenshot',
      'inspect_url_resources_screenshot',
    ];
    fs.writeFileSync(csvFilePath, headers.join(',') + '\n');
  }

  const row = [
    pageType,
    data.pageUrl,
    data.pagespeedInsightsTestUrl,
    data.pagespeedInsightsScreenshot,
    data.mobileFriendlyTestUrl,
    data.mobileFriendlyScreenshot,
    data.mobileFriendlyResourcesScreenshot,
    data.jsOnScreenshot,
    data.jsOffScreenshot,
    data.inspectUrlTestUrl,
    data.inspectUrlScreenshot,
    data.inspectUrlResourcesScreenshot,
  ];

  fs.appendFileSync(csvFilePath, row.join(',') + '\n');
};


const getSiteUrl = (pages) => {
  const firstPageUrl = Object.values(pages)[0];
  const siteUrlBase = new URL(firstPageUrl).origin;

  // Add a trailing slash to siteUrl if it doesn't have one
  return siteUrlBase.endsWith('/') ? siteUrlBase : `${siteUrlBase}/`;
};

module.exports = {
  logToCsv,
  getSiteUrl,
};
