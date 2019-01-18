const { find } = require('lodash');
const { expect } = require('code');
const { experiment, test } = exports.lab = require('lab').script();
const { sendRemindersForm } = require('../../../../src/modules/returns-notifications/forms/send-reminders');

const request = {
  view: {
    csrfToken: 'abc'
  }
};

experiment('sendRemindersForm', () => {
  const f = sendRemindersForm(request);

  test('it should have the CSRF token set from the request', async () => {
    const csrfField = find(f.fields, field => field.name === 'csrf_token');
    expect(csrfField.value).to.equal(request.view.csrfToken);
  });

  test('it should post to the correct URL', async () => {
    expect(f.action).to.equal('/admin/returns-notifications/final-reminder');
    expect(f.method).to.equal('POST');
  });

  test('it should have the correct button text', async () => {
    const button = find(f.fields, field => field.options.widget === 'button');
    expect(button.options.label).to.equal('Send reminders');
  });
});
