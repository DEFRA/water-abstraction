'use strict';

const routing = require('../../lib/routing');
const Joi = require('@hapi/joi');
const { formFactory, fields } = require('shared/lib/forms/');

/**
 * Form to request if an FAO contact should be added to the invoice account
 *
 * @param {Object} request The Hapi request object
 * @param {Boolean}  selected value used to determine what radio option should be checked
  */
const form = (request, sessionData = {}) => {
  const { csrfToken } = request.view;
  const { licenceId } = request.params;
  const action = routing.getChargeElementStep(licenceId, 'quantities');

  const f = formFactory(action, 'POST');
  f.fields.push(fields.text('authorisedAnnualQuantity', {
    controlClass: 'govuk-input govuk-input--width-10',
    label: 'Authorised',
    suffix: 'megalitres per year',
    errors: {
      'any.empty': {
        message: 'Enter an authorised quantity'
      },
      'number.base': {
        message: 'Enter a valid authorised quantity as a number that is more than zero'
      }
    }
  }, sessionData.authorisedAnnualQuantity || ''));
  f.fields.push(fields.text('billableAnnualQuantity', {
    controlClass: 'govuk-input govuk-input--width-10',
    label: 'Billable (optional)',
    suffix: ' megalitres per year',
    errors: {
      'number.base': {
        message: 'Enter a valid billable quantity as a number that is more than zero'
      }
    }
  }, sessionData.billableAnnualQuantity || ''));
  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));
  f.fields.push(fields.button(null, { label: 'Continue' }));

  return f;
};

const schema = (request) => {
  return {
    csrf_token: Joi.string().uuid().required(),
    authorisedAnnualQuantity: Joi.number().integer().required(),
    billableAnnualQuantity: Joi.number().integer().allow('').optional()
  };
};

exports.schema = schema;

exports.form = form;
