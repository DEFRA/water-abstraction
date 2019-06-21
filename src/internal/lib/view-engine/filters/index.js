module.exports = {
  ...require('./abstraction-reform'),
  ...require('./most-significant-entity-role'),

  ...require('../../../../shared/view/nunjucks/filters/abstraction-period'),
  ...require('../../../../shared/view/nunjucks/filters/date'),
  ...require('../../../../shared/view/nunjucks/filters/fixed'),
  ...require('../../../../shared/view/nunjucks/filters/form'),
  ...require('../../../../shared/view/nunjucks/filters/markdown'),
  ...require('../../../../shared/view/nunjucks/filters/merge'),
  ...require('../../../../shared/view/nunjucks/filters/number'),
  ...require('../../../../shared/view/nunjucks/filters/is-object'),
  ...require('../../../../shared/view/nunjucks/filters/pluralize'),
  ...require('../../../../shared/view/nunjucks/filters/query-string'),
  ...require('../../../../shared/view/nunjucks/filters/return-badge'),
  ...require('../../../../shared/view/nunjucks/filters/slice'),
  ...require('../../../../shared/view/nunjucks/filters/sort-new-direction'),
  ...require('../../../../shared/view/nunjucks/filters/sort-query'),
  ...require('../../../../shared/view/nunjucks/filters/title-case'),
  ...require('../../../../shared/view/nunjucks/filters/unit-conversion'),
  ...require('../../../../shared/view/nunjucks/filters/units')
};
