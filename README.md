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

### Emailing the Reports 📧

Want to send the report directly to an email address? Use the `-m` or `--mail` option followed by the recipient's email address:

```bash
seo-tests --url https://www.example.com --mail recipient@example.com
```

or

```bash
seo-tests -u https://www.example.com -m recipient@example.com
```

You can also specify multiple email addresses by separating them with a comma:

```bash
seo-tests -u https://www.example.com -m recipient1@example.com,recipient2@example.com
```

Using the Emailing feature requires you to setup a mail service. Please refer to the [Advanced Section - Opting-In for Mailing Functionality](#opting-in-for-mailing-functionality-) below.

## Pro Tips 🌟

- **First-Time Users**: You will be prompted to manually log into your Google account during the first run. After successfully logging in, make sure to return to the terminal and press the `ENTER` key to continue. Don't worry; your credentials will be saved for future use.

## Output 📊

- **Markdown Outputs**: All markdown reports are generated and stored in the `./_seo-tests-output/markdown` directory.
- **Screenshots**: Relevant screenshots from various tests can be found in the `./_seo-tests-output/screenshots` directory.
- **HTML and PDF Outputs**: Once the markdown files are converted, you can find the HTML and PDF reports in the `./_seo-tests-output/results` directory.

## What to Expect on a Successful Run 🎉

After you've successfully run the tool, here's what you'll obtain:

### 1. Comprehensive Reports

- Markdown files with detailed information on each test will be saved in the `./_seo-tests-output/markdown` directory.

### 2. Visual Insights

- Screenshots capturing pivotal information will be stored to assist your analysis. These will be stored under `./_seo-tests-output/screenshots`.

### 3. Easy-to-Share Reports

- The Markdown files are automatically converted to HTML and PDF formats for easy sharing and reporting. These will be stored in the `./_seo-tests-output/results` directory.

### 4. Command Line Summary

- You will see a summary of the test results, along with the paths to the generated reports, directly in your command line interface.

### 5. Optional Email Reporting

- If configured, an email report containing the PDF results will be sent to a specified email address.

## Manual Conversion of Markdown files 🔄

If you want to add content to a Markdown report, you can convert a specific Markdown file to HTML and PDF manually:

```bash
seo-tests --convert path/to/your/markdown/file.md
```

or

```bash
seo-tests -c path/to/your/markdown/file.md
```

## Advanced Usage ⚙️

Beyond single runs, you might want to automate the SEO tests to run periodically. Depending on your operating system, different solutions apply:

### Prerequisites
1.  **Setup a dedicated directory for the script execution**  
First, decide on a directory where the script should run from. A suggestion might be:

    ```bash
    ~/Documents/seo-tests-monitor
    ```

    or

    ```bash
    C:\Users\YourUsername\Documents\seo-tests-monitor

    ```

2.  **Prepare the Tool for Cron Execution**  
If you've globally linked the SEO tests tool using `npm link`, you can simply call it using the `seo-tests` command. But before setting up the cron job, it's essential to ensure you've executed the command manually at least once. This step is crucial since the initial run requires user input (pressing "ENTER" after logging in to Google), which won't be possible via cron.

    ```bash
    seo-tests [your-preferred-arguments]
    ```

Ensure you've successfully logged in and that the `cookies.js` file is saved in the current directory.

### Crontab (for Mac/Linux)
1.  **Editing the Crontab**  
Now, open your terminal and enter:

    ```bash
    crontab -e
    ```

This allows you to edit the cron jobs.

2.  **Add Your Job with Logging**  
Append a new line in the format:

    ```bash
    * * * * * cd ~/Documents/seo-tests-monitor && /path/to/node /usr/local/bin/seo-tests [arguments] >> ~/Documents/seo-tests-monitor/seo-tests.log 2>&1
    ```

The five asterisks represent when the job will run (minute, hour, day of month, month, day of week). Adjust these to your desired frequency. For example, to run every day at 12:00 PM noon:

    ```bash
    0 12 * * * cd ~/Documents/seo-tests-monitor && /path/to/node /usr/local/bin/seo-tests [arguments] >> ~/Documents/seo-tests-monitor/seo-tests.log 2>&1

    ```

3.  **Save and Exit**  
Save and exit the editor.

📝 **Note**: Ensure that the paths are correct. The path `/usr/local/bin/seo-tests` assumes that's where the global npm packages are stored on your system. You might need to adjust based on your setup. You can find the path to `node` using the `which node` command and verify the path to `seo-tests` with `which seo-tests`.

📝 **Note**: Ensure that the paths to `node` and your script are correct. You can find the path to `node` using the `which node` command.

### Task Scheduler (for Windows) - Not Tested :grimacing:

1. Press Win + S and type "Task Scheduler" to open the application from the Start Menu.
2. In the Actions pane, click "Create Basic Task."
3. Name your task (e.g., "SEO Tests Monitor") and provide a description if desired. Click "Next."
4. Choose the trigger for your task (e.g., Daily, Weekly). Click "Next."
5. Set the time and frequency for your task (for our example, choose Daily and set the time to 12:00 noon). Click "Next."
6. Choose "Start a program" as the action. Click "Next."
7. In the "Program/script" field, browse to the location of your node.exe (commonly located in the C:\Program Files\nodejs directory).
8. In the "Add arguments (optional)" field, input:

    ```bash
    "C:\Users\YourUsername\Documents\seo-tests-monitor\your-seo-tests-script.js" [arguments]
    ```

Replace `YourUsername` with your actual Windows username and `your-seo-tests-script.js`` with the actual name of your script if it's different.

8. Click "Next", review your settings, and then click "Finish" to create the task.

📝 **Note**: Make sure to run the script manually from `C:\Users\YourUsername\Documents\seo-tests-monitor` at least once to handle the login step which requires user input. This ensures the `cookies.js` file is saved and the script can run automatically without interruptions.


📝 **Note**: Ensure that the paths to `node.exe` and your script are correct. Typically, `node.exe` will be located in the directory where Node.js was installed.


## Opting-In for Mailing Functionality 📧

To enhance your automated SEO tests experience, our tool provides the ability to email reports once they're generated. You can choose between two mailing services: Gmail OAuth and SendGrid. Depending on which service you're comfortable with or already have set up, you can configure either.

### Choosing the Mailing Service

1.  **Gmail OAuth**:
    *   This method requires the user to authenticate using Gmail's OAuth2 mechanism.
    *   It involves obtaining certain credentials from the Google Developer Console.
2.  **SendGrid**:
    *   SendGrid is a cloud-based SMTP provider that lets you send email without having to maintain email servers.
    *   SendGrid offers a free tier that lets you send up to 100 emails per day, making it a cost-effective option for smaller applications.

To select a service, fill in the relevant details in a `.env` file:

```env
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
```

or

```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

If none of the required keys is present mailing will not execute and the script will notify you.

### Setting up Gmail OAuth

1.  Go to the [Google Developer Console](https://console.developers.google.com/).
2.  Create a new project.
3.  Enable the Gmail API for your project.
4.  Create OAuth 2.0 credentials.
5.  Fill in the necessary details and ensure the type is set to "Web Application".
6.  Note down your `Client ID` and `Client Secret`.
7.  Use these credentials to obtain a `Refresh Token`. This step typically involves making an OAuth request, granting permissions, and then extracting the token.
8.  Update your `.env` file with the credentials obtained.

#### Obtaining the Gmail Refresh Token:

1.  **Setting up OAuth playground**:
    
    *   Go to the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
    *   On the right side, click the gear icon to open the `OAuth 2.0 configuration` settings.
    *   Check the option `Use your own OAuth credentials` and enter the `Client ID` and `Client Secret` that you got from the Google Developer Console.
    *   Click the `Close` button.

2.  **Authorize the APIs**:
    
    *   In the `Step 1 - Select & authorize APIs` section, look for `Gmail API v1` and select the scope `https://www.googleapis.com/auth/gmail.send`. This scope allows sending email only. If you want broader access, you can select other Gmail-related scopes.
    *   Click the `Authorize APIs` button.
    *   You will be redirected to a Google login page. Log in with the Gmail account you want to use with your tool.
    *   Grant the requested permissions.

3.  **Exchange authorization code for tokens**:
    
    *   Once you've granted permissions, you will be redirected back to the OAuth 2.0 Playground.
    *   In the `Step 2 - Exchange authorization code for tokens` section, click the `Exchange authorization code for tokens` button.
    *   If everything goes right, you will now see your `Refresh Token` and `Access Token`. The `Access Token` will expire after some time, but the `Refresh Token` is what you use to get a new one without having to re-authorize your application.

4.  **Update your .env file**:
    
    *   Take the `Refresh Token` and add it to your `.env` file alongside the `Client ID` and `Client Secret`:
    
    
    ```bash
    GMAIL_CLIENT_ID=Your_Client_ID
    GMAIL_CLIENT_SECRET=Your_Client_Secret
    GMAIL_REFRESH_TOKEN=Your_Refresh_Token
    ```    

### Setting up SendGrid

1.  Create an account on [SendGrid's website](https://sendgrid.com/).
2.  Navigate to the API Keys section in the dashboard.
3.  Create a new API Key with "Full Access" permissions.
4.  Copy the API key and update your `.env` file.

### Running with Emailing

For the tool to send emails after running the SEO tests, you'll need to use the `--mail` argument when invoking your script:

*   **Cron (Mac/Linux)**:
    
```bash
0 12 * * * /path/to/node /path/to/your/seo-tests-script.js -u https://www.example.com -m recipient1@example.com >> /path/to/your/logfile.log 2>&1

```        
*   **Task Scheduler (Windows)**:
    
    *   When setting up the task, in the "Add arguments" field:
        
```bash
"/path/to/your/seo-tests-script.js" -u https://www.example.com -m recipient1@example.com
```

---

This README.md has been written with love by ChatGPT V4. 💖

---

Feel free to fine-tune this README as needed!
