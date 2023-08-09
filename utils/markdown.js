const fs = require("fs");
const path = require("path");

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
theme: custom-theme
paginate: true
header: 'Header content'
footer: '![image](${relativelogoPath})'
---

#test

`;

  fs.writeFileSync(markdownFilePath, frontMatter); // Create a file with front matter
  return markdownFilePath;
};

/**
 * Generates a markdown slide with a headline, screenshot, and page URL.
 * This slide is appended to the specified markdown file.
 * 
 * @param {string} headline - The main title for the slide.
 * @param {string} screenshotPath - Path to the screenshot image.
 * @param {string} pageUrl - Web page URL associated with the slide.
 * @param {string} markdownFilePath - Path to the markdown file to which the slide will be appended.
 */
const generateMarkdownSlide = async (headline, screenshotPath, pageUrl, markdownFilePath) => {
  try {
    const markdownDir = path.resolve(__dirname, '../markdown');
    const relativeScreenshotPath = path.relative(markdownDir, screenshotPath);
    const markdownSlide = 
    
`
<!-- _class: default -->

# ${headline}

![w:auto h:auto](${relativeScreenshotPath})
[${pageUrl}](${pageUrl})

---

`;

    fs.appendFileSync(markdownFilePath, markdownSlide); // append the markdown slide to the file
  } catch (error) {
    console.error(`Failed to generate markdown slide. ${error}`);
  }
};

/**
 * Generates a markdown slide with a main headline and two sub-sections.
 * Each sub-section contains a sub-headline, screenshot, and page URL.
 * This slide is appended to the specified markdown file.
 * 
 * @param {string} headline - The main title for the slide.
 * @param {string} subheadline1 - The title for the first sub-section.
 * @param {string} subheadline2 - The title for the second sub-section.
 * @param {string} screenshotPath1 - Path to the first screenshot image.
 * @param {string} screenshotPath2 - Path to the second screenshot image.
 * @param {string} pageUrl1 - Web page URL for the first sub-section.
 * @param {string} pageUrl2 - Web page URL for the second sub-section.
 * @param {string} markdownFilePath - Path to the markdown file to which the slide will be appended.
 */
const generateMarkdownSlideWithTwoImages = async (headline, subheadline1, subheadline2, screenshotPath1, screenshotPath2, pageUrl1, pageUrl2, markdownFilePath) => {
  try {
    const markdownDir = path.resolve(__dirname, '../markdown');
    const relativeScreenshotPath1 = path.relative(markdownDir, screenshotPath1);
    const relativeScreenshotPath2 = path.relative(markdownDir, screenshotPath2);
    
    const markdownSlide = 
    
`
<!-- _class: split -->

# ${headline}

<div style="display: flex; justify-content: space-between;">
    <div style="width: 49%;">
      <h2>${subheadline1}</h2>
      <img src="${relativeScreenshotPath1}"/>
      <a href="${pageUrl1}">${pageUrl1}</a>
    </div>
    <div style="width: 49%;">
      <h2>${subheadline2}</h2>
      <img src="${relativeScreenshotPath2}"/>
      <a href="${pageUrl2}">${pageUrl2}</a>
    </div>
</div>

---

`;

    fs.appendFileSync(markdownFilePath, markdownSlide); // append the markdown slide to the file
  } catch (error) {
    console.error(`Failed to generate markdown slide. ${error}`);
  }
};

module.exports = {
  createNewMarkdownFile,
  generateMarkdownSlide,
  generateMarkdownSlideWithTwoImages
};
