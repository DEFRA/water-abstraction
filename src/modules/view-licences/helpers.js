const { LicenceNotFoundError } = require('./errors');
const CRM = require('../../lib/connectors/crm');
const Permit = require('../../lib/connectors/permit');
const LicenceTransformer = require('../../lib/licence-transformer/');
const waterConnector = require('../../lib/connectors/water');
const { find, has } = require('lodash');

/**
 * Maps the sort in the HTTP query to the field names used internally
 * @param {Object} sort - the sorting in query, field name and direction
 * @return {Object} sort ready for use in getLicences CRM request
 */
function mapSort (sort) {
  const sortFields = {
    licenceNumber: 'system_external_id',
    name: 'document_name',
    expiryDate: 'document_expires'
  };
  return {
    [sortFields[sort.sort]]: sort.direction
  };
}

/**
 * Maps the sort in the HTTP query to the filter used internally
 * @param {Object} query - the HTTP query params
 * @return {Object} sort ready for use in getLicences CRM request
 */
function mapFilter (entityId, query) {
  const filter = {
    entity_id: entityId
  };
  // Search on licence name/number
  if (query.licenceNumber) {
    filter.string = query.licenceNumber;
  }
  // Search on user email address
  if (query.emailAddress) {
    filter.email = query.emailAddress;
  }
  return filter;
}

/**
 * Gets the licence page title based on the view, licence number and custom title
 * @param {String} view - the handlebars view
 * @param {String} licenceNumber - the licence number
 * @param {String} [customTitle] - if set, the custom name given by user to licence
 * @return {String} page title
 */
function getLicencePageTitle (view, licenceNumber, customName) {
  const titles = {
    purposes: `Abstraction details for ${customName || licenceNumber}`,
    points: `Abstraction points for ${customName || licenceNumber}`,
    conditions: `Conditions held for ${customName || licenceNumber}`,
    contact: 'Your licence contact details',
    'gauging-station': `Gauging station for ${customName || licenceNumber}`
  };

  const key = view.split('/').pop();

  if (key in titles) {
    return titles[key];
  }

  return customName ? `Licence name ${customName}` : `Licence number ${licenceNumber}`;
}

/**
 * Loads a list of gauging stations from the water service based on the
 * station references that are stored in the permit repo metadata
 * @param {Object} metadata - from permit repo licence record
 * @return {Promise} resolves with list of gauging stations
 */
function loadGaugingStations (metadata) {
  if (!(metadata && metadata.gaugingStations)) {
    return [];
  }
  // Load gauging station data
  const filter = {
    station_reference: {
      $in: (metadata.gaugingStations || []).map(row => row.stationReference)
    }
  };
  return waterConnector.gaugingStations.findMany(filter);
}

/**
 * Loads licence data for detail view from CRM and permit repo
 * @param {String} entityId - GUID for current individual entity
 * @param {String} documentId - GUID for the CRM document ID
 * @return {Promise} - resolves with CRM, permit repo and transformed licence data
 */
async function loadLicenceData (entityId, documentId) {
  const filter = {
    entity_id: entityId,
    document_id: documentId
  };

  // Get CRM data
  const { error, data: [documentHeader] } = await CRM.documents.getLicences(filter);
  if (error) {
    throw error;
  }

  if (!documentHeader) {
    throw new LicenceNotFoundError(`Licence with document ID ${documentId} missing in CRM`);
  }

  // Get permit repo data
  const {
    error: permitError,
    data: permitData
  } = await Permit.licences.findOne(documentHeader.system_internal_id);
  if (permitError) {
    throw permitError;
  }

  // Get gauging station data
  const {
    error: gaugingStationError,
    data: gaugingStations
  } = await loadGaugingStations(permitData.metadata);
  if (gaugingStationError) {
    throw gaugingStationError;
  }

  // Transform data using NALD data transformer
  const transformer = new LicenceTransformer();
  await transformer.load(permitData.licence_data_value);

  return {
    documentHeader,
    permitData,
    viewData: transformer.export(),
    gaugingStations
  };
}

const hasLatestReading = measure => has(measure, 'latestReading.value');
const isLevelMeasure = measure => measure.parameter === 'level';
const isFlowMeasure = measure => measure.parameter === 'flow';

/**
 * Logic for selecting which measure to display:
 * - if only 1 measure from station, show that
 * - if 2 measures, and 1 hof type, show the matching one
 * - if 2 measures, and 2 hof types, show flow
 * @param {Object} riverLevel - data returned from water river level API
 * @param {Object} hofTypes - HOF types in licence
 * @param {String} mode - can be flow|level|auto.  If auto, determined by hof types
 * @return {Object} measure the selected measure - level/flow
 */
function selectRiverLevelMeasure (riverLevel, hofTypes, mode = 'auto') {
  const flow = find(riverLevel.measures, measure => {
    return isFlowMeasure(measure) && hasLatestReading(measure);
  });

  const level = find(riverLevel.measures, measure => {
    return isLevelMeasure(measure) && hasLatestReading(measure);
  });

  switch (mode) {
    case 'auto':
      if (flow && hofTypes.cesFlow && !hofTypes.cesLev) {
        return flow;
      }
      if (level && !hofTypes.cesFlow && hofTypes.cesLev) {
        return level;
      }
      return flow || level;

    case 'level':
      return level;

    case 'flow':
      return flow;
  }

  /*
  if (mode === 'auto') {
    if (flow && hofTypes.cesFlow && !hofTypes.cesLev) {
      return flow;
    }
    if (level && !hofTypes.cesFlow && hofTypes.cesLev) {
      return level;
    }
    return flow || level;
  }

  if (mode === 'level' && level) {
    return level;
  }
  if (mode === 'flow' && flow) {
    return flow;
  }
  */
}

/**
 * Loads river level data for gauging station, and selects measure based
 * on hof types
 * @param {String} stationReference - reference for flood level API
 * @param {Object} hofTypes
 * @param {Boolean} hofTypes.cesFlow - whether CES FLOW condition in licence
 * @param {Boolean} hofTypes.cesLev - whether CES LEV condition in licence
 * @param {String} mode - flow|level|auto
 * @return {Promise} resolves with {riverLevel, measure}
 */
async function loadRiverLevelData (stationReference, hofTypes, mode) {
  const response = { riverLevel: null, measure: null };

  if (stationReference) {
    try {
      response.riverLevel = await waterConnector.getRiverLevel(stationReference);
    } catch (err) {
      // Don't throw error for 404.  A valid station ID may return 404
      // because it is disabled
      if (err.statusCode !== 404) {
        throw err;
      }
    }
  }

  if (response.riverLevel) {
    response.measure = selectRiverLevelMeasure(response.riverLevel, hofTypes, mode);
  }

  return response;
}

module.exports = {
  mapSort,
  mapFilter,
  getLicencePageTitle,
  loadLicenceData,
  loadRiverLevelData,
  selectRiverLevelMeasure
};
