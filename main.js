#!/usr/bin/env node

global.siteUrl = {};

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const readline = require('readline');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');


// Importing required test modules.
const pagespeedTest = require("./tests/pagespeed");
const jsOnOffTest = require("./tests/js_on_off");
const mobileFriendlyTest = require("./tests/mobile_friendly");
const urlInspectionTest = require("./tests/url_inspection");

// Importing utilities.
const { saveCookies, loadCookies, isLoggedIn } = require('./utils/cookies');
const { sleep } = require('./utils/navigation');
const { getSiteUrl } = require('./utils/sanitizers');
const markdown = require('./utils/markdown');
const { convertMarkdown } = require('./utils/conversion');
const { sendReport } = require('./utils/mailer');

const topDirectory = '_seo-tests-output';
const subDirectories = ['screenshots', 'markdown', 'results'];

// Ensure the top directory exists
const topDirPath = path.join(process.cwd(), topDirectory);
if (!fs.existsSync(topDirPath)) {
    fs.mkdirSync(topDirPath);
}

// Ensure subdirectories exist within the top directory
subDirectories.forEach(dir => {
    const dirPath = path.join(topDirPath, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
});

// Parse command line arguments.
const argv = yargs(hideBin(process.argv)).argv;

// Manual conversion
if (argv.convert || argv.c) {
  const mdFilePath = argv.convert || argv.c;
  if (fs.existsSync(mdFilePath)) {
      try {
          const outputPaths = convertMarkdown(mdFilePath);
          console.log('Conversion completed. Files saved at:', outputPaths);
      } catch (error) {
          console.error('Error during manual conversion:', error);
      }
  } else {
      console.error(`File ${mdFilePath} does not exist.`);
  }
  process.exit();
}

let pages = {};

if (argv.url || argv.u) {
  pages = { "PageType": argv.url || argv.u };
} else if (argv.batch || argv.b) {
  const batchFile = argv.batch || argv.b;
  const fileContents = fs.readFileSync(batchFile, 'utf-8');
  const lines = fileContents.split('\n');

  for (const line of lines) {
    const parts = line.split(':');
    if (parts.length > 1) {
      const pageType = parts[0].trim();
      const url = parts.slice(1).join(':').trim();
      pages[pageType] = url;
    }
  }
} else {
  console.error('Please provide --url or --batch argument');
  process.exit(1);
}

global.siteUrl = getSiteUrl(pages);

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1400, height: 900 },
    });
  } catch (error) {
    console.error("Error launching the browser:", error);
    return;
  }

  const page = await browser.newPage();
  await page.goto('https://accounts.google.com');

  try {
    await loadCookies(page);
    const loggedIn = await isLoggedIn(page);
    if (!loggedIn) {
      console.log('Cookies are outdated or invalid.');
      throw new Error('Cookies are outdated or invalid.');
    }
  } catch (error) {
    if (error.message === 'No cookies file found.' || error.message === 'Cookies are outdated or invalid.') {
      console.log('Navigating to Google sign in page.');
      await page.goto('https://accounts.google.com/signin');
  
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
  
      await new Promise((resolve, reject) => {
        rl.question("Please login to your Google account in the browser then press Enter to continue...", function (answer) {
          resolve();
        });
      });
  
      rl.close();
  
      await saveCookies(page);
      await sleep(2000);
    } else {
      console.error(`Error loading cookies: ${error}`);
      process.exit(1); // or whatever your error handling strategy is
    }
  }

  let isFirstPage = true;
  const markdownFilePath = await markdown.createNewMarkdownFile(global.siteUrl);

  for (const [pageType, url] of Object.entries(pages)) {
    await markdown.generateMarkdownSubTitleSlide(pageType, url, markdownFilePath);
    const pagespeedData = await pagespeedTest(browser, pageType, url, global.siteUrl, isFirstPage, markdownFilePath);
    const jsOnOffData = await jsOnOffTest(browser, pageType, url, markdownFilePath);
    const mobileFriendlyData = await mobileFriendlyTest(browser, pageType, url, markdownFilePath);
    const urlInspectionData = await urlInspectionTest(browser, pageType, url, global.siteUrl, markdownFilePath);
    isFirstPage = false;
  }

  await browser.close();

  try {
    const outputPaths = await convertMarkdown(markdownFilePath);
    console.log('Conversion completed. Files saved at:', outputPaths);
    //sendReport([outputPaths.pdf], 'holger.guggi@fullstackoptimization.com');
  } catch (error) {
    console.error('Error during conversion:', error);
  }

})();
