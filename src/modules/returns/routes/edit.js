const Joi = require('joi');
const controller = require('../controllers/edit');
const constants = require('../../../lib/constants');
const returns = constants.scope.returns;
const { VALID_GUID } = require('../../../lib/validators');

module.exports = {
  getAmounts: {
    method: 'GET',
    path: '/admin/return',
    handler: controller.getAmounts,
    config: {
      auth: {
        scope: returns
      },
      description: 'Form to start the return process for a return, asks if nil return',
      validate: {
        query: {
          returnId: Joi.string().required()
        }
      },
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        }
      }
    }
  },
  postAmounts: {
    method: 'POST',
    path: '/admin/return',
    handler: controller.postAmounts,
    config: {
      auth: {
        scope: returns
      },
      description: 'Form handler for nil returns',
      validate: {
        query: {
          returnId: Joi.string().required()
        }
      },
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        },
        formValidator: {
          payload: {
            csrf_token: VALID_GUID,
            isNil: Joi.string().required().valid('Yes', 'No')
          }
        }
      }
    }
  },

  getNilReturn: {
    method: 'GET',
    path: '/admin/return/nil-return',
    handler: controller.getNilReturn,
    config: {
      auth: {
        scope: returns
      },
      description: 'Confirmation screen for nil return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        }
      }
    }
  },

  postNilReturn: {
    method: 'POST',
    path: '/admin/return/nil-return',
    handler: controller.postNilReturn,
    config: {
      auth: {
        scope: returns
      },
      description: 'Post handler for nil return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        }
      }
    }
  },

  getSubmitted: {
    method: 'GET',
    path: '/admin/return/submitted',
    handler: controller.getSubmitted,
    config: {
      auth: {
        scope: returns
      },
      description: 'Confirmation screen for nil return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        }
      }
    }
  },

  getMethod: {
    method: 'GET',
    path: '/admin/return/method',
    handler: controller.getMethod,
    config: {
      auth: {
        scope: returns
      },
      description: 'Ask whether meter readings are used',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        }
      }
    }
  },

  postMethod: {
    method: 'POST',
    path: '/admin/return/method',
    handler: controller.postMethod,
    config: {
      auth: {
        scope: returns
      },
      description: 'POST handler for meter readings routing',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        }
      }
    }
  },

  getUnits: {
    method: 'GET',
    path: '/admin/return/units',
    handler: controller.getUnits,
    config: {
      auth: {
        scope: returns
      },
      description: 'Get units used for this return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        }
      }
    }
  },

  postUnits: {
    method: 'POST',
    path: '/admin/return/units',
    handler: controller.postUnits,
    config: {
      auth: {
        scope: returns
      },
      description: 'Post handler for units used for this return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        }
      }
    }
  },

  getSingleTotal: {
    method: 'GET',
    path: '/admin/return/single-total',
    handler: controller.getSingleTotal,
    config: {
      auth: {
        scope: returns
      },
      description: 'Get whether a single total was submitted for this return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        }
      }
    }
  },

  postSingleTotal: {
    method: 'POST',
    path: '/admin/return/single-total',
    handler: controller.postSingleTotal,
    config: {
      auth: {
        scope: returns
      },
      description: 'Post handler for single total submitted for this return',
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction return - are there any abstraction amounts to report?',
          activeNavLink: 'returns'
        }
      }
    }
  }

};
