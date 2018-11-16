const Boom = require('boom');
const { returns } = require('../../../lib/connectors/water');
const { documents } = require('../../../lib/connectors/crm');
const returnsService = require('../../../lib/connectors/returns');

const { getViewData, getLicenceNumbers } = require('../lib/helpers');
const { handleRequest, getValues } = require('../../../lib/forms');
const { applyStatus, applyUserDetails, applyUnderQuery } = require('../lib/return-helpers');
const { findLatestReturn } = require('../lib/api-helpers');

const {
  internalRoutingForm
} = require('../forms/');

const {
  STEP_INTERNAL_ROUTING,
  STEP_LOG_RECEIPT,
  getPreviousPath,
  getNextPath
} = require('../lib/flow-helpers');

const {
  logReceiptForm,
  logReceiptSchema,
  searchForm,
  searchApplyNoReturnError
} = require('../forms/');

/**
 * When searching for return by ID, gets redirect path which is either to
 * the completed return page, or the edit return flow if not yet completed
 * @param {Object} ret - return object from returns service
 * @return {String} redirect path
 */
const getRedirectPath = (ret) => {
  const { return_id: returnId, status } = ret;
  return status === 'completed' ? `/admin/returns/return?id=${returnId}` : `/admin/return/internal?returnId=${returnId}`;
};

/**
 * Search for return ID
 */
const getSearch = async (request, h) => {
  const isSubmitted = 'query' in request.query;
  const { entity_id: entityId } = request.auth.credentials;
  let form = isSubmitted ? handleRequest(searchForm(request), request) : searchForm(request);

  if (form.isValid) {
    const { query } = getValues(form);

    const { filter, sort, pagination, columns } = findLatestReturn(query);
    const { data: [ret] } = await returnsService.returns.findMany(filter, sort, pagination, columns);

    if (ret) {
      // Load CRM doc header - this checks the licence version is current
      const [ documentHeader ] = await getLicenceNumbers(entityId, {system_external_id: ret.licence_ref}, true);

      if (documentHeader) {
        const path = getRedirectPath(ret);
        return h.redirect(path);
      }
    }

    // Apply error state
    form = searchApplyNoReturnError(form);
  }

  return h.view('water/returns/internal/search', {
    ...request.view,
    form
  });
};

/**
 * For internal users, routing page to decide what to do with return
 * @param {String} request.query.returnId - return ID string
 */
const getInternalRouting = async (request, h) => {
  const { returnId } = request.query;

  const data = await returns.getReturn(returnId);
  const view = await getViewData(request, data);

  const form = internalRoutingForm(request, data);

  return h.view('water/returns/internal/form', {
    ...view,
    form,
    return: data,
    back: getPreviousPath(STEP_INTERNAL_ROUTING, request, data)
  });
};

/**
 * Post handler for internal returns
 */
const postInternalRouting = async (request, h) => {
  const { returnId } = request.query;

  const data = await returns.getReturn(returnId);
  const view = await getViewData(request, data);

  const form = handleRequest(internalRoutingForm(request, data), request);

  if (form.isValid) {
    const values = getValues(form);
    const isQueryOption = ['set_under_query', 'clear_under_query'].includes(values.action);
    const isUnderQuery = values.action === 'set_under_query';

    if (isQueryOption) {
      let updated = applyUnderQuery(data, { isUnderQuery });
      updated = applyStatus(updated, 'received');
      updated = applyUserDetails(updated, request.auth.credentials);
      await returns.patchReturn(updated);
    }

    const path = getNextPath(STEP_INTERNAL_ROUTING, request, values);
    return h.redirect(path);
  } else {
    return h.view('water/returns/internal/form', {
      ...view,
      form,
      return: data,
      back: getPreviousPath(STEP_INTERNAL_ROUTING, request, data)
    });
  }
};

/**
 * Renders form to log receipt of a return form
 */
const getLogReceipt = async (request, h) => {
  const { returnId } = request.query;

  const data = await returns.getReturn(returnId);
  const view = await getViewData(request, data);

  return h.view('water/returns/internal/form', {
    ...view,
    form: logReceiptForm(request, data),
    return: data,
    back: getPreviousPath(STEP_INTERNAL_ROUTING, request, data)
  });
};

/**
 * POST handler for log receipt form
 */
const postLogReceipt = async (request, h) => {
  const { returnId } = request.query;

  const data = await returns.getReturn(returnId);
  const view = await getViewData(request, data);

  const form = handleRequest(logReceiptForm(request, data), request, logReceiptSchema());

  if (form.isValid) {
    // Apply received date and status to return data
    const { date_received: receivedDate } = getValues(form);
    let d = applyStatus(data, 'received', receivedDate);
    d = applyUserDetails(d, request.auth.credentials);

    // Patch returns service via water service
    await returns.patchReturn(d);

    return h.redirect(getNextPath(STEP_LOG_RECEIPT, request, data));
  } else {
    return h.view('water/returns/internal/form', {
      ...view,
      form,
      return: data,
      back: getPreviousPath(STEP_INTERNAL_ROUTING, request, data)
    });
  }
};

/**
 * Prepares view data for log receipt / under query submitted pages
 * @param {Object} request - HAPI request instance
 * @return {Promise} resolves with view data
 */
const getSubmittedViewData = async (request) => {
  const { returnId } = request.query;

  const data = await returns.getReturn(returnId);
  const view = await getViewData(request, data);

  // Redirect path is returns page for this licence
  const { data: [{ document_id: documentId }], error } = await documents.findMany({ system_external_id: data.licenceNumber });
  if (error) {
    throw Boom.badImplementation(`Error finding CRM document for ${data.licenceNumber}`, error);
  }
  const returnsUrl = `/admin/licences/${documentId}/returns`;

  return {
    ...view,
    return: data,
    returnsUrl
  };
};

/**
 * Success page for logging receipt of return
 */
const getReceiptLogged = async (request, h) => {
  const view = await getSubmittedViewData(request);
  return h.view('water/returns/internal/receipt-logged', view);
};

const getQueryLogged = async (request, h) => {
  const view = await getSubmittedViewData(request);
  return h.view('water/returns/internal/query-logged', view);
};

module.exports = {
  getSearch,
  getInternalRouting,
  postInternalRouting,
  getLogReceipt,
  postLogReceipt,
  getReceiptLogged,
  getQueryLogged
};
