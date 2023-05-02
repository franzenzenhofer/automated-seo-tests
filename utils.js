const fs = require('fs');

const logToCsv = (pageType, updatedUrl) => {
  const csvFile = `results-test-urls.csv`;
  const row = `"${pageType}","${updatedUrl}"\n`;

  fs.appendFile(csvFile, row, (err) => {
    if (err) {
      console.error('Error appending to CSV file:', err);
    } else {
      console.log(`Appended result to CSV file: ${csvFile}`);
    }
  });
};

module.exports = {
  logToCsv,
};