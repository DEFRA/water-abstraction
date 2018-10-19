const Joi = require('joi');
const { get } = require('lodash');
const { formFactory, fields, setValues } = require('../../../lib/forms');
const { STEP_BASIS, getPath } = require('../lib/flow-helpers');

/**
 * Maps data in model to basis form
 * @param {Object} data - returns model data
 * @return {Object} form values
 */
const mapModelToForm = (data) => {
  const basis = get(data, 'reading.type');
  return {
    basis
  };
};

const form = (request) => {
  const { csrfToken } = request.view;

  const action = getPath(STEP_BASIS, request);

  const f = formFactory(action);

  f.fields.push(fields.radio('basis', {
    label: 'Did you use one or more meters to calculate the volumes?',
    errors: {
      'any.required': {
        message: 'Select if you are using one or more meters or not'
      }
    },
    choices: [

      { value: 'measured',
        label: 'Yes'
      },
      {
        value: 'estimated',
        label: 'No'
      }

    ]}));

  f.fields.push(fields.button(null, { label: 'Continue' }));
  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));

  // Populate state from session
  const data = request.sessionStore.get('internalReturnFlow');
  const values = mapModelToForm(data);

  return setValues(f, values);
};

const schema = {
  basis: Joi.string().required().valid('measured', 'estimated'),
  csrf_token: Joi.string().guid().required()
};

module.exports = {
  basisForm: form,
  basisSchema: schema
};
