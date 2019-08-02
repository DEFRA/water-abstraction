const sinon = require('sinon');
const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const { experiment, test, afterEach, beforeEach, fail } = exports.lab = Lab.script();
const sandbox = sinon.createSandbox();

const controller = require('external/modules/returns/controllers/view');
const helpers = require('external/modules/returns/lib/helpers');

const request = {
  params: {
    documentId: 'test-document-id'
  },
  defra: {
    entityId: 'test-entity-id'
  }
};

const h = {
  view: sandbox.stub()
};

experiment('view controlller', async () => {
  beforeEach(() => {
    sandbox.stub(helpers, 'getReturnsViewData');
  });

  afterEach(async () => { sandbox.restore(); });

  experiment('getReturns', async () => {
    beforeEach(async () => {
      helpers.getReturnsViewData.returns({ test: 'data' });
      await controller.getReturns(request, h);
    });
    test('correct template is passed', async () => {
      const [template, view] = h.view.lastCall.args;
      expect(template).to.equal('nunjucks/returns/index.njk');
      expect(view).to.equal({ test: 'data' });
    });
  });

  experiment('getReturnsForLicence', async () => {
    test('correct template is passed', async () => {
      helpers.getReturnsViewData.returns({ document: { system_external_id: 'lic-1234' } });
      await controller.getReturnsForLicence(request, h);

      const [template, view] = h.view.lastCall.args;
      expect(template).to.equal('nunjucks/returns/licence.njk');
      expect(view).to.contain(['back', 'backText', 'document', 'pageTitle', 'paginationUrl']);
      expect(view.back).to.equal(`/licences/${request.params.documentId}`);
      expect(view.backText).to.equal(`Licence number ${view.document.system_external_id}`);
      expect(view.document).to.equal({ system_external_id: 'lic-1234' });
      expect(view.pageTitle).to.equal(`Returns for licence number ${view.document.system_external_id}`);
      expect(view.paginationUrl).to.equal(`/licences/${request.params.documentId}/returns`);
    });

    test('throws a Boom 404 error if the document is not found', async () => {
      const errorMessage = `Document ${request.params.documentId} not found - entity ${request.defra.entityId} may not have the correct roles`;
      helpers.getReturnsViewData.returns({});
      try {
        await controller.getReturnsForLicence(request, h);
        fail();
      } catch (err) {
        expect(err.isBoom).to.equal(true);
        expect(err.message).to.equal(errorMessage);
        expect(err.output.statusCode).to.equal(404);
      }
    });
  });
});
