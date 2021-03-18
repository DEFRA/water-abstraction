const Joi = require('@hapi/joi');
const controller = require('./controller');
const constants = require('../../lib/constants');
const returns = constants.scope.returns;

module.exports = {

  getReturnCycles: {
    method: 'GET',
    path: '/returns-reports',
    handler: controller.getReturnCycles,
    config: {
      auth: { scope: returns },
      description: 'View overview of all returns cycles',
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Returns overview'
        }
      }
    }
  },

  getConfirmDownload: {
    method: 'GET',
    path: '/returns-reports/{returnCycleId}',
    handler: controller.getConfirmDownload,
    config: {
      auth: { scope: returns },
      description: 'Confirmation page to download return cycle report',
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Returns overview'
        }
      },
      validate: {
        params: Joi.object({
          returnCycleId: Joi.string().guid().required()
        })
      }
    }
  },

  getDownload: {
    method: 'GET',
    path: '/returns-reports/download/{cycleEndDate}',
    handler: controller.getDownloadReport,
    config: {
      auth: { scope: returns },
      description: 'Download CSV report of specified return cycle',
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Returns overview'
        }
      },
      validate: {
        params: {
          cycleEndDate: Joi.string().isoDate().options({ convert: false })
        }
      }
    }
  }

};
