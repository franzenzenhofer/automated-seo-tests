# Automated SEO Tests Automation Tool: Your Swiss Knife for Technical Onpage/Onsite SEO!

Get ahead of your competition by ensuring your website's performance and rendering are top-notch. This tool automates four pivotal SEO tests, helping you achieve 80% of the technical onpage/onsite SEO effectively. 

## Why These Four SEO Tests are Crucial 🎯

### 1. Page Speed Insights 
Aim for a minimum score of 80 (still orange), preferably 90 (green). The tool provides insightful screenshots for both desktop and mobile views to guide your optimization strategies.

### 2. Google Mobile Friendly Test
Your website must pass this test with a green score. The tool also captures a meaningful screenshot to provide a holistic view of mobile compatibility.

### 3. "JavaScript Turned Off" Test
Your website should:

- Display above-the-fold and main content even with JavaScript turned off.
- Ensure that visible links are operational without JavaScript.

### 4. Google Search Console URL Inspection
The tool performs a "Test Live URL" and captures a screenshot of the rendered page. Note that images below the fold may get lazy-loaded.

For an in-depth understanding of these tests and why they are essential, check out [Franz Enzenhofer's SEO Approach](https://www.fullstackoptimization.com/a/seo-basics).

## Prerequisites 🛠

- `Node.js (v16 or higher)` and `npm`: If you're new to Node.js or running a version below 16, download and install the latest version from [nodejs.org](https://nodejs.org/).

## Getting Started 🚀

### Installation

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/hg-f19n/automated-seo-tests.git
   ```

2. **Navigate to the Directory**  
   ```bash
   cd automated-seo-tests
   ```

3. **Install Dependencies**  
   ```bash
   npm install
   ```

4. **Global Access**  
   ```bash
   npm link
   ```

   This creates a symlink for global command `seo-tests`.

## Usage 🕹

### For the Single URL Aficionados

```bash
seo-tests --url https://www.example.com
```
_or_
```bash
seo-tests -u https://www.example.com
```

### For the Batch Processing Enthusiasts

```bash
seo-tests --batch urls.txt
```
_or_
```bash
seo-tests -b urls.txt
```

📝 **Batch File Format**:  
```
PageType1: URL1
PageType2: URL2
...
```

## Pro Tips 🌟

- **First-Time Users**: You will be prompted to manually log into your Google account during the first run. Don't worry; your credentials will be saved for future use.
  
## Output 📊

- **Markdown Outputs**: All markdown reports are generated and stored in the `./_seo-tests-output/markdown` directory.
- **Screenshots**: Relevant screenshots from various tests can be found in the `./_seo-tests-output/screenshots` directory.
- **HTML and PDF Outputs**: Once the markdown files are converted, you can find the HTML and PDF reports in the `./_seo-tests-output/results` directory.

## What to Expect on a Successful Run 🎉

After you've successfully run the tool, here's what you'll obtain:

### 1. Comprehensive Reports
- Markdown files with detailed information on each test will be saved in the `./markdown` directory.
  
### 2. Visual Insights
- Screenshots capturing pivotal information will be stored to assist your analysis. These will be stored under `_seo-tests-output/screenshots`.

### 3. Easy-to-Share Reports
- The Markdown files are automatically converted to HTML and PDF formats for easy sharing and reporting. These will be stored in the `./results` directory.

### 4. Command Line Summary
- You will see a summary of the test results, along with the paths to the generated reports, directly in your command line interface.

### 5. Optional Email Reporting
- If configured, an email report containing the PDF results will be sent to a specified email address.

## Manual Conversion 🔄

Convert a specific Markdown file to HTML and PDF:

```bash
seo-tests --convert path/to/your/markdown/file.md
```
_or_
```bash
seo-tests -c path/to/your/markdown/file.md
```



---

This README.md has been written with love by ChatGPT V4. 💖

---

Feel free to fine-tune this README as needed!