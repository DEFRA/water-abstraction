'use strict';

const sinon = require('sinon');
const sandbox = sinon.createSandbox();

const {
  experiment,
  test,
  beforeEach,
  afterEach
} = exports.lab = require('lab').script();
const connectors = require('external/modules/service-status/lib/connectors');
const services = require('external/lib/connectors/services');

const { expect } = require('code');

const response = {
  data: [{
    id: 'id_1'
  }],
  pagination: {
    totalRows: 5
  }
};

const createClient = () => {
  return {
    findMany: sandbox.stub().resolves(response)
  };
};

experiment('getCount', () => {
  let apiClient;

  beforeEach(async () => {
    apiClient = createClient();
  });

  test('it calls the API client with correct arguments', async () => {
    await connectors.getCount(apiClient);
    const [filter, sort, pagination] = apiClient.findMany.firstCall.args;

    expect(filter).to.equal({});
    expect(sort).to.equal({});
    expect(pagination).to.equal({ perPage: 1 });
  });

  test('gets number of records if call succeeds', async () => {
    const result = await connectors.getCount(apiClient);
    expect(result).to.equal(5);
  });

  test('throws error if error returned from API', async () => {
    apiClient.findMany.resolves({ error: 'Ooops!' });
    const func = () => {
      return connectors.getCount(apiClient);
    };
    expect(func()).to.reject();
  });

  test('throws error if API call rejects', async () => {
    apiClient.findMany.rejects();
    const func = () => {
      return connectors.getCount(apiClient);
    };
    expect(func()).to.reject();
  });
});

experiment('getKPIData', () => {
  let apiClient;

  beforeEach(async () => {
    apiClient = createClient();
  });

  test('gets data if call succeeds', async () => {
    const result = await connectors.getKPIData(apiClient);
    expect(result).to.equal(response.data);
  });

  test('throws error if error returned from API', async () => {
    apiClient.findMany.resolves({ error: 'Ooops!' });
    const func = () => {
      return connectors.getKPIData(apiClient);
    };
    expect(func()).to.reject();
  });

  test('throws error if API call rejects', async () => {
    apiClient.findMany.rejects();
    const func = () => {
      return connectors.getKPIData(apiClient);
    };
    expect(func()).to.reject();
  });
});

experiment('Connectors call correct APIs', () => {
  beforeEach(async () => {
    // IDM
    sandbox.stub(services.idm.users, 'findMany').resolves(response);
    sandbox.stub(services.idm.kpis, 'findMany').resolves(response);

    // CRM
    sandbox.stub(services.crm.documents, 'findMany').resolves(response);
    sandbox.stub(services.crm.verifications, 'findMany').resolves(response);
    sandbox.stub(services.crm.kpis, 'findMany').resolves(response);

    // Water
    sandbox.stub(services.water.pendingImports, 'findMany').resolves(response);

    // Permits
    sandbox.stub(services.permits.licences, 'findMany').resolves(response);
  });

  afterEach(async () => {
    sandbox.restore();
  });

  test('getIDMUserCount calls IDM users endpoint', async () => {
    await connectors.getIDMUserCount();
    expect(services.idm.users.findMany.callCount).to.equal(1);
  });

  test('getIDMKPIData calls IDM KPI endpoint', async () => {
    await connectors.getIDMKPIData();
    expect(services.idm.kpis.findMany.callCount).to.equal(1);
  });

  test('getCRMDocumentCount calls CRM documents endpoint', async () => {
    await connectors.getCRMDocumentCount();
    expect(services.crm.documents.findMany.callCount).to.equal(1);
  });

  test('getCRMKPIData calls CRM KPI endpoint', async () => {
    await connectors.getCRMKPIData();
    expect(services.crm.kpis.findMany.callCount).to.equal(1);
  });

  test('getCRMVerificationCount calls CRM verification endpoint', async () => {
    await connectors.getCRMVerificationCount();
    expect(services.crm.verifications.findMany.callCount).to.equal(1);
  });

  test('getPermitCount calls permit repo licences endpoint', async () => {
    await connectors.getPermitCount();
    expect(services.permits.licences.findMany.callCount).to.equal(1);
    const [filter] = services.permits.licences.findMany.firstCall.args;
    expect(filter.licence_regime_id).to.equal(1);
    expect(filter.licence_type_id).to.equal(8);
  });

  test('getWaterPendingImports calls water pending import endpoint', async () => {
    await connectors.getWaterPendingImports();
    expect(services.water.pendingImports.findMany.callCount).to.equal(1);
    const [filter] = services.water.pendingImports.findMany.firstCall.args;
    expect(filter.status).to.equal(0);
  });

  test('getWaterCompletedImports calls water pending import endpoint', async () => {
    await connectors.getWaterCompletedImports();
    expect(services.water.pendingImports.findMany.callCount).to.equal(1);
    const [filter] = services.water.pendingImports.findMany.firstCall.args;
    expect(filter.status).to.equal(1);
  });
});
