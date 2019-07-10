const controller = require('./controller');

module.exports = {

  accessibility: {
    method: 'GET',
    path: '/accessibility',
    config: {
      description: 'Displays accessibility information',
      auth: {
        strategy: 'standard',
        mode: 'try'
      },
      plugins: {
        viewContext: {
          pageTitle: 'Accessibility',
          back: '/licences'
        },
        config: {
          view: 'nunjucks/content/accessibility.njk'
        },
        companySelector: {
          ignore: true
        }
      }
    },
    handler: controller.staticPage
  },

  cookies: {
    method: 'GET',
    path: '/cookies',
    config: {
      description: 'Displays cookie information',
      auth: {
        strategy: 'standard',
        mode: 'try'
      },
      plugins: {
        viewContext: {
          pageTitle: 'Cookies',
          back: '/licences'
        },
        config: {
          view: 'nunjucks/content/cookies.njk'
        },
        companySelector: {
          ignore: true
        }
      }
    },
    handler: controller.staticPage
  },

  feedback: {
    method: 'GET',
    path: '/feedback',
    config: {
      auth: {
        strategy: 'standard',
        mode: 'try'
      },
      plugins: {
        viewContext: {
          pageTitle: 'Tell us what you think about this service',
          back: '/licences'
        },
        config: {
          view: 'nunjucks/content/feedback.njk'
        },
        companySelector: {
          ignore: true
        }
      }
    },
    handler: controller.staticPage
  },

  privacyNext: {
    method: 'GET',
    path: '/privacy-policy',
    config: {
      auth: {
        strategy: 'standard',
        mode: 'try'
      },
      plugins: {
        viewContext: {
          pageTitle: 'Privacy: how we use your personal information',
          back: '/licences'
        },
        config: {
          view: 'nunjucks/content/privacy-policy.njk'
        },
        companySelector: {
          ignore: true
        }
      }
    },
    handler: controller.staticPage
  }
};
