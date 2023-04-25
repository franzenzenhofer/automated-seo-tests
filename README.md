# Automated SEO Tests with Puppeteer

This Node.js script uses Puppeteer to run Google PageSpeed Insights tests in the browser and captures screenshots of the test results.

## Prerequisites

- Node.js (version 14 or later)

## Installation

1. Clone this repository or download the project files.
2. Navigate to the project directory in the terminal.
3. Run the following command to install the required dependencies:

```bash
npm install
```

## Configuration

Edit the `config.js` file to add your URLs and corresponding page types and replace `/path/to/your/chrome` with the path to your system's Chrome executable. The path varies depending on your operating system:

-   Windows: `'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'`
-   macOS: `'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`
-   Linux: `'/usr/bin/google-chrome'` (may vary depending on the installation method)

Now the script will use your system-installed Chrome in incognito mode when running the tests.

```
module.exports = {
  chromePath: '/path/to/your/chrome',
  pages: {
    'homepage': 'https://www.example.com',
    'about': 'https://www.example.com/about',
    // Add more URLs as needed
  }
};
```

## Usage

Run the script by executing the following command in the terminal:

```
node index.js
```
The script will run PageSpeed Insights tests for each URL specified in the `config.js` file. Screenshots of the test results will be saved in the `screenshots` folder, with filenames in the format `pagetype_timestamp.png`.