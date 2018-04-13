const Boom = require('boom');
const CRM = require('../../lib/connectors/crm');
const { getUser } = require('../../lib/connectors/idm');
const { mapSort, mapFilter } = require('./helpers');

/**
 * Base get licences route handler - used by both front-end and admin
 * handlers
 * @param {Object} request - the HAPI HTTP request
 * @param {Object} [request.query] - GET query params
 * @param {String} [request.query.emailAddress] - the email address to filter on
 * @param {String} [request.query.licenceNumber] - the licence number to search on
 * @param {String} [request.query.sort] - the field to sort on licenceNumber|name
 * @param {Number} [request.query.direction] - sort direction +1 : asc, -1 : desc
 * @param {Object} reply - the HAPI HTTP response
 */
async function getLicences (request, reply) {
  const { entity_id: entityId } = request.auth.credentials;
  const { page, emailAddress } = request.query;
  const sort = mapSort(request.query);
  const filter = mapFilter(entityId, request.query);

  // Check if user exists
  if (emailAddress) {
    const { error, data } = await getUser(emailAddress);
    request.view.error = error;
  }

  // Get licences from CRM
  const { data, error, pagination } = await CRM.documents.getLicences(filter, sort, {
    page,
    perPage: 50
  });
  if (error) {
    reply(Boom.badImplementation('CRM error', error));
  }

  return reply.view('water/view-licences/licences', {
    ...request.view,
    licenceData: data,
    pagination
  });
}

module.exports = {
  getLicences
};
