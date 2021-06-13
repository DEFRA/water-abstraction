'use strict';

const { errorHandler } = require('./lib/error-handler');
const GaugingStationsService = require('shared/lib/connectors/services/water/GaugingStationsService');
/**
 * Loads a gauging station from the water service using the Gauging Station Id
 * which can be passed in or retrieved from the request object
 * @param {Object} request
 * @param {String} companyId guid, if provided
 */
const loadGaugingStations = async (request, h, gaugingStationId = null) => {
  const id = gaugingStationId || request.params.gaugingStationId;
  try {
    const service = new GaugingStationsService(request.services.water);
    return service.getGaugingStationLicences(id);
  } catch (err) {
    return errorHandler(err, `Licences not found for gaugingStationId: ${id}`);
  }
};
exports.loadGaugingStations = loadGaugingStations;
