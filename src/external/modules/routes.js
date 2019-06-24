const addLicencesRoutes = require('./add-licences/routes');
const coreRoutes = require('./core/routes');
const contentRoutes = require('./content/routes');
const manageLicencesRoutes = require('./manage-licences/routes');
const updatePasswordRoutes = require('./update-password/routes');
const viewLicencesRoutes = require('./view-licences/routes');
const registrationRoutes = require('./registration/routes');
const serviceStatusRoutes = require('./service-status/routes');
const returnsRoutes = require('./returns/routes');
const companySelector = require('./company-selector/routes');

module.exports = [
  ...Object.values(addLicencesRoutes),
  ...Object.values(coreRoutes),
  ...Object.values(contentRoutes),
  ...Object.values(registrationRoutes),
  ...Object.values(manageLicencesRoutes),
  ...Object.values(updatePasswordRoutes),
  ...Object.values(viewLicencesRoutes),
  ...Object.values(serviceStatusRoutes),
  ...Object.values(returnsRoutes),
  ...Object.values(companySelector)
];
