const controller = require('./controller');

module.exports = {

  getViewLicences: {
    method: 'GET',
    path: '/admin/abstraction-reform',
    handler: controller.getViewLicences,
    config: {
      description: 'Entrance search page for abstraction reform',
      plugins: {
        viewContext: {
          pageTitle: 'Review licence data',
          activeNavLink: 'ar'
        },
        hapiRouteAcl: {
          permissions: ['ar:view']
        }
      }
    }
  },

  getViewLicence: {
    method: 'GET',
    path: '/admin/abstraction-reform/licence/{documentId}',
    handler: controller.getViewLicence,
    config: {
      description: 'Page to view comparison of permit repo licence with AR version',
      plugins: {
        viewContext: {
          pageTitle: 'View licence',
          activeNavLink: 'ar'
        },
        hapiRouteAcl: {
          permissions: ['ar:view']
        }
      }
    }
  },

  getEditObject: {
    method: 'GET',
    path: '/admin/abstraction-reform/licence/{documentId}/edit/{type}/{id}',
    handler: controller.getEditObject,
    config: {
      description: 'Edit an object within the licence',
      plugins: {
        viewContext: {
          pageTitle: 'Edit',
          activeNavLink: 'ar'
        },
        hapiRouteAcl: {
          permissions: ['ar:edit']
        }
      }
    }
  },

  postEditObject: {
    method: 'POST',
    path: '/admin/abstraction-reform/licence/{documentId}/edit/{type}/{id}',
    handler: controller.postEditObject,
    config: {
      description: 'Post handler: edit an object within the licence',
      plugins: {
        hapiRouteAcl: {
          permissions: ['ar:edit']
        }
      }
    }
  }

};
