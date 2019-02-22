/**
 * HAPI Route handlers for signing in to account
 * @module controllers/authentication
 */
const Boom = require('Boom');
const { get } = require('lodash');
const { throwIfError } = require('@envage/hapi-pg-rest-api');

const IDM = require('../../lib/connectors/idm');
const signIn = require('../../lib/sign-in');
const { getPermissions } = require('../../lib/permissions');
const logger = require('../../lib/logger');

const { destroySession, authValidationErrorResponse } = require('./helpers');

const waterUser = require('../../lib/connectors/water-service/user');
const { selectCompanyForm } = require('./forms/select-company');
const { handleRequest, getValues } = require('../../lib/forms');

/**
 * Welcome page before routing to signin/register
 */
function getWelcome (request, h) {
  return h.view('water/welcome', request.view);
}

/**
 * View signin page
 * @param {Object} request - the HAPI HTTP request
 * @param {Object} h - the Hapi Response Toolkit
 */
function getSignin (request, h) {
  return h.view('water/auth/signin', request.view);
}

/**
 * View signout page
 * @param {Object} request - the HAPI HTTP request
 * @param {Object} h - the HAPI response toolkit
 */
async function getSignout (request, h) {
  const params = `?u=${request.permissions.admin.defra ? 'i' : 'e'}`;
  try {
    await request.sessionStore.destroy();
    request.cookieAuth.clear();
  } catch (error) {
    logger.error('Sign out error', error);
  }
  return h.redirect(`/signed-out${params}`);
}

/**
 * View signed out page
 * @param {Object} request - the HAPI HTTP request
 * @param {Object} h - the HAPI HTTP response toolkit
 */
async function getSignedOut (request, h) {
  const surveyType = { i: 'internal', e: 'external' };

  request.view.surveyType = surveyType[request.query.u] || 'anonymous';
  request.view.pageTitle = 'You are signed out';
  return h.view('water/auth/signed-out', request.view);
}

/**
 * Process login form request
 * @param {Object} request - the HAPI HTTP request
 * @param {String} request.payload.user_id - the user email address
 * @param {String} request.payload.password - the user password
 * @param {Object} h - the Hapi Response Toolkit
 */
async function postSignin (request, h) {
  // Handle form validation error
  if (request.formError) {
    return authValidationErrorResponse(request, h);
  }

  // Attempt auth
  try {
    const {
      body: {
        reset_required: resetRequired,
        reset_guid: resetGuid
      }
    } = await IDM.login(request.payload.user_id, request.payload.password);

    await destroySession(request);

    // Check if reset required
    if (resetRequired === 1) {
      return h.redirect(`reset_password_change_password?resetGuid=${resetGuid}&forced=1`);
    }

    await signIn.auto(request, request.payload.user_id);

    // Redirect user
    const permissions = getPermissions(request.auth.credentials);
    const redirectPath = permissions.admin.defra ? '/admin/licences' : '/licences';

    // Resolves Chrome issue where it won't set cookie and redirect in same request
    // @see {@link https://stackoverflow.com/questions/40781534/chrome-doesnt-send-cookies-after-redirect}
    return h.response(getLoginRedirectHtml(request, redirectPath));
  } catch (error) {
    if (error.statusCode === 401) {
      return authValidationErrorResponse(request, h);
    }
    throw error;
  }
}

const getLoginRedirectHtml = (request, redirectPath) => {
  const nonce = get(request, 'plugins.blankie.nonces.script', {});
  const meta = `<meta http-equiv="refresh" content="0; url=${redirectPath}" />`;
  const script = `<script nonce=${nonce}>location.href='${redirectPath}';</script>`;
  return meta + script;
};

const getUserID = request => get(request, 'auth.credentials.user_id');

/**
 * Asynchronously loads user data from the water service, including their list
 * of companies
 * @param  {Object}  request - HAPI request
 * @return {Promise}         [description]
 */
const loadUserData = async userId => {
  const { data, error } = await waterUser.getUserStatus(userId);
  throwIfError(error);
  return data;
};

const renderForm = (request, h, form) => {
  const view = {
    ...request.view,
    form,
    back: '/licences'
  };
  return h.view('nunjucks/auth/select-company.njk', view, { layout: false });
};

/**
 * Displays a page where the user can select the company they wish to work with
 */
const getSelectCompany = async (request, h) => {
  const userId = getUserID(request);
  const data = await loadUserData(userId);
  const form = selectCompanyForm(request, data);
  return renderForm(request, h, form);
};

const postSelectCompany = async (request, h) => {
  const userId = getUserID(request);
  const data = await loadUserData(userId);
  const form = handleRequest(selectCompanyForm(request, data), request);

  // Set company entity and redirect if valid
  if (form.isValid) {
    const { company: index } = getValues(form);

    const company = get(data, `companies.${index}`);

    if (!company) {
      throw Boom.badRequest(`Company not found`, { index });
    }

    // Set company ID in session cookie
    request.cookieAuth.set('companyId', company.entityId);
    request.cookieAuth.set('companyName', company.name);

    // Redirect
    return h.redirect('/licences');
  }
  return renderForm(request, h, form);
};

module.exports = {
  getWelcome,
  getSignin,
  getSignout,
  getSignedOut,
  postSignin,
  getSelectCompany,
  postSelectCompany
};
