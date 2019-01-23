const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});
const { APIClient } = require('@envage/hapi-pg-rest-api');
const { getReportRequestOptions } = require('./returns-reports');
/**
 * Create a returns API client for the given resource name
 * @param {String} name - the entity name
 * @return {Object} HAPI REST API client
 */
const createClient = (name) => {
  return new APIClient(rp, {
    endpoint: `${process.env.RETURNS_URI}/${name}`,
    headers: {
      Authorization: process.env.JWT_TOKEN
    }
  });
};

const returns = createClient('returns');

/**
 * Gets the report with the specified name
 * @param  {String} reportName  - report name corresponding to API endpoint in returns service
 * @param  {Object} [filter={}] - filtering options for returns
 * @return {Promise}             resolves with response from HTTP call
 */
returns.getReport = (reportName, filter = {}) => {
  const options = getReportRequestOptions(reportName, filter);
  return rp(options);
};

module.exports = {
  returns,
  versions: createClient('versions'),
  lines: createClient('lines')
};
