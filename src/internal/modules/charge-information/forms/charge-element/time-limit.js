'use strict';

const routing = require('../../lib/routing');
const { has } = require('lodash');
const { formFactory, fields } = require('shared/lib/forms/');
const Joi = require('@hapi/joi');

/**
 * returns the errors for the start and end date form fields
 * @param {string} key start or end
 */
const getError = (key) => {
  return {
    invalid: {
      message: `Enter the ${key} date in the right format, for example 31 3 2018`
    },
    empty: {
      message: `Enter a ${key} date for the time limit`
    },
    beforeChargeStart: {
      message: 'Enter a start date on or after the charge information start date'
    }
  };
};

/**
 * This method returns a date field - it is extracted to avoid code duplication
 * @param {string} key either start or end used to define the date field
 * @param {object} values session data to preload the form
 */
const getDateField = (key, values) => {
  return fields.date(`${key}Date`, {
    label: 'Enter start date',
    type: 'date',
    mapper: 'dateMapper',
    subHeading: true,
    errors: {
      'any.required': getError(key).empty,
      'string.isoDate': getError(key).invalid,
      'date.isoDate': getError(key).invalid,
      'date.base': getError(key).invalid
    }
  }, values[key + 'Date']);
};

const options = values => {
  return [
    {
      value: 'yes',
      label: 'Yes',
      fields: [ getDateField('start', values), getDateField('end', values) ]
    },
    { value: false, label: 'No' }
  ];
};

/**
 * Form to request if an FAO contact should be added to the invoice account
 *
 * @param {Object} request The Hapi request object
 * @param {Boolean}  selected value used to determine what radio option should be checked
  */
const form = (request, sessionData = {}, defaultChargeData = [], draftChargeData = {}) => {
  const { csrfToken } = request.view;
  const { licenceId } = request.params;
  const action = routing.getChargeElementStep(licenceId, 'time');
  let selectedValue;
  if (!(has(sessionData, 'timeLimitedPeriod'))) {
    selectedValue = '';
  } else {
    selectedValue = !sessionData.timeLimitedPeriod ? false : 'yes';
  }

  const dates = (has(sessionData, 'timeLimitedPeriod.startDate')) ? sessionData.timeLimitedPeriod : { startDate: null, endDate: null };

  const f = formFactory(action, 'POST');

  f.fields.push(fields.radio('timeLimitedPeriod', {
    errors: {
      'any.required': {
        message: 'Select yes if you want to set a time limit. Select no to continue'
      }
    },
    choices: options(dates)
  }, selectedValue));
  f.fields.push(fields.hidden('chargeStartDate', {}, draftChargeData.startDate));
  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));
  f.fields.push(fields.button(null, { label: 'Continue' }));

  return f;
};

const schema = (request) => {
  return {
    chargeStartDate: Joi.date().iso(),
    csrf_token: Joi.string().uuid().required(),
    timeLimitedPeriod: Joi.string().required().allow(['yes', false]),
    startDate: Joi.when('timeLimitedPeriod', {
      is: 'yes',
      then: Joi.date().iso().greater(Joi.ref('chargeStartDate')).required()
    }),
    endDate: Joi.when('timeLimitedPeriod', {
      is: 'yes',
      then: Joi.date().iso().greater(Joi.ref('startDate')).required()
    })
  };
};

exports.schema = schema;
exports.form = form;
