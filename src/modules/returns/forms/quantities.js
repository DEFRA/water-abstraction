const Joi = require('joi');
const { get } = require('lodash');
const { formFactory, fields, setValues } = require('../../../lib/forms');
const { getFormLines, getLineLabel, getLineName, getLineValues } = require('../lib/return-helpers');
const { STEP_QUANTITIES, getPath } = require('../lib/flow-helpers');
const { getSuffix } = require('../lib/helpers');
const { isInternal } = require('../../../lib/permissions');

const getHeading = request => {
  const text = isInternal(request) ? 'Volumes' : 'Your abstraction volumes';
  return fields.paragraph(null, { element: 'h3', controlClass: 'govuk-heading-m', text });
};

const getIntroText = request => {
  if (isInternal(request)) {
    return [fields.paragraph(null, { element: 'span', controlClass: 'govuk-body', text: 'Volumes entered should be calculated manually.' }),
      fields.paragraph(null, { text: 'Take into consideration the x10 display.' })];
  }
  return [fields.paragraph(null, { text: 'Remember if you have a x10 meter you need to multiply your volumes.' })];
};

const quantitiesForm = (request, data) => {
  const { csrfToken } = request.view;
  const isMeasured = get(data, 'reading.type') === 'measured';

  const action = getPath(STEP_QUANTITIES, request);

  const f = formFactory(action);

  f.fields.push(getHeading(request));

  if (isInternal(request) || isMeasured) {
    f.fields.push(...getIntroText(request));
  }

  const suffix = getSuffix(data.reading.units);

  const lines = getFormLines(data);

  for (let line of lines) {
    const name = getLineName(line);
    const label = getLineLabel(line);
    f.fields.push(fields.text(name, {
      label,
      autoComplete: false,
      suffix,
      mapper: 'numberMapper',
      type: 'number',
      controlClass: 'govuk-!-width-one-quarter',
      errors: {
        'number.base': {
          message: 'Enter an amount in numbers'
        },
        'number.min': {
          message: 'Enter an amount of 0 or above'
        }
      }
    }));
  }

  f.fields.push(fields.button());
  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));

  const values = getLineValues(data.lines);

  return setValues(f, values);
};

/**
 * Get Joi schema for quantities form
 * @param {Object} data model for return
 * @return Joi schema
 */
const quantitiesSchema = (data) => {
  const schema = {
    csrf_token: Joi.string().guid().required()
  };

  const lines = getFormLines(data);

  return lines.reduce((acc, line) => {
    const name = getLineName(line);
    return {
      ...acc,
      [name]: Joi.number().allow(null).min(0)
    };
  }, schema);
};

module.exports = {
  quantitiesForm,
  quantitiesSchema
};
