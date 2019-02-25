const Joi = require('joi');
const controller = require('../controllers/edit');
const constants = require('../../../lib/constants');
const external = constants.scope.external;
const { VALID_GUID } = require('../../../lib/validators');

const allowedScopes = [constants.scope.licenceHolder, constants.scope.colleagueWithReturns];

const createMeterRoute = (method, path, handler, description, title) => {
  return {
    method,
    path,
    handler,
    options: {
      auth: {
        scope: allowedScopes
      },
      description,
      plugins: {
        viewContext: {
          activeNavLink: 'returns',
          pageTitle: title
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  };
};

const createGetMeterRoute = createMeterRoute.bind(null, 'GET');
const createPostMeterRoute = createMeterRoute.bind(null, 'POST');

module.exports = {
  getAmounts: {
    method: 'GET',
    path: '/return',
    handler: controller.getAmounts,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Form to start the return process for a return, asks if nil return',
      validate: {
        query: {
          returnId: Joi.string().required()
        }
      },
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - has any water been abstracted?',
          activeNavLink: 'returns',
          showMeta: true
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        }
      }
    }
  },
  postAmounts: {
    method: 'POST',
    path: '/return',
    handler: controller.postAmounts,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Form handler for nil returns',
      validate: {
        query: {
          returnId: Joi.string().required()
        }
      },
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - has any water been abstracted?',
          activeNavLink: 'returns',
          showMeta: true
        },
        formValidator: {
          payload: {
            csrf_token: VALID_GUID,
            isNil: Joi.string().required().valid('Yes', 'No')
          }
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  getNilReturn: {
    method: 'GET',
    path: '/return/nil-return',
    handler: controller.getNilReturn,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Confirmation screen for nil return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - submit nil',
          activeNavLink: 'returns',
          showMeta: true
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  postNilReturn: {
    method: 'POST',
    path: '/return/nil-return',
    handler: controller.postConfirm,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Post handler for nil return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - nil submitted',
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  getSubmitted: {
    method: 'GET',
    path: '/return/submitted',
    handler: controller.getSubmitted,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Confirmation screen for nil return',
      plugins: {
        viewContext: {
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  getMethod: {
    method: 'GET',
    path: '/return/method',
    handler: controller.getMethod,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Ask whether meter readings are used',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - how are you reporting your return?',
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  postMethod: {
    method: 'POST',
    path: '/return/method',
    handler: controller.postMethod,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'POST handler for meter readings routing',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - how are you reporting your return?',
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  getUnits: {
    method: 'GET',
    path: '/return/units',
    handler: controller.getUnits,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Get units used for this return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - what is the unit of measurement?',
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  postUnits: {
    method: 'POST',
    path: '/return/units',
    handler: controller.postUnits,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Post handler for units used for this return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - what is the unit of measurement?',
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  getBasis: {
    method: 'GET',
    path: '/return/basis',
    handler: controller.getBasis,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Get basis for supplied return data',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are you using estimates?',
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  postBasis: {
    method: 'POST',
    path: '/return/basis',
    handler: controller.postBasis,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Post handler for records basis',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are you using estimates?',
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  getQuantities: {
    method: 'GET',
    path: '/return/quantities',
    handler: controller.getQuantities,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Display quantities form',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - enter amounts',
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  postQuantities: {
    method: 'POST',
    path: '/return/quantities',
    handler: controller.postQuantities,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Post handler for quantities',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - enter amounts',
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  getConfirm: {
    method: 'GET',
    path: '/return/confirm',
    handler: controller.getConfirm,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Display confirmation screen of returned quantities',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - check the information before submitting',
          activeNavLink: 'returns',
          showMeta: true
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  postConfirm: {
    method: 'POST',
    path: '/return/confirm',
    handler: controller.postConfirm,
    options: {
      auth: {
        scope: allowedScopes
      },
      description: 'Post handler for confirmation screen',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - check the information before submitting',
          activeNavLink: 'returns'
        },
        hapiRouteAcl: {
          permissions: ['returns:submit']
        },
        returns: true
      }
    }
  },

  getMeterDetails: createGetMeterRoute(
    '/return/meter/details',
    controller.getMeterDetails,
    'Shows the view allowing a user to enter meter details',
    'Abstraction return - tell us about your meter'
  ),

  postMeterDetails: createPostMeterRoute(
    '/return/meter/details',
    controller.postMeterDetails,
    'POST handler for meter details',
    'Abstraction return - tell us about your meter'
  ),

  getMeterUnits: createGetMeterRoute(
    '/return/meter/units',
    controller.getMeterUnits,
    'Shows the view allowing to select the meter units',
    'Abstraction return - what is the unit of measurement?'
  ),

  postMeterUnits: createPostMeterRoute(
    '/return/meter/units',
    controller.postMeterUnits,
    'POST handler for meter units',
    'Abstraction return - what is the unit of measurement?'
  ),

  getMeterReadings: createGetMeterRoute(
    '/return/meter/readings',
    controller.getMeterReadings,
    'Shows the view to capture the users meter readings',
    'Abstraction return - enter meter readings'
  ),

  postMeterReadings: createPostMeterRoute(
    '/return/meter/readings',
    controller.postMeterReadings,
    'POST handler for meter readings',
    'Abstraction return - enter meter readings'
  )
};
