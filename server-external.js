require('dotenv').config();
require('app-module-path').addPath(require('path').join(__dirname, 'src/'));

// -------------- Require vendor code -----------------
const Blipp = require('blipp');
const Good = require('good');
const GoodWinston = require('good-winston');
const Hapi = require('@hapi/hapi');
const HapiAuthCookie = require('hapi-auth-cookie');
const HapiSanitizePayload = require('hapi-sanitize-payload');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Blankie = require('blankie');
const Scooter = require('@hapi/scooter');
const Yar = require('@hapi/yar');

// -------------- Require project code -----------------
const config = require('./src/external/config');
const plugins = require('./src/external/lib/hapi-plugins');
const routes = require('./src/external/modules/routes');
const returnsPlugin = require('./src/external/modules/returns/plugin');
const viewEngine = require('./src/external/lib/view-engine/');

// Initialise logger
const { logger } = require('./src/external/logger');
const goodWinstonStream = new GoodWinston({ winston: logger });

// Configure auth plugin
const AuthConfig = require('./src/external/lib/AuthConfig');
const connectors = require('./src/external/lib/connectors/services');
const authConfig = new AuthConfig(config, connectors);
const authPlugin = {
  plugin: require('shared/plugins/auth'),
  options: authConfig
};

// Configure password reset plugin
const ResetConfig = require('./src/shared/lib/ResetConfig');
const resetPlugin = {
  plugin: require('shared/plugins/reset-password'),
  options: new ResetConfig(config, connectors)
};

// Define server with REST API cache mechanism
// @TODO replace with redis
const server = Hapi.server({
  ...config.server,
  cache: {
    engine: require('./src/shared/lib/catbox-rest-api')
  } });

/**
 * Async function to start HAPI server
 */
async function start () {
  try {
    // Third-party plugins
    await server.register([Scooter, {
      plugin: Blankie,
      options: config.blankie
    }]);

    await server.register({
      plugin: Good,
      options: { ...config.good,
        reporters: {
          winston: [goodWinstonStream]
        }
      }
    });
    await server.register({
      plugin: Blipp,
      options: config.blipp
    });
    await server.register({
      plugin: Yar,
      options: config.yar
    });
    await server.register({
      plugin: HapiAuthCookie
    });

    await server.register({
      plugin: HapiSanitizePayload,
      options: config.sanitize
    });

    await server.register([Inert, Vision]);
    await server.register(Object.values(plugins));
    await server.register({ plugin: returnsPlugin });

    // Set up auth strategies
    server.auth.strategy('standard', 'cookie', {
      ...config.hapiAuthCookie,
      validateFunc: (request, data) => authConfig.validateFunc(request, data)
    });
    server.auth.default('standard');

    // Set up Nunjucks view engine
    server.views(viewEngine);

    // Auth plugin
    await server.register(authPlugin);
    await server.register(resetPlugin);

    server.route(routes);

    await server.start();

    server.log(['info'], `Server started on ${server.info.uri} port ${server.info.port}`);
  } catch (err) {
    logger.error('Failed to start server', err);
  }

  return server;
}

const processError = message => err => {
  logger.error(message, err);
  process.exit(1);
};

process
  .on('unhandledRejection', processError('unhandledRejection'))
  .on('uncaughtException', processError('uncaughtException'));

module.exports = server;
start();
