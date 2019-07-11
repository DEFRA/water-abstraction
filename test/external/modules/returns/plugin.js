'use strict';
const sinon = require('sinon');
const { expect } = require('code');
const Lab = require('lab');
const { set } = require('lodash');
const { experiment, test, beforeEach, afterEach } = exports.lab = Lab.script();

const plugin = require('external/modules/returns/plugin');
const services = require('external/lib/connectors/services');
const helpers = require('external/modules/returns/lib/helpers');

const sandbox = sinon.createSandbox();

const returnId = 'return_1';
const licenceNumber = 'licence_1';
const companyId = 'company_1';

const createRequest = (isInternal, isLoadOption) => ({
  query: {
    returnId
  },
  defra: {
    companyId
  },
  auth: {
    credentials: {
      scope: isInternal ? ['internal', 'returns'] : ['external', 'primary_user']
    }
  },
  route: {
    settings: {
      plugins: {
        returns: isLoadOption ? { load: true } : true
      }
    }
  }
});

experiment('returns plugin', () => {
  let h;

  beforeEach(async () => {
    sandbox.stub(services.water.returns, 'getReturn').resolves({
      returnId,
      licenceNumber
    });
    sandbox.stub(services.crm.documents, 'findMany').resolves({
      error: null,
      data: [{ document_id: 'abc' }]
    });
    sandbox.stub(helpers, 'getViewData').resolves({ foo: 'bar' });
    h = {
      view: sandbox.stub(),
      redirect: sandbox.stub(),
      continue: 'continue'
    };
  });

  afterEach(async () => {
    sandbox.restore();
  });

  experiment('for external users', () => {
    let request;

    experiment('when load config option is set', () => {
      beforeEach(async () => {
        request = createRequest(false, true);
      });

      test('loads document from CRM to check access', async () => {
        await plugin._handler(request, h);
        expect(services.crm.documents.findMany.callCount).to.equal(1);

        const [ filter ] = services.crm.documents.findMany.lastCall.args;
        expect(filter.company_entity_id).to.equal(companyId);
        expect(filter.system_external_id).to.equal(licenceNumber);
        expect(filter.regime_entity_id).to.be.a.string();
      });

      test('sets loaded view and return data in request', async () => {
        await plugin._handler(request, h);
        expect(request.returns.data).to.equal({ returnId });
        expect(request.returns.view).to.equal({ foo: 'bar' });
        expect(request.returns.isInternal).to.equal(false);
      });

      test('throws error and redirects if CRM document not found', async () => {
        services.crm.documents.findMany.resolves({ data: [] });
        const func = () => plugin._handler(request, h);
        await expect(func()).to.reject();
        expect(h.redirect.callCount).to.equal(1);
        const [ path ] = h.redirect.lastCall.args;
        expect(path).to.equal('/returns/return?id=return_1');
      });

      test('throws error and redirects if no returns permission', async () => {
        set(request, 'auth.credentials.scope', ['external', 'user']);
        const func = () => plugin._handler(request, h);
        await expect(func()).to.reject();
        expect(h.redirect.callCount).to.equal(1);
        const [ path ] = h.redirect.lastCall.args;
        expect(path).to.equal('/returns/return?id=return_1');
      });
    });

    experiment('when load config option not set', () => {
      beforeEach(async () => {
        request = createRequest(false, false);
      });

      test('loads data from session', async () => {
        await plugin._handler(request, h);
        expect(services.crm.documents.findMany.callCount).to.equal(0);
      });
    });
  });
});
