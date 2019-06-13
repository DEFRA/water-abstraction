'use strict';
const { expect } = require('code');
const Lab = require('lab');
const sinon = require('sinon');
const { experiment, test, beforeEach, afterEach } = exports.lab = Lab.script();

const { createRequest } = require('./test-helpers');

const { getPath, getNextPath, getPreviousPath } =
  require('../../../../../../src/external/modules/returns/lib/flow-helpers');

const external =
    require('../../../../../../src/external/modules/returns/lib/flow-helpers/external');

const data = require('./test-data.json');

const path = '/some/path';

const sandbox = sinon.createSandbox();

experiment('Returns flow helpers', () => {
  beforeEach(async () => {
    external.next.TEST = sandbox.stub();
    external.previous.TEST = sandbox.stub();
  });

  afterEach(async () => {
    sandbox.restore();
  });

  experiment('getPath', () => {
    test('it should return an external path', async () => {
      const request = createRequest();
      const result = getPath(path, request, data.nilReturn);
      expect(result).to.equal(`/some/path?returnId=nilReturn`);
    });

    test('does not add the return param for the licences route', async () => {
      const request = createRequest();
      const result = getPath('/licences', request, data.nilReturn);
      expect(result).to.equal(`/licences`);
    });

    test('does not add the return param for the returns route', async () => {
      const request = createRequest();
      const result = getPath('/returns', request, data.nilReturn);
      expect(result).to.equal(`/returns`);
    });
  });

  experiment('getNextPath', () => {
    test('it should call an external flow helper for an external user', async () => {
      const request = createRequest();
      getNextPath('TEST', request, data.nilReturn);
      expect(external.next.TEST.callCount).to.equal(1);
    });
  });

  experiment('getPreviousPath', () => {
    test('it should call an external flow helper for an external user', async () => {
      const request = createRequest();
      getPreviousPath('TEST', request, data.nilReturn);
      expect(external.previous.TEST.callCount).to.equal(1);
    });
  });
});
