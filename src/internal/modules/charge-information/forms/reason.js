'use strict';

const { get } = require('lodash');
const Joi = require('@hapi/joi');

const { formFactory, fields } = require('shared/lib/forms/');
const routing = require('../lib/routing');
const { getActionUrl } = require('../lib/form-helpers');

const mapChoice = changeReason => ({
  value: changeReason.id,
  label: changeReason.description
});

/**
 * Select reason for new charge version
 */
const selectReasonForm = request => {
  const { csrfToken } = request.view;
  const { changeReasons, licence, draftChargeInformation } = request.pre;

  const changeReasonId = get(draftChargeInformation, 'changeReason.id');
  const action = getActionUrl(request, routing.getReason(licence.id));

  const f = formFactory(action, 'POST');

  f.fields.push(fields.radio('reason', {
    errors: {
      'any.required': {
        message: 'Select a reason for new charge information'
      }
    },
    choices: [
      ...changeReasons.map(mapChoice),
      { divider: 'or' },
      { label: 'Make this licence non-chargeable', value: 'non-chargeable' }
    ]
  }, changeReasonId));

  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));
  f.fields.push(fields.button(null, { label: 'Continue' }));

  return f;
};

const selectReasonSchema = request => {
  const { changeReasons } = request.pre;

  return {
    csrf_token: Joi.string().uuid().required(),
    reason: Joi.string().required().valid([
      ...changeReasons.map(changeReason => changeReason.id),
      'non-chargeable'
    ])
  };
};

exports.form = selectReasonForm;
exports.schema = selectReasonSchema;
