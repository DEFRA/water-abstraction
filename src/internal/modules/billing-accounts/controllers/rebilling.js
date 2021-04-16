'use strict';

const titleCase = require('title-case');
const { getValues } = require('shared/lib/forms');
const { handleFormRequest } = require('shared/lib/form-handler');

const { getCurrentAddress } = require('../lib/helpers');

const store = require('../lib/rebilling/store');
const actions = require('../lib/rebilling/actions');

const forms = {
  dateFrom: require('../forms/rebilling-date-from'),
  confirm: require('shared/lib/forms/confirm-form'),
  selectBills: require('../forms/rebilling-select-bills')
};

/**
 * Enter the start date for re-billing
 */
const getRebillingStartDate = async (request, h) => h.view('nunjucks/form', {
  ...request.view,
  back: `/billing-accounts/${request.params.billingAccountId}`,
  form: handleFormRequest(request, forms.dateFrom),
  pageTitle: 'What date do you need to reissue a bill from?'
});

/**
 * Post handler for start date form
 */
const postRebillingStartDate = async (request, h) => {
  const form = handleFormRequest(request, forms.dateFrom);

  if (!form.isValid) {
    return h.postRedirectGet(form);
  }

  // Update session
  const { fromDate } = getValues(form);
  store.dispatch(request, actions.setFromDate(fromDate, request.pre.rebillableBills));

  // Redirect to check answers
  const { billingAccountId } = request.params;
  return h.redirect(`/billing-accounts/${billingAccountId}/rebilling/check-answers`);
};

const getCheckAnswersPageTitle = request => {
  const { billingAccount, rebillingState: { selectedBillIds } } = request.pre;
  const pageTitlePrefix = selectedBillIds.length === 1
    ? `There is 1 bill`
    : `There are ${selectedBillIds.length} bills`;

  return `${pageTitlePrefix} available for reissue to ${titleCase(billingAccount.company.name)}`;
};

const getSelectedBills = request => {
  const { rebillingState: { selectedBillIds } } = request.pre;
  return request.pre.rebillableBills
    .filter(bill => selectedBillIds.includes(bill.id));
};

/**
 * Check answers page
 */
const getCheckAnswers = (request, h) => {
  const { billingAccount, rebillingState: { fromDate } } = request.pre;
  const { billingAccountId } = request.params;

  return h.view('nunjucks/billing-accounts/rebilling-check-answers', {
    ...request.view,
    back: `/billing-accounts/${request.params.billingAccountId}/rebilling`,
    form: forms.confirm.form(request),
    fromDate,
    bills: getSelectedBills(request),
    pageTitle: getCheckAnswersPageTitle(request),
    caption: `Billing account ${billingAccount.accountNumber}`,
    links: {
      changeDate: `/billing-accounts/${billingAccountId}/rebilling`,
      selectBills: `/billing-accounts/${billingAccountId}/rebilling/select-bills`
    },
    currentAddress: getCurrentAddress(billingAccount),
    billingAccount
  });
};

/**
 * @todo post to water service
 */
const postCheckAnswers = (request, h) => {

};

const getSelectBills = async (request, h) => h.view('nunjucks/form', {
  ...request.view,
  back: `/billing-accounts/${request.params.billingAccountId}/check-answers`,
  form: handleFormRequest(request, forms.selectBills),
  pageTitle: 'Select the bills you need to reissue'
});

const postSelectBills = (request, h) => {
  const form = handleFormRequest(request, forms.selectBills);

  if (!form.isValid) {
    return h.postRedirectGet(form);
  }

  // Update session
  const { selectedBillIds } = getValues(form);
  store.dispatch(request, actions.setSelectedBills(selectedBillIds));

  // Redirect to check answers
  const { billingAccountId } = request.params;
  return h.redirect(`/billing-accounts/${billingAccountId}/rebilling/check-answers`);
};

exports.getRebillingStartDate = getRebillingStartDate;
exports.postRebillingStartDate = postRebillingStartDate;

exports.getCheckAnswers = getCheckAnswers;
exports.postCheckAnswers = postCheckAnswers;

exports.getSelectBills = getSelectBills;
exports.postSelectBills = postSelectBills;
