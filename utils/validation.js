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
    const result = await validator(page, ...args);

    return result ? 'passed' : 'failed';
  } catch (err) {
    console.error('Error during validation:', err);
    return 'failed'; // default to failed if there's an error
  }
};

/**
 * Checks the performance of the test based on the provided validation function.
 *
 * @param {object} page - Puppeteer page instance.
 * @param {function} validator - A function that validates the page and returns true for pass and false for fail.
 * @param {...any} args - Additional arguments to be passed to the validator function.
 * @returns {Promise<string>} - Test status ('passed' or 'failed').
 */
const validateTestInspectUrl = async (validator, ...args) => {
  try {
    const result = await validator(...args);

    return result ? 'passed' : 'failed';
  } catch (err) {
    console.error('Error during validation:', err);
    return 'failed'; // default to failed if there's an error
  }
};

module.exports = {
  validateTest,
  validateTestInspectUrl,
};
