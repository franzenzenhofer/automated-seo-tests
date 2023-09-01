const fs = require("fs");
const path = require("path");
const { getCurrentTimestamp } = require('../utils/sanitizers');

const topDirectory = '_seo-tests-output';

/**
 * Creates a new markdown file with a custom front matter.
 * The file name is generated using the sanitized site URL and the current timestamp.
 * 
 * @param {string} siteUrl - The site URL.
 * @returns {string} The path to the created markdown file.
 */
const createNewMarkdownFile = async (siteUrl) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const markdownFilePath = path.join(process.cwd(), topDirectory, 'markdown', `${siteUrl.domain}_${timestamp}.md`);

  const markdownDir = path.resolve(process.cwd(), topDirectory, 'markdown');
  //const logoPath = path.join(__dirname, '../assets', 'logo.svg');
  //const relativelogoPath = path.relative(markdownDir, logoPath);

  const frontMatter =
    `---
theme: f19n-theme
paginate: true
footer: 'Automated SEO Test Report for ${siteUrl.full} - Generated: ${getCurrentTimestamp()} - Powered by [https://www.fullstackoptimization.com/](https://www.fullstackoptimization.com/)'
_class: title
---

# Automated SEO Tests
## ${siteUrl.full}

---

<!-- 
_class: intro
-->

# 4 SEO Tests to do 80% of technical onpage/onsite SEO right!
- Page Speed Insights: minimum score of 80 (still orange) / preferrably 90 (green) + sensemaking screenshots for desktop and mobile!
- Google Mobile Friendly Test: Green + sensemaking screenshot!
- “JS turned off” Test:
  - Above fold and main content must be visible on the site with JS turned off!
  - Interlinking must work with JS turned off! (Visible links must be links.)
- Google Search Console -> Inspect URL -> Test Live URL -> View Tested Page -> Screenshot must show rendered page! (Images below fold (non-visible) might get lazy loaded)

---

`;

  fs.writeFileSync(markdownFilePath, frontMatter);
  return markdownFilePath;
};

/**
 * Generates and appends a markdown slide for separating page types.
 * 
 * @param {string} pageType - Type of the page.
 * @param {string} pageUrl - URL of the page.
 * @param {string} markdownFilePath - Path to the markdown file where the slide will be appended.
 */
const generateMarkdownSubTitleSlide = async (pageType, pageUrl, markdownFilePath) => {
  try {
    const markdownSlide =

      `
<!-- 
_class: title 
-->

# ${pageType}
${pageUrl}

---

`;

    fs.appendFileSync(markdownFilePath, markdownSlide);
  } catch (error) {
    console.error(`Failed to generate markdown slide. ${error}`);
  }
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
const generateMarkdownSlide = async (headline, pageType, pageUrl, screenshotPath, testUrl, markdownFilePath) => {
  try {
    const markdownDir = path.resolve(process.cwd(), topDirectory, 'markdown');
    const relativeScreenshotPath = path.relative(markdownDir, screenshotPath);
    const markdownSlide =

      `
<!-- 
_class: default 
_header: ${pageType} (${pageUrl})
-->

# ${headline}

:::: slideInner

:::col
![screenshot](${relativeScreenshotPath})
:::

:::col
## IS
## SHOULD
:::

::::

[${testUrl}](${testUrl})

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
 * @param {string} diffImagePath - Path to the diff image (comparison result).
 * @param {string} markdownFilePath - Path to the markdown file where the slide will be appended.
 */
const generateMarkdownSlideJSonoff = async (headline, pageType, pageUrl, screenshotPath1, screenshotPath2, diffImagePath, markdownFilePath) => {
  try {
    const markdownDir = path.resolve(process.cwd(), topDirectory, 'markdown');
    const relativeScreenshotPath1 = path.relative(markdownDir, screenshotPath1);
    const relativeScreenshotPath2 = path.relative(markdownDir, screenshotPath2);
    const relativeDiffImagePath = diffImagePath ? path.relative(markdownDir, diffImagePath) : null;

    let diffImageMarkdown = "";
    if (relativeDiffImagePath) {
      diffImageMarkdown = `
:::col
## Difference
![screenshot](${relativeDiffImagePath})
:::
`;
    }

    const markdownSlide = `
<!-- 
_class: default 
_header: '${pageType} (${pageUrl})'
-->

# ${headline}

:::: slideInner

:::col
## JS on
![screenshot](${relativeScreenshotPath1})
:::

:::col
## JS off
![screenshot](${relativeScreenshotPath2})
:::

${diffImageMarkdown}

:::col
## IS
## SHOULD
:::

::::

---

`;

    fs.appendFileSync(markdownFilePath, markdownSlide);
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
    const markdownDir = path.resolve(process.cwd(), topDirectory, 'markdown');
    const relativeScreenshotPath1 = path.relative(markdownDir, screenshotPath1);
    const relativeScreenshotPath2 = path.relative(markdownDir, screenshotPath2);

    const markdownSlide =

      `
<!-- 
_class: default 
_header: '${pageType} (${pageUrl})'
-->

# ${headline}

:::: slideInner

:::col
![screenshot](${relativeScreenshotPath1})
:::

:::col
![screenshot](${relativeScreenshotPath2})
:::

:::col
## IS
## SHOULD
:::

::::

[${testUrl}](${testUrl})

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
  generateMarkdownSubTitleSlide,
};
