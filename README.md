# Web Assessment Automation Tool

This tool is designed to assess the performance and rendering of web pages using various Google tools. It ensures that pages render correctly, especially with JavaScript, and provides an in-depth analysis via different Google utilities.

## Prerequisites

- `node` and `npm`: Ensure you have Node.js and npm installed on your machine.
- `puppeteer`: Required for headless browser automation.
- `readline`: For reading user input from the command line.
- `yargs`: To handle command line arguments.

## Tests

The tool performs the following tests on the web pages:

1. **Page Speed Test** (`pagespeed`): Analyzes the speed and performance of a webpage.
2. **JavaScript On/Off Test** (`js_on_off`): Checks the webpage's rendering with JavaScript enabled and disabled.
3. **Mobile Friendliness Test** (`mobile_friendly`): Assesses how well the webpage performs on mobile devices.
4. **URL Inspection Test** (`url_inspection`): Inspects the URL for any anomalies and potential improvements.

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/hg-f19n/automated-seo-tests.git
   ```

2. Navigate to the directory:

   ```
   cd seo-tests
   ```

3. Install the necessary packages:

    ```
    npm install
    ```

4. Run the tool:

- For a single URL:

    ```
    node main.js --url [URL]
    ```

- For a batch file:

    ```
    node main.js --batch [FILE_PATH]
    ```

## Usage

### Single URL:
```
node main.js --url https://www.example.com
```

or

```
node main.js -u https://www.example.com
```

### Batch File:

```
node main.js --batch urls.txt
```

or

```
node main.js -b urls.txt
```

**Batch File Format**: The batch file should be formatted as:

```
PageType1: URL1
PageType2: URL2
...
```

### Google Account Authentication

On the first run, the tool will prompt the user to login to their Google account manually. After a successful login, cookies will be saved for subsequent runs, eliminating the need for manual login.

## Output

The results of each test are saved in the Markdown format. These Markdown files are then automatically converted to HTML and PDF for easy sharing and reporting.

### Directory Structure for Outputs:

- **Markdown Outputs**: These are saved in the `./markdown` directory.
- **HTML and PDF Outputs**: After the Markdown results are generated, they're converted into HTML and PDF formats and saved in the `./results` directory.

### Conversion:

The conversion of Markdown files to HTML and PDF formats is powered by Marp CLI. Our tool employs the `convertMarkdown` utility, which can be found in `./utils/conversion`, to leverage Marp's capabilities and transform Markdown documents seamlessly.

### Manual Conversion

To manually convert a specific Markdown file to HTML and PDF, use the `--convert` or `-c` option followed by the path to the Markdown file:


```bash
node main.js --convert path/to/your/markdown/file.md
```

or

```bash
node main.js -c path/to/your/markdown/file.md
```

Replace <path_to_your_markdown_file> with the appropriate path.



