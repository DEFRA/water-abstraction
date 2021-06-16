const linkageForms = require('./forms');
const { handleFormRequest } = require('shared/lib/form-handler');
const session = require('./lib/session');
const { redirectTo } = require('./lib/helpers');

const getNewFlow = (request, h) => h.redirect(`${request.path}/../threshold-and-unit`);

const getThresholdAndUnit = (request, h) => {
  const pageTitle = 'What is the licence hands-off flow or level threshold?';

  return h.view('nunjucks/form', {
    ...request.view,
    caption: '',
    pageTitle,
    back: '',
    form: handleFormRequest(request, linkageForms.thresholdAndUnit)
  });
};

const postThresholdAndUnit = (request, h) => {
  const form = handleFormRequest(request, linkageForms.thresholdAndUnit);

  if (!form.isValid) {
    return h.postRedirectGet(form);
  }

  session.merge(request, {
    threshold: form.fields.find(field => field.name === 'threshold'),
    unit: form.fields.find(field => field.name === 'unit')
  });

  return redirectTo(request, h, '/alert-type');
};

const getAlertType = (request, h) => {
  const pageTitle = 'Does the licence holder need to stop or reduce at this threshold?';

  return h.view('nunjucks/form', {
    ...request.view,
    caption: '',
    pageTitle,
    back: '',
    form: handleFormRequest(request, linkageForms.alertType)
  });
};

const postAlertType = (request, h) => {
  const form = handleFormRequest(request, linkageForms.alertType);

  if (!form.isValid) {
    return h.postRedirectGet(form);
  }

  session.merge(request, {
    alertType: form.fields.find(field => field.name === 'alertType')
  });

  return redirectTo(request, h, '/licence-number');
};

const getLicenceNumber = (request, h) => {
  const pageTitle = 'Enter the licence number this threshold applies to';

  return h.view('nunjucks/form', {
    ...request.view,
    caption: 'You need to tag and add other licences with this threshold individually',
    pageTitle,
    back: '',
    form: handleFormRequest(request, linkageForms.whichLicence)
  });
};

const postLicenceNumber = (request, h) => {
  const form = handleFormRequest(request, linkageForms.whichLicence);

  if (!form.isValid) {
    return h.postRedirectGet(form);
  }

  session.merge(request, {
    licenceNumber: form.fields.find(field => field.name === 'licenceNumber')
  });

  return redirectTo(request, h, '/condition');
};

const getCondition = (request, h) => {
  const pageTitle = 'Select the full condition for licence';

  return h.view('nunjucks/form', {
    ...request.view,
    caption: 'This is the licence condition recorded in NALD and stated on the licence.',
    pageTitle,
    back: '',
    form: handleFormRequest(request, linkageForms.whichCondition)
  });
};

const postCondition = (request, h) => {
  const form = handleFormRequest(request, linkageForms.whichCondition);

  if (!form.isValid) {
    return h.postRedirectGet(form);
  }

  const condition = form.fields.find(field => field.name === 'condition');
  session.merge(request, {
    condition
  });

  return redirectTo(request, h, condition.value ? `/check` : '/abstraction-period');
};

const getManuallyDefinedAbstractionPeriod = (request, h) => {
  const pageTitle = 'Enter an abstraction period for licence';

  return h.view('nunjucks/form', {
    ...request.view,
    caption: '',
    pageTitle,
    back: '',
    form: handleFormRequest(request, linkageForms.manuallyDefinedAbstractionPeriod)
  });
};

const postManuallyDefinedAbstractionPeriod = (request, h) => {
  const form = handleFormRequest(request, linkageForms.manuallyDefinedAbstractionPeriod);

  if (!form.isValid) {
    return h.postRedirectGet(form);
  }

  session.merge(request, {
    periodStartDay: form.fields.find(field => field.name === 'periodStartDay'),
    periodStartMonth: form.fields.find(field => field.name === 'periodStartMonth'),
    periodEndDay: form.fields.find(field => field.name === 'periodEndDay'),
    periodEndMonth: form.fields.find(field => field.name === 'periodEndMonth')
  });

  return redirectTo(request, h, '/check');
};

const getCheckYourAnswers = (request, h) => {
  const pageTitle = 'Check the restriction details';

  return h.view('nunjucks/gauging-stations/new-tag-check', {
    ...request.view,
    caption: '',
    pageTitle,
    back: '',
    form: handleFormRequest(request, linkageForms.checkYourAnswers),
    sessionData: session.get(request)
  });
};

const postCheckYourAnswers = (request, h) => {
  const form = handleFormRequest(request, linkageForms.checkYourAnswers);

  if (!form.isValid) {
    return h.postRedirectGet(form);
  }

  // eslint-disable-next-line no-useless-escape
  return h.redirect(request.path.replace(/\/[^\/]*$/, '/complete'));
};

const getFlowComplete = (request, h) => {
  session.clear(request);
  return h.view('nunjucks/gauging-stations/linking-complete');
};

exports.getNewFlow = getNewFlow;
exports.getThresholdAndUnit = getThresholdAndUnit;
exports.postThresholdAndUnit = postThresholdAndUnit;
exports.getAlertType = getAlertType;
exports.postAlertType = postAlertType;
exports.getLicenceNumber = getLicenceNumber;
exports.postLicenceNumber = postLicenceNumber;
exports.getCondition = getCondition;
exports.postCondition = postCondition;
exports.getManuallyDefinedAbstractionPeriod = getManuallyDefinedAbstractionPeriod;
exports.postManuallyDefinedAbstractionPeriod = postManuallyDefinedAbstractionPeriod;
exports.getCheckYourAnswers = getCheckYourAnswers;
exports.postCheckYourAnswers = postCheckYourAnswers;
exports.getFlowComplete = getFlowComplete;
