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

   ```bash
   git clone [REPO_URL]
   ```

2. Navigate to the directory:

   ```bash
   cd [DIRECTORY_NAME]
   ```

3. Install the necessary packages:

    ```bash
    npm install
    ```

4. Run the tool:

- For a single URL:

    ```bash
    node [script-name.js] --url [URL]
    ```

- For a batch file:

    ```bash
    node [script-name.js] --batch [FILE_PATH]
    ```

## Usage

### Single URL:

    ```bash
    node <script-name> --url [URL]
    ```

or

    ```bash
    node <script-name> -u [URL]
    ```

### Batch File:

    ```bash
    node <script-name> --batch [FILE_PATH]
    ```

or

    ```bash
    node <script-name> -b [FILE_PATH]
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

The results from each test are saved in markdown format.
