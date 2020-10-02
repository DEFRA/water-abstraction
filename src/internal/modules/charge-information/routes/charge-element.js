const controller = require('../controllers/charge-element');
const preHandlers = require('../pre-handlers');
const { VALID_GUID } = require('shared/lib/validators');
const Joi = require('@hapi/joi');
const { charging } = require('internal/lib/constants').scope;
const allowedScopes = [charging];
const { ROUTING_CONFIG } = require('../lib/charge-elements/constants');
const chargeElementSteps = Object.keys(ROUTING_CONFIG);

module.exports = {
  getChargeElementStep: {
    method: 'GET',
    path: '/licences/{licenceId}/charge-information/charge-element/{elementId}/{step}',
    handler: controller.getChargeElementStep,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Single GET route for all charge element properties',
      plugins: {
        viewContext: {
          activeNavLink: 'view'
        }
      },
      validate: {
        params: {
          licenceId: VALID_GUID,
          step: Joi.string().valid(chargeElementSteps).required(),
          elementId: Joi.string().uuid().required()
        }
      },
      pre: [
        { method: preHandlers.loadLicence, assign: 'licence' },
        { method: preHandlers.loadDefaultCharges, assign: 'defaultCharges' },
        { method: preHandlers.loadDraftChargeInformation, assign: 'draftChargeInformation' }
      ]
    }
  },
  postChargeElementStep: {
    method: 'POST',
    path: '/licences/{licenceId}/charge-information/charge-element/{elementId}/{step}',
    handler: controller.postChargeElementStep,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Single POST route for all charge element poperties',
      plugins: {
        viewContext: {
          activeNavLink: 'view'
        }
      },
      validate: {
        params: {
          licenceId: VALID_GUID,
          step: Joi.string().valid(chargeElementSteps).required(),
          elementId: Joi.string().uuid().required()
        }
      },
      pre: [
        { method: preHandlers.loadLicence, assign: 'licence' },
        { method: preHandlers.loadDefaultCharges, assign: 'defaultCharges' },
        { method: preHandlers.loadDraftChargeInformation, assign: 'draftChargeInformation' }
      ]
    }
  }
};
