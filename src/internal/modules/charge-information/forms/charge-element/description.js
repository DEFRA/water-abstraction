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
  const action = routing.getChargeElementStep(licenceId, 'description');

  const f = formFactory(action, 'POST');
  f.fields.push(fields.text('description', {
    hint: 'For example, describe where the abstraction point is',
    errors: {
      'any.empty': {
        message: 'Enter a description of the element'
      }
    }
  }, sessionData.description || ''));
  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));
  f.fields.push(fields.button(null, { label: 'Continue' }));

  return f;
};

const schema = (request) => {
  return {
    csrf_token: Joi.string().uuid().required(),
    description: Joi.string().required()
  };
};

exports.schema = schema;

exports.form = form;
