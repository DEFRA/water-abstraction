'use strict';

const controller = require('../controllers/billing-accounts');
const preHandlers = require('../pre-handlers');
const Joi = require('@hapi/joi');
const { VALID_GUID } = require('shared/lib/validators');
const { manageBillingAccounts } = require('internal/lib/constants').scope;
const allowedScopes = [manageBillingAccounts];

module.exports = {
  getBillingAccount: {
    method: 'GET',
    path: '/billing-accounts/{billingAccountId}',
    handler: controller.getBillingAccount,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'View billing account for given id',
      plugins: {
        viewContext: {
          activeNavLink: 'view'
        }
      },
      validate: {
        params: {
          billingAccountId: VALID_GUID
        },
        query: {
          back: Joi.string().optional()
        }
      },
      pre: [
        { method: preHandlers.loadBillingAccount, assign: 'billingAccount' }
      ]
    }
  }
};
