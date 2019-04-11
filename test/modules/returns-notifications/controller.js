const moment = require('moment');
const { expect } = require('code');
const {
  beforeEach,
  afterEach,
  experiment,
  test
} = exports.lab = require('lab').script();

const sinon = require('sinon');
const sandbox = sinon.createSandbox();

const controller = require('../../../src/modules/returns-notifications/controller');
const notificationsConnector = require('../../../src/lib/connectors/water-service/returns-notifications');
var batchNotificationsConnector = require('../../../src/lib/connectors/water-service/batch-notifications');

const createLicence = (id, overrides = {}) => {
  return {
    licence_ref: `l${id}`,
    return_id: `r${id}`,
    dateRevoked: overrides.dateRevoked || null,
    dateExpired: overrides.dateExpired || null,
    dateLapsed: overrides.dateLapsed || null
  };
};

experiment('postPreviewRecipients', () => {
  let h;
  let request;

  beforeEach(async () => {
    h = { view: sandbox.spy() };

    request = {
      payload: {
        licenceNumbers: 'l1 l2 l3 l4 l5 l6',
        csrf_token: 'bfc56166-e983-4f01-90fe-f70c191017ca'
      },
      view: {},
      log: sandbox.spy(),
      auth: {
        credentials: {
          username: 'test-user@example.com'
        }
      }
    };

    sandbox.stub(notificationsConnector, 'previewPaperForms').resolves({
      error: null,
      data: [
        createLicence(1),
        createLicence(2, { dateRevoked: '20020202' }),
        createLicence(3, { dateExpired: '20030303' }),
        createLicence(4, { dateLapsed: '20040404' }),
        createLicence(5, { dateRevoked: '20050505', dateExpired: '20050505' })
      ]
    });
  });

  afterEach(async () => { sandbox.restore(); });

  experiment('when the form is not valid', () => {
    test('the form view is shown again', async () => {
      request.payload = { licenceNumbers: '' };
      await controller.postPreviewRecipients(request, h);
      const [viewName] = h.view.lastCall.args;
      expect(viewName).to.equal('water/returns-notifications/forms');
    });
  });

  experiment('when there is an error previewing the forms', () => {
    test('a boom error is thrown', async () => {
      notificationsConnector.previewPaperForms.resolves({
        error: {
          name: 'test-error',
          message: 'test-error-message'
        },
        data: null
      });

      const err = await expect(controller.postPreviewRecipients(request, h)).to.reject();
      expect(err.isBoom).to.be.true();
      expect(err.data).to.equal({ name: 'test-error', message: 'test-error-message' });
    });
  });

  experiment('when the data is valid', () => {
    test('the confirm view is rendered', async () => {
      await controller.postPreviewRecipients(request, h);
      const [viewName] = h.view.lastCall.args;
      expect(viewName).to.equal('water/returns-notifications/forms-confirm');
    });

    test('the found licences are added to the view', async () => {
      await controller.postPreviewRecipients(request, h);
      const [, context] = h.view.lastCall.args;
      expect(context.uniqueLicences[0].licence_ref).to.equal('l1');
      expect(context.uniqueLicences[1].licence_ref).to.equal('l2');
      expect(context.uniqueLicences[2].licence_ref).to.equal('l3');
      expect(context.uniqueLicences[3].licence_ref).to.equal('l4');
      expect(context.uniqueLicences[4].licence_ref).to.equal('l5');
    });

    test('licences that are not matched are added to the view', async () => {
      await controller.postPreviewRecipients(request, h);
      const [, context] = h.view.lastCall.args;
      expect(context.notMatched).to.equal(['l6']);
    });

    test('licence objects with end dates contain endedReasons', async () => {
      await controller.postPreviewRecipients(request, h);
      const [, context] = h.view.lastCall.args;
      const [l1, l2, l3, l4, l5] = context.uniqueLicences;
      expect(l1.endedReasons).to.equal('');
      expect(l2.endedReasons).to.equal('Revoked');
      expect(l3.endedReasons).to.equal('Expired');
      expect(l4.endedReasons).to.equal('Lapsed');
      expect(l5.endedReasons).to.equal('Revoked, Expired');
    });

    test('licence objects with future end dates do not have endedReasons', async () => {
      const futureDate = moment().add(1, 'year').format('YYYYMMDD');

      notificationsConnector.previewPaperForms.resolves({
        error: null,
        data: [
          createLicence(1, { dateRevoked: futureDate }),
          createLicence(2, { dateExpired: futureDate }),
          createLicence(3, { dateLapsed: futureDate })
        ]
      });

      await controller.postPreviewRecipients(request, h);
      const [, context] = h.view.lastCall.args;
      const [l1, l2, l3] = context.uniqueLicences;
      expect(l1.endedReasons).to.equal('');
      expect(l2.endedReasons).to.equal('');
      expect(l3.endedReasons).to.equal('');
    });
  });
});

experiment('getReturnsReminderStart', () => {
  let request;
  let h;

  beforeEach(async () => {
    request = {
      view: {}
    };

    h = {
      view: sandbox.spy()
    };

    await controller.getReturnsReminderStart(request, h);
  });

  test('the expected view template is used', async () => {
    const [templateName] = h.view.lastCall.args;
    expect(templateName).to.equal('nunjucks/returns-notifications/reminders.njk');
  });

  test('view context is assigned a form', async () => {
    const [, view] = h.view.lastCall.args;
    expect(view.form.action).to.equal('/admin/returns-notifications/reminders');
  });

  test('view context is assigned a back link path', async () => {
    const [, view] = h.view.lastCall.args;
    expect(view.back).to.equal('/admin/notifications');
  });
});

experiment('postReturnsReminderStart', () => {
  let request;
  let h;
  let username;

  beforeEach(async () => {
    username = 'test@example.com';
    h = {
      redirect: sandbox.spy()
    };

    request = {
      view: {
        csrfToken: 'test-csrf-token'
      },
      auth: {
        credentials: {
          username,
          scope: ['internal']
        }
      },
      payload: {
        excludeLicences: '123\n456'
      }
    };

    sandbox.stub(batchNotificationsConnector, 'prepareReturnsReminders').resolves({
      data: {
        eventId: 'test-event-id'
      }
    });
  });

  afterEach(async () => {
    sandbox.restore();
  });

  test('the username is used as the notification issuer', async () => {
    await controller.postReturnsReminderStart(request, h);
    const [issuer] = batchNotificationsConnector.prepareReturnsReminders.lastCall.args;
    expect(issuer).to.equal(username);
  });

  test('the excluded licences are passed as csv', async () => {
    await controller.postReturnsReminderStart(request, h);
    const [, excludeLicences] = batchNotificationsConnector.prepareReturnsReminders.lastCall.args;
<<<<<<< HEAD
    expect(excludeLicences).to.equal(['123', '456']);
=======
    expect(excludeLicences).to.equal('123,456');
>>>>>>> WATER-2087
  });

  test('the user is redirected to the event waiting page', async () => {
    await controller.postReturnsReminderStart(request, h);
    const [url] = h.redirect.lastCall.args;
    expect(url).to.equal('/admin/waiting/test-event-id');
  });
});
