const { execSync } = require('child_process');
const path = require('path');

const topDirectory = '_seo-tests-output';
const enginePath = path.join(__dirname, 'engine.js');

/**
 * Converts a given markdown file to specified formats (HTML and PDF).
 * Uses Marp CLI for the conversion.
 * 
 * @param {string} markdownFilePath - Absolute path to the markdown file to be converted.
 * @returns {Array<string>} - Array containing paths to the converted files.
 */
function convertMarkdown(markdownFilePath) {
    const formats = ['html', 'pdf'];
    const outputPaths = {};

    for (const format of formats) {
        const outputPath = path.join(process.cwd(), topDirectory, 'results', path.basename(markdownFilePath).replace('.md', `.${format}`));
        const themePath = path.join(__dirname, '..', 'assets', 'theme.css');
        
        let cmd = `npx @marp-team/marp-cli@latest "${markdownFilePath}" --allow-local-files --html --theme-set "${themePath}" --theme f19n-theme -o "${outputPath}" --engine "${enginePath}"`;
        
        if (format === 'pdf') {
            cmd += " --pdf";
        }
        console.log(`Converting to ${format} format.`);

        try {
            const output = execSync(cmd, { shell: '/bin/zsh', timeout: 60000 });
            console.log(output.toString());
            console.log(`Converted markdown to ${format} successfully!`);
            outputPaths[format] = outputPath;
        } catch (error) {
            console.error(`Error converting markdown to ${format}:`, error);
        }
    }

    return outputPaths;
}

module.exports = {
    convertMarkdown
};
