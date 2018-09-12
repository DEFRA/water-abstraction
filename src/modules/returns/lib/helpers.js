/* eslint new-cap: "warn" */
const Boom = require('boom');
const moment = require('moment');
const { documents } = require('../../../lib/connectors/crm');
const { returns, versions } = require('../../../lib/connectors/returns');
const { externalRoles } = require('../../../lib/constants');

/**
 * Gets licences from the CRM that can be viewed by the supplied entity ID
 * @param {String} entityId - individual entity GUID
 * @param {String} licenceNumber - find a particular licence number
 * @return {Promise} - resolved with array of objects with system_external_id (licence number) and document_name
 */
const getLicenceNumbers = async (entityId, filter = {}, isInternal) => {
  filter.entity_id = entityId;
  filter.roles = getInternalRoles(isInternal, filter.roles);

  const { data, error } = await documents.findMany(filter, {}, { perPage: 300 }, ['system_external_id', 'document_name', 'document_id']);

  if (error) {
    throw Boom.badImplementation('CRM error', error);
  }

  return data;
};

/**
 * Get the returns for a list of licence numbers
 * @param {Array} list of licence numbers to get returns data for
 * @return {Promise} resolves with returns
 */
const getLicenceReturns = async (licenceNumbers, page = 1) => {
  const filter = {
    regime: 'water',
    licence_type: 'abstraction',
    licence_ref: {
      $in: licenceNumbers
    },
    'metadata->>isCurrent': 'true',
    start_date: {
      $gte: '2008-04-01'
    }
  };

  const sort = {
    start_date: -1,
    licence_ref: 1
  };

  const columns = ['return_id', 'licence_ref', 'start_date', 'end_date', 'metadata', 'status', 'received_date'];

  const requestPagination = {
    page,
    perPage: 50
  };

  const { data, error, pagination } = await returns.findMany(filter, sort, requestPagination, columns);
  if (error) {
    throw Boom.badImplementation('Returns error', error);
  }

  return { data, pagination };
};

/**
 * Groups and sorts returns by year descending
 * @param {Array} data
 * @return {Array} organised by year
 */
const groupReturnsByYear = (data) => {
  const grouped = data.reduce((acc, row) => {
    const year = parseInt(row.start_date.substr(0, 4));
    if (!(year in acc)) {
      acc[year] = {
        year,
        returns: []
      };
    }
    acc[year].returns.push(row);
    return acc;
  }, {});

  return Object.values(grouped).reverse();
};

/**
 * Merges returns data with licence names
 * @param {Array} returnsData - data from returns module
 * @param {Array} documents - data from CRM document headers
 * @return {Array} returns data with licenceName property added
 */
const mergeReturnsAndLicenceNames = (returnsData, documents) => {
  const map = documents.reduce((acc, row) => {
    return {
      ...acc,
      [row.system_external_id]: row.document_name
    };
  }, {});
  return returnsData.map(row => {
    return {
      ...row,
      licenceName: map[row.licence_ref]
    };
  });
};

/**
 * Gets the most recent version of a return
 * @param {String} returnId
 * @return {Promise} resolves with object of version data on success
 */
const getLatestVersion = async (returnId) => {
  // Find newest version
  const filter = {
    return_id: returnId
  };
  const sort = {
    version_number: -1
  };
  const { error, data: [version] } = await versions.findMany(filter, sort);
  if (error) {
    throw Boom.badImplementation(error);
  }
  return version;
};

/**
 * Checks whether any line in the return has imperial units
 * @param {Array} lines
 * @return {Boolean}
 */
const hasGallons = (lines) => {
  return lines.reduce((acc, line) => {
    return acc || line.user_unit === 'gal';
  }, false);
};

/**
 * Gets return total, which can also be null if no values are filled in
 * @param {Object} ret - return model from water service
 * @return {Number|null} total or null
 */
const getReturnTotal = (ret) => {
  if (!ret.lines) {
    return null;
  }
  const lines = ret.lines.filter(line => line.quantity !== null);
  return lines.length === 0 ? null : lines.reduce((acc, line) => {
    return acc + line.quantity;
  }, 0);
};

/**
 * Whether the user of the current request can edit the supplied return row
 * @param {Object} request - the HAPI HTTP request
 * @param {Object} return - the return row from the return service or water service model
 * @return {Boolean}
 */
const canEdit = (request, ret) => {
  const endDate = ret.endDate || ret.end_date;
  const { status } = ret;
  const isAfterSummer2018 = moment(endDate).isSameOrAfter('2018-10-31');
  const canSubmit = request.permissions.hasPermission('returns.submit');
  const canEdit = request.permissions.hasPermission('returns.edit');

  return isAfterSummer2018 &&
    (
      (canEdit) ||
      (canSubmit && (status === 'due'))
    );
};

/**
 * Checks whether return has been received
 * @param {Object} ret
 * @return {Boolean}
 */
const returnIsReceived = (ret) => {
  return ret.date_received !== null;
};

/**
 * Adds an editable flag to each return in list
 * This is based on the status of the return, and whether the user
 * has internal returns role.
 * @param {Array} returns - returned from returns service
 * @param {Object} request - HAPI request interface
 * @return {Array} returns with isEditable flag added
 */
const addEditableFlag = (returns, request) => {
  return returns.map(row => {
    const isEditable = canEdit(request, row);
    const isReceived = returnIsReceived(row);
    const isClickable = isEditable || isReceived;
    return {
      ...row,
      isEditable,
      isReceived,
      isClickable
    };
  });
};

/**
 * Gets data to display in returns list view
 * This can be either all returns for a particular CRM entity,
 * or additionally can be filtered e.g. by document ID
 * @param {Object} request
 * @param {String} request.auth.credentials.entity_id - CRM entity ID of the current user
 * @param {Number} request.query.page - page number, for paginated results
 * @param {String} request.params.documentId - a single document ID to retrieve (otherwise gets all)
 * @return {Promise} resolves with list view data
 */
const getReturnsViewData = async (request) => {
  const { page } = request.query;
  const { entity_id: entityId } = request.auth.credentials;
  const { documentId } = request.params;

  // Get documents from CRM
  const filter = documentId ? { document_id: documentId } : {};

  const isInternal = request.permissions.hasPermission('admin.defra');

  const documents = await getLicenceNumbers(entityId, filter, isInternal);
  const licenceNumbers = documents.map(row => row.system_external_id);

  const view = {
    ...request.view,
    documents,
    document: documentId ? documents[0] : null,
    returns: []
  };

  if (licenceNumbers.length) {
    const { data, pagination } = await getLicenceReturns(licenceNumbers, page);
    const returns = groupReturnsByYear(mergeReturnsAndLicenceNames(addEditableFlag(data, request), documents));

    view.pagination = pagination;
    view.returns = returns;
  }

  return view;
};

/**
 * If the user is an external user, add the CRM roles that the requesting user
 * would need to have one of, in order to be authorised to view a return.
 */
const getInternalRoles = (isInternalUser, roles) => {
  return isInternalUser ? roles : [externalRoles.colleagueWithReturns, externalRoles.licenceHolder];
};

/**
 * Redirects to admin path if internal user
 * @param {Object} request - HAPI request instance
 * @param {String} path - the path to redirect to without '/admin'
 * @return {String} path with /admin if internal user
 */
const getScopedPath = (request, path) => {
  const isInternal = request.permissions.hasPermission('admin.defra');
  return isInternal ? `/admin${path}` : path;
};

module.exports = {
  getLicenceNumbers,
  getLicenceReturns,
  groupReturnsByYear,
  mergeReturnsAndLicenceNames,
  getLatestVersion,
  hasGallons,
  getReturnsViewData,
  // isInternalReturnsUser,
  // isInternalUser,
  getInternalRoles,
  getReturnTotal,
  getScopedPath,
  canEdit
};
