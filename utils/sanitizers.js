const config = require('../config');
const pages = config.pages;

/**
 * Retrieves the base URL of the first page in the 'pages' object. 
 * The returned object contains both the full and sanitized versions of the URL.
 * 
 * @returns {Object} An object containing:
 *   - full {string}: The full base URL with a trailing slash, if needed.
 *   - domain {string}: The sanitized version of the URL, with protocol and www. removed, if present.
 *
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

const domainNameFromUrl = (url) => {
  return url.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'');
};

function sanitizeString(str) {
  return str.replace(/\s+/g, '').toLowerCase();
}

module.exports = {
  domainNameFromUrl,
  getSiteUrl,
  sanitizeString,
};
