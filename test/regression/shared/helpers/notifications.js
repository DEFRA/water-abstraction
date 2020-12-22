'use strict';

/* eslint-disable no-undef */
const { get } = require('lodash');
const querystring = require('querystring');

/**
 * Gets the data for the last notification sent to the supplied email address
 * @param {String} email
 * @return {Object}
 */
const getLastNotifications = (baseUrl, email) => {
  // Go to the last notification page
  const url = `${baseUrl}/notifications/last?${querystring.encode({ email })}`;
  browser.url(url);

  // Get the content body and parse JSON
  const content = $('pre').getText(false);
  return JSON.parse(content);
};

/**
 * Gets personalisation option in last email sent
 * @param {String} email
 * @param {String} param
 * @return {Mixed}
 */
const getPersonalisation = (baseUrl, email, param) => {
  const data = getLastNotifications(baseUrl, email);
  return get(data, `data[0].personalisation.${param}`);
};

exports.getPersonalisation = getPersonalisation;
