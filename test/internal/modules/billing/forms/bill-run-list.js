const { expect } = require('@hapi/code');
const { experiment, test } = exports.lab = require('@hapi/lab').script();
const { viewBillRunListForm, viewBillRunListFormSchema } = require('internal/modules/billing/forms/bill-run-list');
const { findField, findButton } = require('../../../../lib/form-test');
// const Joi = require('@hapi/joi');

const createRequest = () => ({
  view: {
    csrfToken: 'token'
  }
});

experiment('billing/forms/bill-run-list form', () => {
  test('has CSRF token field', async () => {
    const form = viewBillRunListForm(createRequest());
    const csrf = findField(form, 'csrf_token');
    expect(csrf.value).to.equal('token');
  });

  test('has a create bill run button', async () => {
    const form = viewBillRunListForm(createRequest());
    const button = findButton(form);
    expect(button.options.label).to.equal('Create a bill run');
  });
});

experiment('billing/forms/bill-run-list schema', () => {
  experiment('csrf token', () => {
    test('validates for a uuid', async () => {
      const result = viewBillRunListFormSchema.csrf_token.validate('c5afe238-fb77-4131-be80-384aaf245842');
      expect(result.error).to.be.null();
    });

    test('fails for a string that is not a uuid', async () => {
      const result = viewBillRunListFormSchema.csrf_token.validate('renoster');
      expect(result.error).to.exist();
    });
  });
});
