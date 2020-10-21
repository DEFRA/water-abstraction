const {
  getDefaultView,
  getLicencePageUrl,
  findInvoiceAccountAddress
} = require('../lib/helpers');
const forms = require('shared/lib/forms');
const services = require('../../../lib/connectors/services');
const chargeInformationValidator = require('../lib/charge-information-validator');
const { chargeVersionWorkflowReviewer } = require('internal/lib/constants').scope;
const { reviewForm, reviewFormSchema } = require('../forms/review');
const { hasScope } = require('internal/lib/permissions');
const moment = require('moment');

const formatDateForPageTitle = startDate =>
  moment(startDate).format('D MMMM YYYY');

const getViewChargeInformation = async (request, h) => {
  const { chargeVersion, licence } = request.pre;
  const backLink = await getLicencePageUrl(licence);

  return h.view('nunjucks/charge-information/view', {
    ...getDefaultView(request, backLink),
    pageTitle: `Charge information valid from ${formatDateForPageTitle(chargeVersion.dateRange.startDate)}`,
    chargeVersion,
    isEditable: false,
    // @TODO: use request.pre.isChargeable to determine this
    // after the chargeVersion import ticket has been completed
    isChargeable: true
  });
};

const getReviewChargeInformation = async (request, h) => {
  const { draftChargeInformation, licence, isChargeable } = request.pre;
  const backLink = await getLicencePageUrl(licence);
  const isApprover = hasScope(request, chargeVersionWorkflowReviewer);
  const invoiceAccountAddress = findInvoiceAccountAddress(request);

  return h.view('nunjucks/charge-information/view', {
    ...getDefaultView(request, backLink),
    pageTitle: `Check charge information`,
    chargeVersion: chargeInformationValidator.addValidation(draftChargeInformation),
    invoiceAccountAddress,
    licenceId: licence.id,
    isEditable: false,
    isApprover,
    isChargeable,
    reviewForm: reviewForm(request)
  });
};

const postReviewChargeInformation = async (request, h) => {
  const { draftChargeInformation, licence, isChargeable } = request.pre;
  const backLink = await getLicencePageUrl(licence);
  const isApprover = hasScope(request, chargeVersionWorkflowReviewer);
  const invoiceAccountAddress = findInvoiceAccountAddress(request);
  console.log(request.params);
  const form = forms.handleRequest(
    reviewForm(request),
    request,
    reviewFormSchema()
  );
  if (!form.isValid) {
    return h.view('nunjucks/charge-information/view', {
      ...getDefaultView(request, backLink),
      pageTitle: `Check charge information`,
      chargeVersion: chargeInformationValidator.addValidation(draftChargeInformation),
      invoiceAccountAddress,
      licenceId: licence.id,
      isEditable: false,
      isApprover,
      isChargeable,
      reviewForm: form
    });
  } else {
    // TODO make API call to the service
    await services.water.chargeVersionWorkflows.patchChargeVersionWorkflow(request.payload.reviewOutcome, request.payload.reviewerComments, draftChargeInformation, request.params.chargeVersionWorkflowId);
    // send user back to the charge info tab
    return h.redirect(`/charge-information-workflows`);
  }
};

exports.getViewChargeInformation = getViewChargeInformation;
exports.getReviewChargeInformation = getReviewChargeInformation;
exports.postReviewChargeInformation = postReviewChargeInformation;
