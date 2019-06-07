module.exports = {
  ...require('../../../../shared/view/nunjucks/filters/abstraction-period'),
  ...require('../../../../shared/view/nunjucks/filters/date'),
  ...require('../../../../shared/view/nunjucks/filters/fixed'),
  ...require('../../../../shared/view/nunjucks/filters/form'),
  ...require('../../../../shared/view/nunjucks/filters/markdown'),
  ...require('./merge'),
  ...require('./most-significant-entity-role'),
  ...require('./number'),
  ...require('./pluralize'),
  ...require('./query-string'),
  ...require('./slice'),
  ...require('./sort-new-direction'),
  ...require('./sort-query'),
  ...require('./title-case'),
  ...require('./unit-conversion'),
  ...require('./units')
};
