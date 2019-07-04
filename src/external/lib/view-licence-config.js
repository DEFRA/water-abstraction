const { licenceHolder, colleague, colleagueWithReturns } = require('./constants').scope;
const { getReturnPath } = require('./return-path');
const services = require('./connectors/services');

const getLicenceSummaryReturns = licenceNumber => {
  return services.returns.returns.getLicenceReturns([licenceNumber], {
    page: 1,
    perPage: 10
  });
};

exports.allowedScopes = [licenceHolder, colleague, colleagueWithReturns];
exports.getReturnPath = getReturnPath;
exports.getLicenceSummaryReturns = getLicenceSummaryReturns;
exports.getCommunication = services.water.communications.getCommunication.bind(services.water.communications);
exports.getRiverLevel = services.water.riverLevels.getRiverLevel;
