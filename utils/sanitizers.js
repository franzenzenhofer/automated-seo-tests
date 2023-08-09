const config = require('../config');
const pages = config.pages;

/**
 * Retrieves the base URL of the first page in the 'pages' object. 
 * The returned object contains both the full and sanitized versions of the URL.
 * 
 * @returns {Object} An object containing:
 *   - full {string}: The full base URL with a trailing slash, if needed.
 *   - domain {string}: The sanitized version of the URL, with protocol and www. removed, if present.
 */
const getSiteUrl = () => {
  const firstPageUrl = Object.values(pages)[0];
  let siteUrlBase = new URL(firstPageUrl).origin;
  // Add a trailing slash to siteUrl if it doesn't have one
  siteUrlBase = siteUrlBase.endsWith('/') ? siteUrlBase : `${siteUrlBase}/`;

  const siteUrlCleaned = domainNameFromUrl(siteUrlBase);

  return {
    full: siteUrlBase,
    domain: siteUrlCleaned
  };
};

/**
 * Removes the protocol (http/https) and optional 'www.' prefix from a given URL.
 * It also strips the trailing slash if present.
 *
 * @param {string} url - The URL to process.
 * @returns {string} The sanitized domain name from the provided URL.
 */
const domainNameFromUrl = (url) => {
  return url.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'');
};

/**
 * Removes spaces from a string and converts it to lowercase.
 *
 * @param {string} str - The string to sanitize.
 * @returns {string} The sanitized string.
 */
function sanitizeString(str) {
  return str.replace(/\s+/g, '').toLowerCase();
}

module.exports = {
  domainNameFromUrl,
  getSiteUrl,
  sanitizeString,
};
