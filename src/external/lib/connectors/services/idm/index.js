const UsersAPIClient = require('./UsersAPIClient');
const http = require('shared/lib/connectors/http');

module.exports = config => ({
  users: new UsersAPIClient(http.request, {
    endpoint: `${config.services.idm}/user`,
    headers: {
      Authorization: process.env.JWT_TOKEN
    }
  })
});
