'use strict';

const urlJoin = require('url-join');
const Joi = require('@hapi/joi');
const { formFactory, fields } = require('shared/lib/forms/');
const { has } = require('lodash');
/**
 * Form to request if an FAO contact should be added to the invoice account
 *
 * @param {Object} request The Hapi request object
 * @param {Boolean}  selected value used to determine what radio option should be checked
  */
const form = (request, sessionData = {}) => {
  const { csrfToken } = request.view;
  const { licenceId, elementId } = request.params;
  const action = urlJoin('/licences/', licenceId, 'charge-information/charge-element', elementId, 'period');
  const startDate = has(sessionData, 'abstractionPeriod.startDay')
    ? `${sessionData.abstractionPeriod.startMonth}-${sessionData.abstractionPeriod.startDay}` : '';
  const endDate = has(sessionData, 'abstractionPeriod.endDay')
    ? `${sessionData.abstractionPeriod.startMonth}-${sessionData.abstractionPeriod.startDay}` : '';

  const f = formFactory(action, 'POST');
  f.fields.push(fields.date('startDate', {
    label: 'Start Date',
    subHeading: true,
    items: ['day', 'month'],
    errors: {
      'any.required': {
        message: 'Enter the start day and month'
      },
      'any.empty': {
        message: 'Enter the start day and month'
      },
      'string.regex.base': { 
        message: 'Enter the start date in the right format, for example 31 3'
      }
    }
  }, startDate));
  f.fields.push(fields.date('endDate', {
    label: 'End Date',
    subHeading: true,
    items: ['day', 'month'],
    errors: {
      'any.required': {
        message: 'Enter the end day and month'
      },

      'any.empty': {
        message: 'Enter the end day and month'
      },
      'string.regex.base': {
        message: 'Enter the end date in the right format, for example 31 6'
      }
    }
  }, endDate));
  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));
  f.fields.push(fields.button(null, { label: 'Continue' }));

  return f;
};

const schema = (request) => {
  return {
    csrf_token: Joi.string().uuid().required(),
    startDate: Joi.string().regex(/^(([1-9])|((0)[0-9])|((1)[0-2]))-([1-9]|[0-2][0-9]|(3)[0-1])$/).required(),
    endDate: Joi.string().regex(/^(([1-9])|((0)[0-9])|((1)[0-2]))-([1-9]|[0-2][0-9]|(3)[0-1])$/).required()
  };
};

exports.schema = schema;
exports.form = form;
