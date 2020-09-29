'use strict';

const routing = require('../../lib/routing');
const Joi = require('@hapi/joi');
const { formFactory, fields } = require('shared/lib/forms/');
const { uniqBy } = require('lodash');

const options = defaultCharges => {
  return uniqBy(defaultCharges.map(row => {
    return { value: row.purposeUse.id, label: row.purposeUse.name };
  }), 'value');
};

/**
 * Form to request the charge element purpose
 *
 * @param {Object} request The Hapi request object
 * @param {Boolean}  data object containing selected and default options for the form
  */
const form = (request, sessionData = {}) => {
  const { csrfToken } = request.view;
  const { defaultCharges } = request.pre;
  const { licenceId, elementId } = request.params;
  const action = routing.getChargeElementStep(licenceId, elementId, 'purpose');

  const f = formFactory(action, 'POST');

  f.fields.push(fields.radio('purpose', {
    errors: {
      'any.required': {
        message: 'Select a purpose use'
      }
    },
    choices: options(defaultCharges)
  }, sessionData.purpose || ''));
  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));
  f.fields.push(fields.button(null, { label: 'Continue' }));

  return f;
};

const schema = (request) => {
  return {
    csrf_token: Joi.string().uuid().required(),
    purpose: Joi.string().uuid().required()
  };
};

exports.schema = schema;

exports.form = form;