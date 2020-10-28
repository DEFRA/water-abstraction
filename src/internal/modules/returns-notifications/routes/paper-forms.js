'use strict';

const { VALID_GUID } = require('shared/lib/validators');

const controller = require('../controllers/paper-forms');
const preHandlers = require('../pre-handlers');
const eventPreHandlers = require('shared/lib/pre-handlers/events');
const constants = require('../../../lib/constants');
const { returns } = constants.scope;

module.exports = {
  getEnterLicenceNumber: {
    method: 'GET',
    path: '/returns-notifications/forms',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Enter a licence number'
        }
      }
    },
    handler: controller.getEnterLicenceNumber
  },
  postEnterLicenceNumber: {
    method: 'POST',
    path: '/returns-notifications/forms',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Enter a licence number'
        }
      }
    },
    handler: controller.postEnterLicenceNumber
  },
  getCheckAnswers: {
    method: 'GET',
    path: '/returns-notifications/check-answers',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Check returns details'
        }
      },
      pre: [
        { method: preHandlers.getStateFromSession, assign: 'state' }
      ]
    },
    handler: controller.getCheckAnswers
  },
  postCheckAnswers: {
    method: 'POST',
    path: '/returns-notifications/check-answers',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Check returns details'
        }
      },
      pre: [
        { method: preHandlers.getStateFromSession, assign: 'state' }
      ]
    },
    handler: controller.postCheckAnswers
  },
  getSelectReturns: {
    method: 'GET',
    path: '/returns-notifications/{documentId}/select-returns',
    config: {
      auth: {
        scope: returns
      },
      validate: {
        params: {
          documentId: VALID_GUID
        }
      },
      pre: [
        { method: preHandlers.getDocumentFromSession, assign: 'document' }
      ],
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Which returns need a form?'
        }
      }
    },
    handler: controller.getSelectReturns
  },
  postSelectReturns: {
    method: 'POST',
    path: '/returns-notifications/{documentId}/select-returns',
    config: {
      auth: {
        scope: returns
      },
      validate: {
        params: {
          documentId: VALID_GUID
        }
      },
      pre: [
        { method: preHandlers.getDocumentFromSession, assign: 'document' }
      ],
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Which returns need a form?'
        }
      }
    },
    handler: controller.postSelectReturns
  },

  getSelectAddress: {
    method: 'GET',
    path: '/returns-notifications/{documentId}/select-address',
    config: {
      auth: {
        scope: returns
      },
      validate: {
        params: {
          documentId: VALID_GUID
        }
      },
      pre: [
        { method: preHandlers.getDocumentFromSession, assign: 'document' }
      ],
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Select where to send the form'
        }
      }
    },
    handler: controller.getSelectAddress
  },
  postSelectAddress: {
    method: 'POST',
    path: '/returns-notifications/{documentId}/select-address',
    config: {
      auth: {
        scope: returns
      },
      validate: {
        params: {
          documentId: VALID_GUID
        }
      },
      pre: [
        { method: preHandlers.getDocumentFromSession, assign: 'document' }
      ],
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Select where to send the form'
        }
      }
    },
    handler: controller.postSelectAddress
  },

  getRecipient: {
    method: 'GET',
    path: '/returns-notifications/{documentId}/recipient',
    config: {
      auth: {
        scope: returns
      },
      validate: {
        params: {
          documentId: VALID_GUID
        }
      },
      pre: [
        { method: preHandlers.getDocumentFromSession, assign: 'document' }
      ],
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Who should receive the form?'
        }
      }
    },
    handler: controller.getRecipient
  },

  postRecipient: {
    method: 'POST',
    path: '/returns-notifications/{documentId}/recipient',
    config: {
      auth: {
        scope: returns
      },
      validate: {
        params: {
          documentId: VALID_GUID
        }
      },
      pre: [
        { method: preHandlers.getDocumentFromSession, assign: 'document' }
      ],
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Who should receive the form?'
        }
      }
    },
    handler: controller.postRecipient
  },

  getAcceptOneTimeAddress: {
    method: 'GET',
    path: '/returns-notifications/{documentId}/accept-one-time-address',
    config: {
      auth: {
        scope: returns
      },
      validate: {
        params: {
          documentId: VALID_GUID
        }
      },
      pre: [
        { method: preHandlers.getDocumentFromSession, assign: 'document' }
      ]
    },
    handler: controller.getAcceptOneTimeAddress
  },

  getLicenceHolders: {
    method: 'GET',
    path: '/returns-notifications/select-licence-holders',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Which licence holders need a form?'
        }
      },
      pre: [
        { method: preHandlers.getStateFromSession, assign: 'state' }
      ]
    },
    handler: controller.getSelectLicenceHolders
  },

  postLicenceHolders: {
    method: 'POST',
    path: '/returns-notifications/select-licence-holders',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications',
          pageTitle: 'Which licence holders need a form?'
        }
      },
      pre: [
        { method: preHandlers.getStateFromSession, assign: 'state' }
      ]
    },
    handler: controller.postSelectLicenceHolders
  },

  getSend: {
    method: 'GET',
    path: '/returns-notifications/{eventId}/send',
    config: {
      auth: {
        scope: returns
      },
      plugins: {
        viewContext: {
          activeNavLink: 'notifications'
        }
      },
      pre: [
        { method: eventPreHandlers.loadEvent, assign: 'event' }
      ]
    },
    handler: controller.getSend
  }
};
