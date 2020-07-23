'use strict';

const Joi = require('@hapi/joi');

const { formFactory, fields } = require('shared/lib/forms/');

/**
 * Form to request if an FAO contact should be added to the invoice account
 *
 * @param {Object} request The Hapi request object
 * @param {Boolean}  selected value used to determine what radio option should be checked
  */
const addFaoForm = (request, selected) => {
  const { csrfToken } = request.view;
  const action = '/invoice-accounts/create/add-fao';
  // when the form is validated the regionId and companyId is set to ''
  const regionId = (request.params.regionId) ? request.params.regionId : '';
  const companyId = request.params.companyId ? request.params.companyId : '';
  const yes = { value: 'yes', label: 'Yes' };
  const no = { value: 'no', label: 'No' };
  const checkedOption = selected ? yes : no;

  const f = formFactory(action, 'POST');

  f.fields.push(fields.radio('faoRequired', {
    errors: {
      'any.required': {
        message: 'Select yes if you need to add a person or department as an FAO'
      }
    },
    choices: [yes, no],
    hint: 'For example, FAO Sam Burridge or FAO Accounts department'
  }, checkedOption));
  f.fields.push(fields.hidden('companyId', {}, companyId));
  f.fields.push(fields.hidden('regionId', {}, regionId));
  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));
  f.fields.push(fields.button(null, { label: 'Continue' }));

  return f;
};

const addFaoFormSchema = (request) => {
  return {
    csrf_token: Joi.string().uuid().required(),
    companyId: Joi.string().uuid().required(),
    regionId: Joi.string().uuid().required(),
    faoRequired: Joi.string().required().valid(['yes', 'no'])
  };
};

exports.addFaoForm = addFaoForm;
exports.addFaoFormSchema = addFaoFormSchema;
