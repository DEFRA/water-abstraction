/**
 * HAPI Route handlers for viewing and managing licences
 * @module controllers/licences
 */

/* eslint "new-cap" : ["warn", { "newIsCap": true }] */
const Boom = require('boom');
const CRM = require('../../lib/connectors/crm');
const { getLicenceCount } = require('../../lib/connectors/crm/documents');
const { getOutstandingVerifications } = require('../../lib/connectors/crm/verification');

const { getLicences: baseGetLicences } = require('./base');
const { getLicencePageTitle, loadLicenceData } = require('./helpers');

/**
 * Gets a list of licences with options to filter by email address,
 * Search by licence number, and sort by number/user defined name
 * @param {Object} request - the HAPI HTTP request
 * @param {Object} [request.query] - GET query params
 * @param {String} [request.query.emailAddress] - the email address to filter on
 * @param {String} [request.query.licenceNumber] - the licence number to search on
 * @param {String} [request.query.sort] - the field to sort on licenceNumber|name
 * @param {Number} [request.query.direction] - sort direction +1 : asc, -1 : desc
 * @param {Object} reply - the HAPI HTTP response
 */
async function getLicences (request, reply) {
  const { view } = request;
  const { entity_id: entityId } = request.auth.credentials;

  // Check if user has any licences
  const licenceCount = await getLicenceCount(entityId);
  if (licenceCount === 0) {
    return reply.redirect('/add-licences');
  }
  view.enableSearch = licenceCount > 5;

  // Check for verifications
  const { data: verifications } = await getOutstandingVerifications(entityId);
  if (verifications.length) {
    if (licenceCount === 0) {
      return reply.redirect('/security-code');
    }
    view.showVerificationAlert = true;
  }

  // Count primary_user/user roles to determine if agent
  // Agents have the ability to search by user email address
  view.showEmailFilter = request.permissions.licences.multi;

  return baseGetLicences(request, reply);
}

/**
 * View details for a single licence
 * @param {Object} request - the HAPI HTTP request
 * @param {String} request.params.licence_id - CRM document header GUID
 * @param {Object} reply - HAPI reply interface
 */
async function getLicenceDetail (request, reply) {
  const { entity_id: entityId } = request.auth.credentials;
  const { licence_id: documentHeaderId } = request.params;

  try {
    const {
      documentHeader,
      viewData
    } = await loadLicenceData(entityId, documentHeaderId);

    const { system_external_id: licenceNumber, document_name: customName } = documentHeader;
    const { view } = request;

    return reply.view(request.config.view, {
      ...view,
      licence_id: documentHeaderId,
      name: 'name' in request.view ? request.view.name : customName,
      licenceData: viewData,
      pageTitle: getLicencePageTitle(request.config.view, licenceNumber, customName)
    });
  } catch (error) {
    if (error.name === 'LicenceNotFoundError') {
      return reply(new Boom.notFound('Licence not found', error));
    }

    reply(new Boom.badImplementation(error));
  }
};

/**
 * Update a licence name
 * @param {Object} request - the HAPI HTTP request
 * @param {String} request.payload.name - the new name for the licence
 * @param {Object} reply - the HAPI HTTP response
 */
async function postLicenceRename (request, reply) {
  if (request.formError) {
    return getLicenceDetail(request, reply);
  }

  const { name } = request.formValue;
  const { entity_id: entityId } = request.auth.credentials;

  // Check user has access to supplied document
  const filter = {
    entity_id: entityId,
    document_id: request.params.licence_id
  };

  const { data, error } = await CRM.documents.getLicences(filter);

  if (error || data.length === 0) {
    return reply(new Boom.notFound('Document not found', error));
  }

  const { document_id: documentId } = data[0];

  // Rename licence
  const { error: error2 } = CRM.documents.setLicenceName(documentId, name);

  if (error2) {
    return reply(new Boom.badImplementation('CRM error', error2));
  }

  const { redirectBasePath = '/licences' } = request.config;
  return reply.redirect(`${redirectBasePath}/${documentId}`);
}

module.exports = {
  getLicences,
  getLicenceDetail,
  postLicenceRename
};
