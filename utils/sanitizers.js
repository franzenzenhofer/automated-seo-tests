const config = require('../config');
const pages = config.pages;

const getSiteUrl = (clean = false) => {
  const firstPageUrl = Object.values(pages)[0];
  let siteUrlBase = new URL(firstPageUrl).origin;
  // Add a trailing slash to siteUrl if it doesn't have one
  siteUrlBase = siteUrlBase.endsWith('/') ? siteUrlBase : `${siteUrlBase}/`;

  // Sanitize URL if 'clean' parameter is true
  if (clean) {
    siteUrlBase = domainNameFromUrl(siteUrlBase);
  }

  return siteUrlBase;
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
