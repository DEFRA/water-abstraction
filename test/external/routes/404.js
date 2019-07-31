'use strict';

const { experiment, test } = exports.lab = require('lab').script();
const { expect } = require('code');

const routes = require('external/modules/core/routes');
const routePath = '/causeA404';

const { createServer } = require('../server-factory');

experiment('Page does not exist', () => {
  test('The page should 404', async () => {
    const server = await createServer();
    server.route(routes['404']);

    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {},
      credentials: {
        userId: '123'
      }
    };

    const res = await server.inject(request);
    expect(res.statusCode).to.equal(404);
  });
});
