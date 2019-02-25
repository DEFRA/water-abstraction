const Joi = require('joi');
const controller = require('./controller');
const { VALID_GUID, VALID_LICENCE_QUERY, VALID_LICENCE_NAME, VALID_GAUGING_STATION } = require('../../lib/validators');
const { preAccessControl } = require('./pre-handlers');

const { scope } = require('../../lib/constants');

const allowedScopes = [scope.licenceHolder, scope.colleague, scope.colleagueWithReturns];

const getLicence = {
  method: 'GET',
  path: '/licences/{licence_id}',
  handler: controller.getLicence,
  config: {
    auth: {
      scope: allowedScopes
    },
    pre: [{ method: preAccessControl }],
    description: 'View a single licence',
    validate: {
      params: {
        licence_id: VALID_GUID
      }
    },
    plugins: {
      config: {
        view: 'water/view-licences/licence'
      },
      viewContext: {
        activeNavLink: 'view'
      }
    }
  }
};

const getLicenceRename = {
  method: 'GET',
  path: '/licences/{licence_id}/rename',
  handler: controller.getLicenceDetail,
  config: {
    auth: {
      scope: allowedScopes
    },
    description: 'Set user-defined name for licence',
    validate: {
      params: {
        licence_id: VALID_GUID
      }
    },
    plugins: {
      config: {
        view: 'water/view-licences/rename'
      },
      viewContext: {
        activeNavLink: 'view'
      }
    }
  }
};

const postLicenceRename = {
  method: 'POST',
  path: '/licences/{licence_id}',
  handler: controller.postLicenceRename,
  config: {
    description: 'Update the user-defined licence name',
    auth: {
      scope: allowedScopes
    },
    validate: {
      params: {
        licence_id: VALID_GUID
      },
      payload: {
        name: Joi.string().allow('').max(32),
        csrf_token: VALID_GUID
      }
    },
    plugins: {
      config: {
        view: 'water/view-licences/rename'
      },
      viewContext: {
        activeNavLink: 'view'
      },
      formValidator: {
        payload: {
          name: VALID_LICENCE_NAME,
          csrf_token: VALID_GUID
        }
      }
    }
  }
};

const getLicenceContact = {
  method: 'GET',
  path: '/licences/{licence_id}/contact',
  handler: controller.getLicenceDetail,
  config: {
    auth: {
      scope: allowedScopes
    },
    description: 'View contact info for licence',
    validate: {
      params: {
        licence_id: VALID_GUID
      }
    },
    plugins: {
      config: {
        view: 'water/view-licences/contact'
      },
      viewContext: {
        activeNavLink: 'view'
      }
    }
  }
};

const getLicencePurposes = {
  method: 'GET',
  path: '/licences/{licence_id}/purposes',
  handler: controller.getLicenceDetail,
  config: {
    auth: {
      scope: allowedScopes
    },
    description: 'View abstraction purposes for licence',
    validate: {
      params: {
        licence_id: VALID_GUID
      }
    },
    plugins: {
      config: {
        view: 'water/view-licences/purposes'
      },
      viewContext: {
        activeNavLink: 'view'
      }
    }
  }
};

const getLicencePoints = {
  method: 'GET',
  path: '/licences/{licence_id}/points',
  handler: controller.getLicenceDetail,
  config: {
    auth: {
      scope: allowedScopes
    },
    description: 'View abstraction points for licence',
    validate: {
      params: {
        licence_id: VALID_GUID
      }
    },
    plugins: {
      config: {
        view: 'water/view-licences/points'
      },
      viewContext: {
        activeNavLink: 'view'
      }
    }
  }
};

const getLicenceConditions = {
  method: 'GET',
  path: '/licences/{licence_id}/conditions',
  handler: controller.getLicenceDetail,
  config: {
    auth: {
      scope: allowedScopes
    },
    description: 'View abstraction conditions info for licence',
    validate: {
      params: {
        licence_id: VALID_GUID
      }
    },
    plugins: {
      config: {
        view: 'water/view-licences/conditions'
      },
      viewContext: {
        activeNavLink: 'view'
      }
    }
  }
};

const getLicenceGaugingStation = {
  method: 'GET',
  path: '/licences/{licence_id}/station/{gauging_station}',
  handler: controller.getLicenceGaugingStation,
  config: {
    auth: {
      scope: allowedScopes
    },
    description: 'View abstraction conditions info for licence',
    validate: {
      params: {
        licence_id: VALID_GUID,
        gauging_station: VALID_GAUGING_STATION
      },
      query: {
        measure: Joi.string().allow('level', 'flow', 'auto').default('auto')
      }
    },
    plugins: {
      config: {
        view: 'water/view-licences/gauging-station'
      },
      viewContext: {
        activeNavLink: 'view'
      }
    }
  }
};

const getLicenceCommunication = {
  method: 'GET',
  path: '/licences/{documentId}/communications/{communicationId}',
  handler: controller.getLicenceCommunication,
  config: {
    auth: {
      scope: allowedScopes
    },
    description: 'Look at the content of a message sent to the user regarding the licence',
    validate: {
      params: {
        communicationId: VALID_GUID,
        documentId: VALID_GUID
      }
    },
    plugins: {
      viewContext: {
        activeNavLink: 'view'
      }
    }
  }
};

module.exports = {
  getLicences: {
    method: 'GET',
    path: '/licences',
    handler: controller.getLicences,
    config: {
      auth: {
        scope: allowedScopes
      },
      description: 'View list of licences with facility to sort/filter',
      validate: {
        query: VALID_LICENCE_QUERY
      },
      plugins: {
        viewContext: {
          pageTitle: 'Your licences',
          customTitle: 'Your water abstraction or impoundment licences',
          showResults: true,
          activeNavLink: 'view'
        },
        licenceLoader: {
          loadOutstandingVerifications: true,
          loadUserLicenceCount: true
        },
        formValidator: {
          query: {
            emailAddress: Joi.string().allow('').email(),
            licenceNumber: Joi.string().allow(''),
            sort: Joi.string().valid('licenceNumber', 'name', 'expiryDate').default('licenceNumber'),
            direction: Joi.number().valid(1, -1).default(1),
            page: Joi.number().allow('').min(1).default(1)
          }
        }
      }
    }
  },
  getLicence,
  getLicenceRename,
  postLicenceRename,
  getLicenceContact,
  getLicenceConditions,
  getLicencePoints,
  getLicencePurposes,
  getLicenceGaugingStation,
  getLicenceCommunication
};
