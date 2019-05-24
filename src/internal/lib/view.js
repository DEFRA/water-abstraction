const { get } = require('lodash');
const config = require('../config');

const { getPropositionLinks } = require('./view/proposition-links');
const { getMainNav } = require('./view/main-nav');
const { isInternal } = require('./permissions');

const getSurveyType = (isAuthenticated, isDefraAdmin) => {
  if (isAuthenticated) {
    return isDefraAdmin ? 'internal' : 'external';
  }
  return 'anonymous';
};

/**
 * Get GA tracking details given user credentials
 * @param {Object} credentials
 * @return {Object} tracking
 */
const getTracking = (credentials) => {
  const base = {
    userType: 'not_logged_in',
    propertyId: config.googleAnalytics.propertyId,
    debug: config.googleAnalytics.debug,
    isLoggedIn: false
  };

  if (credentials) {
    const { lastLogin, scope = [] } = credentials;

    return Object.assign(base, {
      userType: scope.includes('internal') ? 'internal' : 'external',
      isLoggedIn: true,
      newUser: lastLogin === null,
      lastLogin
    });
  };

  return base;
};

/**
 * Checks whether the user has multiple companies - i.e. agent
 * this determines whether to show company switcher
 * @param  {Object}  request - current request
 * @return {Boolean}         true if user can access > 1 company
 */
const hasMultipleCompanies = request => get(request, 'defra.companyCount', 0) > 1;

function viewContextDefaults (request) {
  const viewContext = request.view || {};

  viewContext.isAuthenticated = !!get(request, 'state.sid');
  viewContext.query = request.query;
  viewContext.payload = request.payload;
  viewContext.session = request.session;
  viewContext.nonces = get(request, 'plugins.blankie.nonces', {});

  viewContext.customTitle = null;
  viewContext.insideHeader = '';
  viewContext.headerClass = 'with-proposition';
  viewContext.topOfPage = null;
  viewContext.head = `<meta name="format-detection" content="telephone=no"><meta name="robots" content="noindex, nofollow">`;
  viewContext.bodyStart = null;
  viewContext.afterHeader = null;
  viewContext.path = request.path;

  if (request.sessionStore) {
    viewContext.csrfToken = request.yar.get('csrf_token');
  }

  viewContext.labels = {};
  viewContext.labels.licences = 'Your licences';

  // Are we in admin view?  Add a flag for templates
  viewContext.isAdmin = /^\/admin\//.test(request.url.path);
  viewContext.isTestMode = process.env.TEST_MODE;

  // Set navigation links
  viewContext.mainNavLinks = getMainNav(request);
  viewContext.propositionLinks = getPropositionLinks(request);

  viewContext.user = request.auth.credentials;

  viewContext.tracking = getTracking(request.auth.credentials);

  viewContext.env = process.env.NODE_ENV;
  viewContext.crownCopyrightMessage = '© Crown copyright';
  viewContext.surveyType = getSurveyType(
    viewContext.isAuthenticated,
    isInternal(request)
  );

  viewContext.hasMultipleCompanies = hasMultipleCompanies(request);
  viewContext.companyName = get(request, 'auth.credentials.companyName');

  return viewContext;
}

module.exports = {
  contextDefaults: viewContextDefaults,
  getTracking
};
