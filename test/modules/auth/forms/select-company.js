const { find } = require('lodash');
const { expect } = require('code');
const { experiment, test, beforeEach } = exports.lab = require('lab').script();
const { selectCompanyForm } = require('../../../../src/modules/auth/forms/select-company');

const getRequest = () => {
  return {
    view: {
      csrfToken: 'foo'
    }
  };
};
const getData = () => {
  return {
    companies: [{
      name: 'baz'
    }, {
      name: 'bar'
    }]
  };
};

experiment('selectCompany form', () => {
  let request, data;

  beforeEach(async () => {
    request = getRequest();
    data = getData();
  });

  test('it should include a CSRF token', async () => {
    const form = selectCompanyForm(request, data);
    const field = find(form.fields, { name: 'csrf_token' });
    expect(field.value).to.equal(request.view.csrfToken);
  });

  test('it should include radio buttons for companies', async () => {
    const form = selectCompanyForm(request, data);
    const field = find(form.fields, { name: 'company' });
    expect(field.options.choices).to.have.length(2);
    expect(field.options.choices[0].label).to.equal('baz');
    expect(field.options.choices[0].value).to.equal(0);
    expect(field.options.choices[1].label).to.equal('bar');
    expect(field.options.choices[1].value).to.equal(1);
  });
});
