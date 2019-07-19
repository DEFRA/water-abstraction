// Shared services
const CommunicationsService = require('shared/lib/connectors/services/water/CommunicationsService');
const CompaniesService = require('shared/lib/connectors/services/water/CompaniesService');
const LicencesService = require('shared/lib/connectors/services/water/LicencesService');
const ReturnsService = require('shared/lib/connectors/services/water/ReturnsService');
const RiverLevelsService = require('shared/lib/connectors/services/water/RiverLevelsService');
const ServiceStatusService = require('shared/lib/connectors/services/water/ServiceStatusService');
const UsersService = require('shared/lib/connectors/services/water/UsersService');

// Shared API Clients
const EventsApiClient = require('shared/lib/connectors/services/water/EventsApiClient');
const GaugingStationsApiClient = require('shared/lib/connectors/services/water/GaugingStationsApiClient');
const PendingImportsApiClient = require('shared/lib/connectors/services/water/PendingImportsApiClient');

// API Clients
const NotificationsApiClient = require('./NotificationsApiClient');

const { logger } = require('../../../../logger');

module.exports = config => ({
  // Shared services
  communications: new CommunicationsService(config.services.water, logger),
  companies: new CompaniesService(config.services.water, logger),
  licences: new LicencesService(config.services.water, logger),
  returns: new ReturnsService(config.services.water, logger),
  riverLevels: new RiverLevelsService(config.services.water, logger),
  serviceStatus: new ServiceStatusService(config.services.water, logger),
  users: new UsersService(config.services.water, logger),

  // Shared API Clients
  events: new EventsApiClient(config, logger),
  gaugingStations: new GaugingStationsApiClient(config, logger),
  pendingImports: new PendingImportsApiClient(config, logger),

  // API Clients
  notifications: new NotificationsApiClient(config, logger)
});
