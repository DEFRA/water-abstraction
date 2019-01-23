const { cloneDeep, get, set, isObject, isEqual } = require('lodash');
const { mapFields } = require('../../forms/mapFields.js');

/**
 * Applies error message to most form field types
 * @param  {Object} obj    - GOV.UK nunjucks form field macro options
 * @param  {Array} errors - field errors array
 * @return {Object}        - Updated GOV.UK Nunjucks form field macro options
 */
const applyErrors = (obj, errors) => {
  if (errors.length) {
    const text = errors.map(error => error.message).join(', ');
    return {
      ...obj,
      errorMessage: {
        text
      }
    };
  }
  return obj;
};

/**
 * Converts internal form library object to a format expected by the
 * GOV.UK front end macro
 * @param {Object} field - field object generated by our library
 * @return {Object} - object for GOV.UK field macro
 */
const mapFormField = (field) => {
  // Basic options
  const options = {
    id: field.name,
    name: field.name,
    label: {
      text: field.options.label
    },
    value: field.value,
    hint: {
      text: field.options.hint
    },
    classes: field.options.controlClass,
    attributes: field.options.attr || {}
  };

  return applyErrors(options, field.errors);
};

/**
 * Given an ISO 8601 date string, e.g. 2018-11-01, returns an array of
 * items expected by the GOV.UK front end Nunjucks date component
 * @param  {String} field - the date value
 * @return {Array}       - array of items, one for day, month and year
 */
const getFormDateItems = (value = '') => {
  const year = value.slice(0, 4);
  const month = value.slice(5, 7);
  const day = value.slice(8, 10);

  return [
    {
      classes: 'govuk-input--width-2',
      value: day,
      name: 'day'
    },
    {
      classes: 'govuk-input--width-2',
      value: month,
      name: 'month'
    },
    {
      classes: 'govuk-input--width-4',
      value: year,
      name: 'year'
    }
  ];
};

/**
 * Converts a date field object from internal form library to a format expected
 * by the GOV.UK front end macro
 * @param {Object} field - field object generated by internal form library
 * @return {Object} - object for GOV.UK field macro
 */
const mapFormDateField = (field) => {
  // Basic options
  const options = {
    id: field.name,
    namePrefix: field.name,
    fieldset: {
      legend: {
        text: field.options.label
      }
    },
    hint: {
      text: field.options.hint
    },
    classes: field.options.controlClass,
    items: getFormDateItems(field.value),
    attributes: field.options.attr || {}
  };

  return applyErrors(options, field.errors);
};

/**
 * Creates an error summary object for the supplied field.  For certain
 * field types with multiple items (radio, checkbox) the summary link needs
 * to link to the first control in the list
 * @param  {Object} field - field object from internal form library
 * @return {Array}       - list of errors for GOV.UK error summary macro
 */
const mapFieldErrorSummary = (field) => {
  const errors = field.errors || [];

  // For radio/checkbox fields, the ID is the first item
  const id = field.name + (['checkbox', 'radio'].includes(field.options.widget) ? '-1' : '');
  return errors.map(error => ({
    text: error.message,
    href: `#${id}`
  }));
};

/**
 * Given an internal form object, generates an object for the GOV.UK error
 * summary Nunjucks macro
 * @param  {Object} form - internal form object
 * @return {Object}        options object for GOV.UK error summary macro
 */
const mapFormErrorSummary = (form) => {
  const errorList = [];

  mapFields(form, (field) => {
    errorList.push(...mapFieldErrorSummary(field));
  });

  const options = {
    titleText: 'There is a problem',
    errorList
  };

  return options;
};

/**
 * If the field value is an object, then it is compared directly with the choice.
 * Otherwise, the it is compared with the 'value' property of the choice
 * @param  {Object} field  - field description
 * @param  {Object} choice - one of the field choices
 * @return {Boolean}        whether the option should be checked
 */
const radioIsChecked = (field, choice) => {
  if (isObject(field.value)) {
    return isEqual(field.value, choice);
  }
  return field.value === choice.value;
};

/**
 * Maps the choices from a service form object to a format expected
 * by the GOV.UK radio form component
 * @param  {Object} field - radio form field
 * @return {Array}          array of radio button items
 */
const mapChoices = (field, prop = 'checked') => {
  const keyProperty = field.options.keyProperty || 'value';
  const labelProperty = field.options.labelProperty || 'label';

  return field.options.choices.map(choice => ({
    value: choice[keyProperty],
    text: choice[labelProperty],
    hint: {
      text: choice.hint
    },
    [prop]: radioIsChecked(field, choice)
  }));
};

/**
 * Maps a radio field from internal form library to the GOV.UK radio
 * macro options object
 * @param  {Object} field - a radio field from internal form library
 * @return {Object}       Options object for GOV.UK radio nunjucks macro
 */
const mapFormRadioField = (field) => {
  const items = mapChoices(field);

  const options = {
    idPrefix: field.name,
    name: field.name,
    attibutes: {
      id: field.name
    },
    hint: {
      text: field.options.hint
    },
    fieldset: {
      legend: {
        text: field.options.label
      }
    },
    items
  };
  return applyErrors(options, field.errors);
};

/**
 * For radio buttons, sets conditional HTML on the i'th item in the list
 * which displays when that option is selected
 * @param {Object} options - options object for GOV.UK radio nunjucks macro
 * @param {Number} i       - index of the choice where conditional HTML added
 * @param {String} html    - the HTML to add
 * @return {Object} updated GOV.UK radio nunjucks macro
 */
const setConditionalRadioField = (options, i, html) => {
  const path = `items.[${i}].conditional.html`;
  const value = get(options, path, '');
  const updated = cloneDeep(options);
  return set(updated, path, value + html);
};

/**
 * Maps a checkbox field object from our internal form library to a format
 * expected by the GOV.UK nunjucks macro
 * @param  {Object} field - a checkbox field from internal form library
 * @return {Object}       Options object for GOV.UK checkbox nunjucks macro
 */
const mapFormCheckbox = (field) => {
  const value = field.value || [];
  const choices = field.options.choices || [];

  const items = choices.map(choice => ({
    value: choice.value,
    text: choice.label,
    hint: {
      text: choice.hint
    },
    checked: value.includes(choice.value)
  }));

  const options = {
    idPrefix: field.name,
    name: field.name,
    hint: {
      text: field.options.hint
    },
    fieldset: {
      legend: {
        text: field.options.label
      }
    },
    items
  };

  return applyErrors(options, field.errors);
};

/**
 * Maps a dropdown field object from our internal form library to a format
 * expected by the GOV.UK nunjucks macro
 * @param  {Object} field - a dropdown field from internal form library
 * @return {Object}       Options object for GOV.UK dropdown nunjucks macro
 */
const mapFormDropdownField = (field) => {
  const items = mapChoices(field, 'selected');

  const options = {
    id: field.name,
    name: field.name,
    label: {
      text: field.options.label
    },
    hint: {
      text: field.options.hint
    },
    items,
    formGroup: {
      classes: 'govuk-body'
    }
  };

  return applyErrors(options, field.errors);
};

module.exports = {
  mapFormField,
  mapFormErrorSummary,
  mapFormDateField,
  mapFormRadioField,
  setConditionalRadioField,
  mapFormCheckbox,
  mapFormDropdownField
};
