const fs = require("fs");
const path = require("path");
const { getSiteUrl, getCurrentTimestamp } = require('../utils/sanitizers');

const siteUrl = getSiteUrl();

/**
 * Creates a new markdown file with a custom front matter.
 * The file name is generated using the sanitized site URL and the current timestamp.
 * 
 * @param {string} cleanSiteUrl - The sanitized site URL.
 * @returns {string} The path to the created markdown file.
 */
const createNewMarkdownFile = async (cleanSiteUrl) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const markdownFilePath = path.join(__dirname, '../markdown', `${cleanSiteUrl}_${timestamp}.md`);

  const markdownDir = path.resolve(__dirname, '../markdown');
  const logoPath = path.join(__dirname, '../assets', 'logo.svg');
  const relativelogoPath = path.relative(markdownDir, logoPath);

  const frontMatter = 
`---
theme: f19n-theme
paginate: true
footer: 'Automated SEO Test Report for ${siteUrl.full} - Generated: ${getCurrentTimestamp()} - Powered by [https://www.fullstackoptimization.com/](https://www.fullstackoptimization.com/)'
---

# Automated SEO Tests
## ${siteUrl.full}

---

`;

  fs.writeFileSync(markdownFilePath, frontMatter); // Create a file with front matter
  return markdownFilePath;
};

/**
 * Generates and appends a markdown slide to a markdown file.
 * 
 * @param {string} headline - Slide headline.
 * @param {string} pageType - Type of the page.
 * @param {string} pageUrl - URL of the page.
 * @param {string} screenshotPath - Path to the screenshot.
 * @param {string} screenshotUrl - URL of the screenshot.
 * @param {string} markdownFilePath - Path to the markdown file where the slide will be appended.
 */
const generateMarkdownSlide = async (headline, pageType, pageUrl, screenshotPath, screenshotUrl, markdownFilePath) => {
  try {
    const markdownDir = path.resolve(__dirname, '../markdown');
    const relativeScreenshotPath = path.relative(markdownDir, screenshotPath);
    const markdownSlide = 
    
`
<!-- 
_class: default 
_header: '${pageType} (${pageUrl})'
-->

# ${headline}

![w:auto h:auto](${relativeScreenshotPath})
[${screenshotUrl}](${screenshotUrl})

---

`;

    fs.appendFileSync(markdownFilePath, markdownSlide); // append the markdown slide to the file
  } catch (error) {
    console.error(`Failed to generate markdown slide. ${error}`);
  }
};

/**
 * Generates and appends a markdown slide showing comparison between JS on and off.
 * 
 * @param {string} headline - Slide headline.
 * @param {string} pageType - Type of the page.
 * @param {string} pageUrl - URL of the page.
 * @param {string} screenshotPath1 - Path to the screenshot with JS on.
 * @param {string} screenshotPath2 - Path to the screenshot with JS off.
 * @param {string} markdownFilePath - Path to the markdown file where the slide will be appended.
 */
const generateMarkdownSlideJSonoff = async (headline, pageType, pageUrl, screenshotPath1, screenshotPath2, markdownFilePath) => {
  try {
    const markdownDir = path.resolve(__dirname, '../markdown');
    const relativeScreenshotPath1 = path.relative(markdownDir, screenshotPath1);
    const relativeScreenshotPath2 = path.relative(markdownDir, screenshotPath2);
    
    const markdownSlide = 
    
`
<!-- 
_class: default 
_header: '${pageType} (${pageUrl})'
-->

# ${headline}

<div style="display: flex; justify-content: space-between;">
    <div style="width: 20%;">
      <h2>JS on</h2>
      <img src="${relativeScreenshotPath1}"/>
    </div>
    <div style="width: 20%;">
      <h2>JS off</h2>
      <img src="${relativeScreenshotPath2}"/>
    </div>
    <div style="width: 60%;"></div>
</div>

---

`;

    fs.appendFileSync(markdownFilePath, markdownSlide); // append the markdown slide to the file
  } catch (error) {
    console.error(`Failed to generate markdown slide. ${error}`);
  }
};


/**
 * Generates and appends a markdown slide for URL Inspection and Mobile frienldy test.
 * 
 * @param {string} headline - Slide headline.
 * @param {string} pageType - Type of the page.
 * @param {string} pageUrl - URL of the page.
 * @param {string} screenshotPath1 - Path to the first screenshot.
 * @param {string} screenshotPath2 - Path to the second screenshot.
 * @param {string} testUrl - URL for testing mobile-friendliness.
 * @param {string} markdownFilePath - Path to the markdown file where the slide will be appended.
 */
const generateMarkdownInspectAndMobileFriendly = async (headline, pageType, pageUrl, screenshotPath1, screenshotPath2, testUrl, markdownFilePath) => {
  try {
    const markdownDir = path.resolve(__dirname, '../markdown');
    const relativeScreenshotPath1 = path.relative(markdownDir, screenshotPath1);
    const relativeScreenshotPath2 = path.relative(markdownDir, screenshotPath2);
    
    const markdownSlide = 
    
`
<!-- 
_class: default 
_header: '${pageType} (${pageUrl})'
-->

# ${headline}

<div style="display: flex; justify-content: space-between;">
    <div style="width: 60%;">
      <img src="${relativeScreenshotPath1}"/>
      <a href="${testUrl}">${testUrl}</a>
    </div>
    <div style="width: 20%;">
      <img src="${relativeScreenshotPath2}"/>
    </div>
    <div style="width: 20%;"></div>
</div>

---

`;

    fs.appendFileSync(markdownFilePath, markdownSlide);
  } catch (error) {
    console.error(`Failed to generate markdown slide. ${error}`);
  }
};

module.exports = {
  createNewMarkdownFile,
  generateMarkdownSlide,
  generateMarkdownSlideJSonoff,
  generateMarkdownInspectAndMobileFriendly,
};
