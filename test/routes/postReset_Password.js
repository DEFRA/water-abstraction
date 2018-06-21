'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();

const Code = require('code');
const DOMParser = require('xmldom').DOMParser;

const server = require('../../index');

// const CookieService = require('../../src/services/cookie.service')

// let validateCookieStub

const routePath = '/reset_password';

lab.experiment('Check signin', () => {
  lab.test('The page should return 200', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {}
    };

    const res = await server.inject(request);
    Code.expect(res.statusCode).to.equal(200);
  });
});
