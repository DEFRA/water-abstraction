'use strict';

const preHandlers = require('./pre-handlers');
const Joi = require('@hapi/joi');
const controller = require('./controller');
const { createRoutePair } = require('shared/lib/route-helpers');

const { charging } = require('internal/lib/constants').scope;
const allowedScopes = [charging];

module.exports = {

  ...createRoutePair(controller, 'selectExistingAccount', {
    path: '/account-entry/{key}/select-existing-account',
    options: {
      auth: {
        scope: allowedScopes
      },
      validate: {
        query: {
          q: Joi.string().required(),
          form: Joi.string().guid().optional()
        },
        params: {
          key: Joi.string().required()
        }
      },
      pre: [{
        method: preHandlers.getSessionData, assign: 'sessionData'
      }, {
        method: preHandlers.searchCRMCompanies, assign: 'companies'
      }]
    }
  }),

  ...createRoutePair(controller, 'selectAccountType', {
    path: '/account-entry/{key}/select-account-type',
    options: {
      auth: {
        scope: allowedScopes
      },
      validate: {
        params: {
          key: Joi.string().required()
        }
      },
      pre: [{
        method: preHandlers.getSessionData, assign: 'sessionData'
      }]
    }
  }),

  ...createRoutePair(controller, 'companySearch', {
    path: '/account-entry/{key}/company-search',
    options: {
      description: 'Search for company in Companies House',
      auth: {
        scope: allowedScopes
      },
      validate: {
        params: {
          key: Joi.string().required()
        }
      },
      pre: [{
        method: preHandlers.getSessionData, assign: 'sessionData'
      }, {
        method: preHandlers.searchForCompaniesInCompaniesHouse, assign: 'companiesHouseResults'
      }]
    }
  })

};
