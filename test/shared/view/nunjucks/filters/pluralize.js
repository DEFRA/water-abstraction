'use strict';

const { experiment, test } = exports.lab = require('lab').script();
const { expect } = require('code');

const {
  pluralize
} = require('../../../../../src/shared/view/nunjucks/filters/pluralize');

experiment('pluralize Nunjucks filter', () => {
  test('It should pluralize word if given boolean true as second argument', async () => {
    expect(pluralize('point', true)).to.equal('points');
  });

  test('It should not pluralize word if given boolean false as second argument', async () => {
    expect(pluralize('point', false)).to.equal('point');
  });

  test('It should pluralize word if given array with length != 1', async () => {
    expect(pluralize('condition', [])).to.equal('conditions');
    expect(pluralize('condition', ['foo', 'bar'])).to.equal('conditions');
  });

  test('It should not pluralize word if given array with length === 1', async () => {
    expect(pluralize('condition', ['foo'])).to.equal('condition');
  });

  test('It should pluralize word if given boolean true as second argument', async () => {
    expect(pluralize('point', true)).to.equal('points');
  });

  test('It should not pluralize word ending in y', async () => {
    expect(pluralize('daisy', true)).to.equal('daisies');
  });

  test('It should not pluralize mouse', async () => {
    expect(pluralize('mouse', true)).to.equal('mice');
  });
});
