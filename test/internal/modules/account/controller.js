const { expect } = require('@hapi/code');
const {
  experiment,
  test,
  beforeEach,
  afterEach
} = exports.lab = require('@hapi/lab').script();
const controller = require('internal/modules/account/controller');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const helpers = require('internal/modules/account/helpers');

const userData = {
  error: null,
  data: {
    user_id: 100,
    user_name: 'test@example.gov.uk',
    groups: ['basic']
  }
};

experiment('account/controller', () => {
  let h;
  let request;

  beforeEach(async () => {
    h = {
      view: sandbox.spy(),
      redirect: sandbox.spy()
    };

    request = {
      view: {},
      payload: {
        csrf_token: '00000000-0000-0000-0000-000000000000'
      },
      params: {},
      defra: {},
      yar: {
        _store: {}
      }
    };

    sandbox.stub(helpers, 'getUserByEmail');
    sandbox.stub(helpers, 'getUserById').resolves(userData);
    sandbox.stub(helpers, 'getInternalUser').resolves();
  });

  afterEach(async () => sandbox.restore());

  experiment('.getCreateAccount', async () => {
    test('uses the expected template', async () => {
      await controller.getCreateAccount(request, h);
      const [template] = h.view.lastCall.args;
      expect(template).to.equal('nunjucks/account/create-user.njk');
    });

    test('adds a form to the view context', async () => {
      await controller.getCreateAccount(request, h);
      const [, view] = h.view.lastCall.args;
      expect(view.form).to.be.an.object();
    });
  });

  experiment('.postCreateAccount', () => {
    experiment('when the email address is invalid', () => {
      beforeEach(async () => {
        request.payload.email = 'not@valid.email.com';
        await controller.postCreateAccount(request, h);
      });

      test('the create user template is replayed', async () => {
        const [template] = h.view.lastCall.args;
        expect(template).to.equal('nunjucks/account/create-user.njk');
      });

      test('the form object contains errors', async () => {
        const [, view] = h.view.lastCall.args;
        const error = view.form.errors.find(e => e.name === 'email');
        expect(error).to.be.an.object();
      });
    });

    experiment('when the email address is already in use', () => {
      beforeEach(async () => {
        request.payload.email = 'existing@email.com';
        helpers.getUserByEmail.resolves(userData);
        await controller.postCreateAccount(request, h);
      });

      test('gets the user using the email param', async () => {
        const [email] = helpers.getUserByEmail.lastCall.args;
        expect(email).to.equal('existing@email.com');
      });

      test('email already in use error is applied', async () => {
        const [, view] = h.view.lastCall.args;
        const error = view.form.errors.find(e => e.message === 'Email specified is already in use');
        expect(error).to.be.an.object();
      });
    });

    experiment('when the email address is valid', () => {
      beforeEach(async () => {
        request.yar.set = sandbox.spy();
        await controller.postCreateAccount(request, h);
      });

      test('redirects to the expected url', async () => {
        const [url] = h.redirect.lastCall.args;
        expect(url).to.equal(`/account/create-user/set-permissions`);
      });
    });
  });

  experiment('.getSetPermissions', () => {
    beforeEach(async () => {
      request.params.userId = 100;
      await controller.getSetPermissions(request, h);
    });

    test('renders the expected template', async () => {
      const [template] = h.view.lastCall.args;
      expect(template).to.equal('nunjucks/account/set-permissions.njk');
    });
  });

  experiment('.postSetPermissions', () => {
    experiment('when the permisson is invalid', () => {
      beforeEach(async () => {
        request.defra.userId = 100;
        request.payload.permission = '';
        await controller.postSetPermissions(request, h);
      });

      test('the set permissions template is replayed', async () => {
        const [template] = h.view.lastCall.args;
        expect(template).to.equal('nunjucks/account/set-permissions.njk');
      });

      test('the form object contains errors', async () => {
        const [, view] = h.view.lastCall.args;
        const error = view.form.errors.find(e => e.name === 'permission');
        expect(error).to.be.an.object();
      });
    });
  });

  experiment('.getCreateAccountSuccess', () => {
    beforeEach(async () => {
      request.params.userId = 100;
      request.yar._store = { newInternalUserAccountEmail: 'test@example.gov.uk' };
      helpers.getUserById.resolves(userData.data);
      await controller.getCreateAccountSuccess(request, h);
    });

    test('gets the user using the userId param', async () => {
      const [userId] = helpers.getUserById.lastCall.args;
      expect(userId).to.equal(100);
    });

    test('renders the expected template', async () => {
      const [template] = h.view.lastCall.args;
      expect(template).to.equal('nunjucks/account/create-user-success.njk');
    });

    test('adds the user id to the view context', async () => {
      const [, view] = h.view.lastCall.args;
      expect(view.userId).to.equal(100);
    });

    test('adds the email address to the view context', async () => {
      const [, view] = h.view.lastCall.args;
      expect(view.email).to.equal('test@example.gov.uk');
    });
  });
});
