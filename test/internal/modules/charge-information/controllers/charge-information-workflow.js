'use strict';

const { expect } = require('@hapi/code');
const {
  experiment,
  test,
  beforeEach,
  afterEach
} = exports.lab = require('@hapi/lab').script();
const sinon = require('sinon');

const uuid = require('uuid/v4');

const sandbox = sinon.createSandbox();

const services = require('../../../../../src/internal/lib/connectors/services');
const controller = require('../../../../../src/internal/modules/charge-information/controllers/charge-information-workflow');

const createRequest = () => ({
  params: {
    licenceId: 'test-licence-id',
    chargeVersionWorkflowId: 'test-charge-version-workflow-id'
  },
  view: {
    foo: 'bar',
    csrfToken: uuid()
  },
  query: {},
  pre: {
    chargeInformationWorkflows: [],
    chargeInformationWorkflow: {
      licence: { foo: 'bar' },
      licenceHolderRole: { bar: 'baz' }
    }
  },
  yar: {
    get: sandbox.stub()
  }
});

experiment('internal/modules/charge-information/controller', () => {
  let request, h;

  beforeEach(async () => {
    h = {
      view: sandbox.stub(),
      postRedirectGet: sandbox.stub(),
      redirect: sandbox.stub()
    };

    sandbox.stub(services.water.chargeVersionWorkflows, 'postChargeVersionWorkflow').resolves();
    sandbox.stub(services.water.chargeVersionWorkflows, 'deleteChargeVersionWorkflow').resolves();
  });

  afterEach(async () => {
    sandbox.restore();
  });

  experiment('.getChargeInformationWorkflow', () => {
    beforeEach(async () => {
      request = createRequest();
      request.query = { isChargeable: true };
      await controller.getChargeInformationWorkflow(request, h);
    });

    test('uses the correct template', async () => {
      const [template] = h.view.lastCall.args;
      expect(template).to.equal('nunjucks/charge-information/workflow');
    });

    test('sets a back link', async () => {
      const { back } = h.view.lastCall.args[1];
      expect(back).to.equal('/manage');
    });

    test('has the page title', async () => {
      const { pageTitle } = h.view.lastCall.args[1];
      expect(pageTitle).to.equal('Charge information workflow');
    });

    test('has no caption', async () => {
      const { caption } = h.view.lastCall.args[1];
      expect(caption).to.equal(undefined);
    });

    test('passes through request.view', async () => {
      const { foo } = h.view.lastCall.args[1];
      expect(foo).to.equal(request.view.foo);
    });

    test('passes the isReviewer flag', async () => {
      const { isReviewer } = h.view.lastCall.args[1];
      expect(isReviewer).to.be.a.boolean();
    });
  });

  experiment('.getRemoveChargeInformationWorkflow', () => {
    beforeEach(async () => {
      request = createRequest();
      await controller.getRemoveChargeInformationWorkflow(request, h);
    });

    test('uses the correct template', async () => {
      const [template] = h.view.lastCall.args;
      expect(template).to.equal('nunjucks/charge-information/remove-workflow');
    });

    test('sets a back link', async () => {
      const { back } = h.view.lastCall.args[1];
      expect(back).to.equal('/charge-information-workflow');
    });

    test('has the page title', async () => {
      const { pageTitle } = h.view.lastCall.args[1];
      expect(pageTitle).to.equal('You\'re about to remove this licence from the workflow');
    });

    test('has no caption', async () => {
      const { caption } = h.view.lastCall.args[1];
      expect(caption).to.equal(undefined);
    });

    test('passes through request.view', async () => {
      const { foo } = h.view.lastCall.args[1];
      expect(foo).to.equal(request.view.foo);
    });

    test('passes through licence information from request.pre', async () => {
      const { licence } = h.view.lastCall.args[1];
      expect(licence).to.equal(request.pre.chargeInformationWorkflow.licence);
    });

    test('passes through licence holder role information from request.pre', async () => {
      const { licenceHolderRole } = h.view.lastCall.args[1];
      expect(licenceHolderRole).to.equal(request.pre.chargeInformationWorkflow.licenceHolderRole);
    });

    test('passes through the form object', async () => {
      const { form } = h.view.lastCall.args[1];
      expect(form).to.be.an.object();
    });
  });

  experiment('.postRemoveChargeInformationWorkflow', () => {
    beforeEach(async () => {
      request = createRequest();
      await controller.postRemoveChargeInformationWorkflow(request, h);
    });

    test('deletes the charge version workflow', async () => {
      const [workflowId] = services.water.chargeVersionWorkflows.deleteChargeVersionWorkflow.lastCall.args;
      expect(workflowId).to.equal('test-charge-version-workflow-id');
    });

    test('redirects back to the workflow page', async () => {
      const [redirectPath] = h.redirect.lastCall.args;
      expect(redirectPath).to.equal('/charge-information-workflow');
    });
  });
});
