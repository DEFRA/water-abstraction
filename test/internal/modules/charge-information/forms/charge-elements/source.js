'use strict';

const { expect } = require('@hapi/code');
const { experiment, test, beforeEach } = exports.lab = require('@hapi/lab').script();

const { form, schema } = require('../../../../../../src/internal/modules/charge-information/forms/charge-element/source');
const { findField, findButton } = require('../../../../../lib/form-test');
const { SOURCES } = require('../../../../../../src/internal/modules/charge-information/lib/charge-elements/constants');
const { capitalize } = require('lodash');
const createRequest = () => ({
  view: {
    csrfToken: 'token'
  },
  params: {
    licenceId: 'test-licence-id'
  }
});

const sessionData = { purposeUse: { id: 'test-purpose-use-id' } };

experiment('internal/modules/charge-information/forms/charge-element/source', () => {
  let sourceForm;

  beforeEach(async () => {
    sourceForm = form(createRequest(), sessionData);
  });

  experiment('form', () => {
    test('sets the form method to POST', async () => {
      expect(sourceForm.method).to.equal('POST');
    });

    test('has CSRF token field', async () => {
      const csrf = findField(sourceForm, 'csrf_token');
      expect(csrf.value).to.equal('token');
    });

    test('has a submit button', async () => {
      const button = findButton(sourceForm);
      expect(button.options.label).to.equal('Continue');
    });

    test('has a 4 choices Unsupported, Suppported, Tidal, Kielder', async () => {
      const radio = findField(sourceForm, 'source');
      const sourceValues = Object.values(radio.options.choices).map(choice => choice.value);
      const sourceLabels = Object.values(radio.options.choices).map(choice => choice.label);
      expect(sourceValues).to.equal(SOURCES);
      expect(sourceLabels).to.equal(SOURCES.map(source => capitalize(source)));
    });
  });

  experiment('schema', () => {
    experiment('csrf token', () => {
      test('validates for a uuid', async () => {
        const result = schema(createRequest()).csrf_token.validate('c5afe238-fb77-4131-be80-384aaf245842');
        expect(result.error).to.be.null();
      });

      test('fails for a string that is not a uuid', async () => {
        const result = schema(createRequest()).csrf_token.validate('sciccors');
        expect(result.error).to.exist();
      });
    });

    experiment('season', () => {
      SOURCES.forEach(option => {
        test(`accepts the valid source ${option}`, async () => {
          const result = schema().source.validate(option);
          expect(result.error).to.not.exist();
        });
      });

      test('can not be any other string', async () => {
        const result = schema().source.validate('test');
        expect(result.error).to.exist();
      });
    });
  });
});
