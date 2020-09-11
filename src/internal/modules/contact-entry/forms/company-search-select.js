const { formFactory, fields } = require('shared/lib/forms');
const Joi = require('@hapi/joi');
const titleCase = require('title-case');

const getCompanyText = company => {
  return `${company.name} (${company.companyNumber})`;
};

const getCompanyChoices = companies => {
  const choices = companies.map(record => {
    return ({
      value: record.company.companyNumber,
      label: getCompanyText(record.company)
    });
  });
  return choices;
};

const form = (request, h) => {
  const { csrfToken } = request.view;
  const { sessionKey } = request.query;
  const { companiesHouseResults } = request.pre;

  const f = formFactory('/contact-entry/new/details/company-search/results');

  f.fields.push(fields.radio('selectedCompaniesHouseNumber', {
    errors: {
      'any.empty': {
        message: 'Select a company from the list'
      },
      'string.regex.base': {
        message: 'Select a company from the list'
      }
    },
    label: 'Select a company',
    choices: getCompanyChoices(companiesHouseResults)
  }, h));

  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));
  f.fields.push(fields.hidden('sessionKey', {}, sessionKey));
  f.fields.push(fields.button(null, { label: 'Continue' }));

  return f;
};

const schema = {
  csrf_token: Joi.string().uuid().required(),
  sessionKey: Joi.string().uuid().required(),
  selectedCompaniesHouseNumber: Joi.string().required()
};

exports.form = form;
exports.schema = schema;
