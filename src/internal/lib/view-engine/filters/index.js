module.exports = {
  ...require('./abstraction-reform'),
  ...require('./most-significant-entity-role'),
  ...require('shared/view/nunjucks/filters/abstraction-period'),
  ...require('shared/view/nunjucks/filters/batch-badge'),
  ...require('shared/view/nunjucks/filters/charge-element-abstraction-period'),
  ...require('shared/view/nunjucks/filters/charge-version-badge'),
  ...require('shared/view/nunjucks/filters/charge'),
  ...require('shared/view/nunjucks/filters/date'),
  ...require('shared/view/nunjucks/filters/fixed'),
  ...require('shared/view/nunjucks/filters/flow-converter'),
  ...require('shared/view/nunjucks/filters/form'),
  ...require('shared/view/nunjucks/filters/gauging-station-value'),
  ...require('shared/view/nunjucks/filters/markdown'),
  ...require('shared/view/nunjucks/filters/merge'),
  ...require('shared/view/nunjucks/filters/number'),
  ...require('shared/view/nunjucks/filters/is-object'),
  ...require('shared/view/nunjucks/filters/pluralize'),
  ...require('shared/view/nunjucks/filters/query-string'),
  ...require('shared/view/nunjucks/filters/return-badge'),
  ...require('shared/view/nunjucks/filters/return-period'),
  ...require('shared/view/nunjucks/filters/sentence-case'),
  ...require('shared/view/nunjucks/filters/slice'),
  ...require('shared/view/nunjucks/filters/sort-new-direction'),
  ...require('shared/view/nunjucks/filters/sort-query'),
  ...require('shared/view/nunjucks/filters/title-case'),
  ...require('shared/view/nunjucks/filters/unit-conversion'),
  ...require('shared/view/nunjucks/filters/units')
};
