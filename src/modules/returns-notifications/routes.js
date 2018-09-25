const controller = require('./controller');
const constants = require('../../lib/constants');
const returns = constants.scope.returns;

module.exports = {
  getSendForms: {
    method: 'GET',
    path: '/admin/returns-notifications/forms',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Send paper return forms to licence holders'
        }
      }
    },
    handler: controller.getSendForms
  },
  postPreviewRecipients: {
    method: 'POST',
    path: '/admin/returns-notifications/forms',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Send paper return forms to licence holders'
        }
      }
    },
    handler: controller.postPreviewRecipients
  },
  postSendForms: {
    method: 'POST',
    path: '/admin/returns-notifications/forms-send',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Send paper return forms to licence holders'
        }
      }
    },
    handler: controller.postSendForms
  },
  getSendFormsSuccess: {
    method: 'GET',
    path: '/admin/returns-notifications/forms-success',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Paper forms have been sent'
        }
      }
    },
    handler: controller.getSendFormsSuccess
  }
};
