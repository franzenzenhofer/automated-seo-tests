/**
 * Checks the performance of the test based on the provided validation function.
 *
 * @param {object} page - Puppeteer page instance.
 * @param {function} validator - A function that validates the page and returns true for pass and false for fail.
 * @param {...any} args - Additional arguments to be passed to the validator function.
 * @returns {Promise<string>} - Test status ('passed' or 'failed').
 */
const validateTest = async (page, validator, ...args) => {
  try {
    let result;

    if (validator.length > 0 && page) { // Checks if validator accepts arguments (i.e., the page)
      result = await validator(page, ...args);
    } else {
      result = await validator();
    }

    return result;  // Now directly returns 'passed', 'failed', or 'warning'
  } catch (err) {
    console.error('Error during validation:', err);
    return 'failed'; // default to failed if there's an error
  }
};

module.exports = {
  validateTest,
};
