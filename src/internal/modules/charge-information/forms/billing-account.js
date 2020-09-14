'use strict';

const { get } = require('lodash');
const Joi = require('@hapi/joi');

const { formFactory, fields } = require('shared/lib/forms/');
const routing = require('../lib/routing');

/**
 * Returns the truthy address parts join using a comma
 * @param {Object} address
 */
const mapAddress = address => {
  return [
    address.addressLine1,
    address.addressLine2,
    address.addressLine3,
    address.addressLine4,
    address.town,
    address.county,
    address.postcode,
    address.country
  ].filter(i => i).join(', ');
};

/**
 * Creates an array of specification objects to use for the choices where
 * the id/value is the address id and the label is a string of HTML
 * containing the account number and name, followed by a single line
 * address
 *
 * @param {Array} accounts
 */
const mapBillingAccountsToChoices = accounts => {
  return accounts.flatMap(account => {
    return account.invoiceAccountAddresses.map(address => {
      const html = [
        `${account.accountNumber} - ${account.company.name}`,
        mapAddress(address.address)
      ].join('<br>');

      return { html, value: address.id };
    });
  });
};

const selectBillingAccountForm = request => {
  const { csrfToken } = request.view;
  const { licence, draftChargeInformation, billingAccounts } = request.pre;

  const invoiceAccountAddresses = get(draftChargeInformation, 'billingAccount.invoiceAccountAddress');

  const action = routing.getSelectBillingAccount(licence);

  const f = formFactory(action, 'POST');

  f.fields.push(fields.radio('invoiceAccountAddress', {
    errors: {
      'any.required': {
        message: 'Select a billing account or set up a new one'
      }
    },
    choices: [
      ...mapBillingAccountsToChoices(billingAccounts),
      { divider: 'or' },
      { label: 'Set up a new billing account', value: 'set-up-new-billing-account' }
    ]
  }, invoiceAccountAddresses));

  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));
  f.fields.push(fields.button(null, { label: 'Continue' }));

  return f;
};

const selectBillingAccountSchema = request => {
  const { billingAccounts = [] } = request.pre;

  return {
    csrf_token: Joi.string().uuid().required(),
    invoiceAccountAddress: Joi.string().required().valid([
      ...billingAccounts.flatMap(billingAccount => {
        return billingAccount.invoiceAccountAddresses.map(invoiceAccountAddress => {
          return invoiceAccountAddress.id;
        });
      }),
      'set-up-new-billing-account'
    ])
  };
};

exports.form = selectBillingAccountForm;
exports.schema = selectBillingAccountSchema;
