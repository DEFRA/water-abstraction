const Joi = require('joi');
const controller = require('./controller');

module.exports = {
  getAllReturns: {
    method: 'GET',
    path: '/returns',
    handler: controller.getReturns,
    config: {
      description: 'Displays a list of returns for the current licence holder',
      validate: {
        query: {
          page: Joi.number().default(1)
        }
      },
      plugins: {
        viewContext: {
          pageTitle: 'Your returns',
          activeNavLink: 'returns'
        }
      }
    }
  },

  getReturnsForLicence: {
    method: 'GET',
    path: '/licences/{documentId}/returns',
    handler: controller.getReturnsForLicence,
    config: {
      description: 'Displays a list of returns for a particular licence',
      validate: {
        params: {
          documentId: Joi.string().guid().required()
        },
        query: {
          page: Joi.number().default(1)
        }
      },
      plugins: {
        viewContext: {
          activeNavLink: 'view'
        }
      }
    }
  },

  getReturn: {
    method: 'GET',
    path: '/returns/return',
    handler: controller.getReturn,
    config: {
      description: 'Displays data for a single return',
      validate: {
        query: {
          id: Joi.string().required()
        }
      },
      plugins: {
        viewContext: {
          activeNavLink: 'returns'
        }
      }
    }
  }
};
