const Boom = require('boom');
const { pick } = require('lodash');
const shallowDiff = require('shallow-diff');
const { documents } = require('../../lib/connectors/crm.js');
const { load, update } = require('./lib/loader');
const { extractData, transformNulls, prepareData } = require('./lib/helpers');
const { getPurpose, getLicence } = require('./lib/licence-helpers');
const { createEditPurpose, createEditLicence } = require('./lib/action-creators');
const { stateManager, getInitialState } = require('./lib/state-manager');

// Config for editing different data models
const objectConfig = {
  purpose: {
    schema: require('./schema/purpose.json'),
    getter: getPurpose,
    actionCreator: createEditPurpose
  },
  licence: {
    schema: require('./schema/licence.json'),
    getter: getLicence,
    actionCreator: createEditLicence
  }
};

const searchLicences = async (q) => {
  let filter = {};
  if (q.match('@')) {
    filter.email = q.trim();
  } else {
    filter.string = q.trim();
  }

  const page = 1;

  const sort = {
    system_external_id: +1
  };

    // Get licences from CRM
  const { data, error, pagination } = await documents.getLicences(filter, sort, {
    page,
    perPage: 50
  });
  if (error) {
    throw new Boom.badImplementation(error);
  }
  return { data, pagination };
};

/**
 * View / search licences
 */
const getViewLicences = async (request, h) => {
  const { q } = request.query;

  const { view } = request;

  if (q) {
    const { data, pagination } = await searchLicences(q);
    view.licences = data;
    view.pagination = pagination;
  }

  console.log(view.licences);

  return h.view('water/abstraction-reform/index', view);
};

/**
 * View a licence, with the original values and abstraction reform values
 * in columns for comparison
 * @param {String} request.params.documentId - CRM document ID
 */
const getViewLicence = async (request, h) => {
  const { documentId } = request.params;

  const { licence, finalState } = await load(documentId);

  const data = prepareData(licence, finalState);

  // require('fs').writeFileSync('schema.json', JSON.stringify(generateJsonSchema(data.licence.base), null, 2));

  const view = {
    documentId,
    ...request.view,
    licence,
    data
  };

  return h.view('water/abstraction-reform/licence', view);
};

/**
 * Edit an object from within the licence
 * @param {String} request.params.documentId - CRM document ID for licence
 * @param {String} request.params.type - type of entity, purpose, point etc
 * @param {String} request.params.id - the ID of the entity
 */
const getEditObject = async (request, h) => {
  const {documentId, type, id} = request.params;

  // Load licence / AR licence from CRM
  const { finalState } = await load(documentId);

  const { schema, getter } = objectConfig[type];

  const data = extractData(getter(finalState.licence, id), schema);

  const view = {
    ...request.view,
    pageTitle: `Edit ${type}`,
    formAction: `/admin/abstraction-reform/licence/${documentId}/edit/${type}/${id}`,
    data,
    schema
  };

  return h.view('water/abstraction-reform/edit', view);
};

const postEditObject = async (request, h) => {
  const { documentId, type, id } = request.params;
  const { csrf_token: csrfToken, ...rawPayload } = request.payload;

  const payload = transformNulls(rawPayload);

  // Load licence / AR licence from CRM
  const { licence, arLicence, finalState } = await load(documentId);

  const { schema, getter, actionCreator } = objectConfig[type];

  const data = extractData(getter(finalState.licence, id), schema);

  // Compare object data with form payload
  const diff = shallowDiff(data, payload);
  if (diff.updated.length) {
    // Add the new action to the list of actions
    const action = actionCreator(pick(payload, diff.updated), request.auth.credentials, id);
    const { actions } = arLicence.licence_data_value;
    actions.push(action);

    // Re-calculate final state
    // This is so we can get the status and last editor details and store these
    // Calculate final state from list of actions to update last editor/status
    const { status, lastEdit } = stateManager(getInitialState(licence), actions);

    // Save action list to permit repo
    await update(arLicence.licence_id, {actions, status, lastEdit});
  }

  return h.redirect(`/admin/abstraction-reform/licence/${documentId}#${type}-${id}`);
};

module.exports = {
  getViewLicences,
  getViewLicence,
  getEditObject,
  postEditObject
};
