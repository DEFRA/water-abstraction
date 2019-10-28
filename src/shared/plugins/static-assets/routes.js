module.exports = {
  staticAssets: {
    method: 'GET',
    path: '/public/{param*}',
    config: {
      auth: false,
      cache: {
        expiresIn: 30 * 1000
      }
    },
    handler: {
      directory: {
        path: 'public/',
        listing: false
      }
    }
  },

  govUkFrontendAssets: {
    method: 'GET',
    path: '/assets/{param*}',
    config: {
      description: 'Serve static assets for GOV.UK frontend',
      auth: false,
      cache: {
        expiresIn: 30 * 1000
      }
    },
    handler: {
      directory: {
        path: 'node_modules/govuk-frontend/govuk/assets/',
        listing: false
      }
    }
  },

  govUkFrontendJS: {
    method: 'GET',
    path: '/assets/js/all.js',
    config: {
      description: 'Serve static assets for GOV.UK frontend',
      auth: false,
      cache: {
        expiresIn: 30 * 1000
      }
    },
    handler: {
      file: 'node_modules/govuk-frontend/govuk/all.js'
    }
  }
};
