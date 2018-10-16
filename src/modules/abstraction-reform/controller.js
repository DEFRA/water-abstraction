const { pick, get } = require('lodash');
const shallowDiff = require('shallow-diff');

const { load, update } = require('./lib/loader');
const { extractData, transformNulls, prepareData } = require('./lib/helpers');
const { getPermissions } = require('./lib/permissions');
const { getPurpose, getLicence, getPoint, getCondition } = require('./lib/licence-helpers');
const { createEditPurpose, createEditLicence, createEditPoint, createEditCondition, createSetStatus } = require('./lib/action-creators');
const { stateManager, getInitialState } = require('./lib/state-manager');
const { search, recent } = require('./lib/search');
const { STATUS_IN_PROGRESS, STATUS_IN_REVIEW } = require('./lib/statuses');
const { schemaToForm, dereference } = require('./lib/form-generator');
const { setValues } = require('../../lib/forms');

// Config for editing different data models
const objectConfig = {
  licence: {
    schema: require('./schema/licence.json'),
    getter: getLicence,
    actionCreator: createEditLicence
  },
  purpose: {
    schema: require('./schema/purpose.json'),
    getter: getPurpose,
    actionCreator: createEditPurpose
  },
  point: {
    schema: require('./schema/point.json'),
    getter: getPoint,
    actionCreator: createEditPoint
  },
  condition: {
    schema: require('./schema/condition.json'),
    getter: getCondition,
    actionCreator: createEditCondition
  },
  'wr22_2.1': {
    schema: require('./schema/wr22/2.1.json'),
    getter: getCondition,
    actionCreator: createEditCondition
  }
};

/**
 * View / search licences
 */
const getViewLicences = async (request, h) => {
  const { q, page } = request.query;

  const view = {
    q,
    ...request.view
  };

  if (q) {
    const { data, pagination } = await search(q, page);
    view.licences = data;
    view.pagination = pagination;
  } else {
    const { data, pagination } = await recent(page);
    view.licences = data;
    view.pagination = pagination;
  }

  return h.view('water/abstraction-reform/index', view);
};

/**
 * View a licence, with the original values and abstraction reform values
 * in columns for comparison
 * @param {String} request.params.documentId - CRM document ID
 */
const getViewLicence = async (request, h) => {
  const { documentId } = request.params;
  const { flash } = request.query;

  const { licence, finalState } = await load(documentId);

  const data = prepareData(licence, finalState);

  const permissions = getPermissions(request, finalState);

  const view = {
    flash,
    documentId,
    ...request.view,
    licence,
    lastEdit: finalState.lastEdit,
    data,
    ...permissions,
    highlightNald: finalState.status === STATUS_IN_PROGRESS,
    highlightAr: finalState.status === STATUS_IN_REVIEW
  };

  return h.view('water/abstraction-reform/licence', view);
};

/**
 * Edit an object from within the licence
 * @param {String} request.params.documentId - CRM document ID for licence
 * @param {String} request.params.type - type of entity, purpose, point etc
 * @param {String} request.params.id - the ID of the entity
 * @param {Number} request.query.create - whether creating a new data item
 */
const getEditObject = async (request, h) => {
  const isCreate = get(request.query, 'create', false);

  const {documentId, type, id} = request.params;

  // Load licence / AR licence from CRM
  const { licence, finalState } = await load(documentId);

  // Check permissions
  const { canEdit } = getPermissions(request, finalState);
  if (!canEdit) {
    return h.redirect(`/admin/abstraction-reform/licence/${documentId}?flash=locked`);
  }

  // Get schema and de-reference
  const { schema: schemaWithRefs, getter } = objectConfig[type];
  const schema = await dereference(schemaWithRefs);

  // Build form object
  let formAction = `/admin/abstraction-reform/licence/${documentId}/edit/${type}/${id}`;
  const csrfToken = request.sessionStore.get('csrf_token');
  let form = schemaToForm(formAction, csrfToken, schema);

  if (isCreate) {
    formAction += '?create=1';
  } else {
    const data = extractData(getter(finalState.licence, id), schema);
    form = setValues(form, data);
  }

  const view = {
    ...request.view,
    documentId,
    licence,
    pageTitle: `Edit ${type}`,
    form
  };

  return h.view('water/abstraction-reform/edit', view);
};

/**
 * Edits a licence/purpose/point/condition etc.
 */
const postEditObject = async (request, h) => {
  const { documentId, type, id } = request.params;
  const { csrf_token: csrfToken, ...rawPayload } = request.payload;

  const payload = transformNulls(rawPayload);

  // Load licence / AR licence from CRM
  const { licence, arLicence, finalState } = await load(documentId);

  // Check permissions
  const { canEdit } = getPermissions(request, finalState);
  if (!canEdit) {
    return h.redirect(`/admin/abstraction-reform/licence/${documentId}?flash=locked`);
  }

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

/**
 * Sets document status to a different workflow status
 * @param {String} request.params.documentId - the CRM document ID
 * @param {String} request.payload.notes - optional notes
 * @param {String} request.payload.status - new status for document
 */
const postSetStatus = async (request, h) => {
  const { documentId } = request.params;
  const { notes, status } = request.payload;

  if (request.formError) {
    return getViewLicence(request, h);
  }

  // Load licence / AR licence from CRM
  const { licence, arLicence } = await load(documentId);

  // Add new action to list
  const action = createSetStatus(status, notes, request.auth.credentials);
  const { actions } = arLicence.licence_data_value;
  actions.push(action);

  // Re-calculate final state
  // This is so we can get the status and last editor details and store these
  // Calculate final state from list of actions to update last editor/status
  const { lastEdit } = stateManager(getInitialState(licence), actions);

  // Save action list to permit repo
  await update(arLicence.licence_id, {actions, status, lastEdit});

  return h.redirect(`/admin/abstraction-reform`);
};

module.exports = {
  getViewLicences,
  getViewLicence,
  getEditObject,
  postEditObject,
  postSetStatus
};
