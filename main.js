#!/usr/bin/env node

// Set a global siteUrl object that will be used across the script.
global.siteUrl = {};

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const readline = require('readline');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');


// Importing test modules to perform specific SEO checks.
const pagespeedTest = require("./tests/pagespeed");
const jsOnOffTest = require("./tests/js_on_off");
const mobileFriendlyTest = require("./tests/mobile_friendly");
const urlInspectionTest = require("./tests/url_inspection");

// Importing utility modules for functionalities like saving/loading cookies, conversions, mail, etc.
const { saveCookies, loadCookies, isLoggedIn } = require('./utils/cookies');
const { sleep } = require('./utils/navigation');
const { getSiteUrl } = require('./utils/sanitizers');
const markdown = require('./utils/markdown');
const { convertMarkdown } = require('./utils/conversion');
const { sendReport } = require('./utils/mailer');
const { sendReportSendGrid } = require('./utils/mailerSendGrid');

// Define constants for directory structure.
const topDirectory = '_seo-tests-output';
const subDirectories = ['screenshots', 'markdown', 'results'];

// Ensure the top directory exists.
const topDirPath = path.join(process.cwd(), topDirectory);
if (!fs.existsSync(topDirPath)) {
  fs.mkdirSync(topDirPath);
}

// Ensure subdirectories exist within the top directory.
subDirectories.forEach(dir => {
  const dirPath = path.join(topDirPath, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
});

// Parse command-line arguments to determine script behavior.
const argv = yargs(hideBin(process.argv))
  .option('m', {
    alias: 'mail',
    describe: 'Email addresses to send the report to',
    type: 'string'
  })
  .argv;

// If a convert argument is passed, manually convert the specified markdown file and then exit.
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

// Determine which pages to test based on arguments: single URL or batch from file.
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

// Main workflow begins here.

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
    // Load cookies for the page and check if the user is logged into Google.
    await loadCookies(page);
    const loggedIn = await isLoggedIn(page);
    if (!loggedIn) {
      console.log('Cookies are outdated or invalid.');
      throw new Error('Cookies are outdated or invalid.');
    }
  } catch (error) {
    // If no cookies are found or if they're invalid, navigate to Google sign-in page.
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
      // Save cookies after logging in.
      await saveCookies(page);
      await sleep(2000);
    } else {
      console.error(`Error loading cookies: ${error}`);
      process.exit(1); // or whatever your error handling strategy is
    }
  }

  // Iterate through each page and run the various SEO tests on them.
  let isFirstPage = true;
  const outputDir = process.cwd();
  const markdownFilePath = await markdown.createNewMarkdownFile(global.siteUrl, outputDir);
  for (const [pageType, url] of Object.entries(pages)) {
    await markdown.generateMarkdownSubTitleSlide(pageType, url, markdownFilePath);
    const pagespeedData = await pagespeedTest(browser, pageType, url, global.siteUrl, isFirstPage, markdownFilePath);
    const jsOnOffData = await jsOnOffTest(browser, pageType, url, markdownFilePath);
    const mobileFriendlyData = await mobileFriendlyTest(browser, pageType, url, markdownFilePath);
    const urlInspectionData = await urlInspectionTest(browser, pageType, url, global.siteUrl, markdownFilePath);
    isFirstPage = false;
  }

  await browser.close();

  // Convert the generated markdown into the desired output format.
  try {
    const outputPaths = await convertMarkdown(markdownFilePath);
    console.log('Conversion completed. Files saved at:', outputPaths);
    if (argv.m || argv.mail) {
      const recipients = argv.m || argv.mail;
      sendReportSendGrid([outputPaths.pdf], recipients);
    }
  } catch (error) {
    console.error('Error during conversion:', error);
  }

})();