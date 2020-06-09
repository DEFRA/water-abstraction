const mappers = require('./lib/mappers');

const forms = require('./forms');
const actions = require('./lib/actions');
const routing = require('./lib/routing');
const { createPostHandler, getDefaultView } = require('./lib/helpers');

/**
 * Displays a task-list page to guide the user through
 * creation of a new charge version
 */
const getTaskList = async (request, h) => {
  const { licence, draftChargeInformation } = request.pre;

  // Map to a task-list data structure
  const taskList = mappers.mapDataToTaskList(draftChargeInformation, licence);

  // Output to view
  return h.view('nunjucks/charge-information/task-list.njk', {
    back: '/todo', // @todo
    pageTitle: 'Set up charge information',
    ...request.view,
    taskList
  });
};

/**
 * Select the reason for the creation of a new charge version
 */
const getReason = async (request, h) => {
  return h.view('nunjucks/charge-information/form.njk', {
    ...getDefaultView(request, forms.reason),
    pageTitle: 'Select reason for new charge information'
  });
};

const postReason = createPostHandler(
  forms.reason,
  actions.setChangeReasonAction,
  request => routing.getTasklist(request.pre.licence)
);

/**
 * Select the start date for the new charge version
 */
const getStartDate = async (request, h) => {
  return h.view('nunjucks/charge-information/form.njk', {
    ...getDefaultView(request, forms.startDate),
    pageTitle: 'Set charge start date'
  });
};

const postStartDate = createPostHandler(
  forms.startDate,
  actions.setStartDate,
  request => routing.getTasklist(request.pre.licence)
);

exports.getTasklist = getTaskList;
exports.getReason = getReason;
exports.postReason = postReason;
exports.getStartDate = getStartDate;
exports.postStartDate = postStartDate;
