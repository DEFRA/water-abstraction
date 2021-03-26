'use-strict';

const forms = require('../forms/charge-element/index');
const routing = require('../lib/routing');
const { getDefaultView, getPostedForm, applyFormResponse } = require('../lib/helpers');
const { ROUTING_CONFIG,
  CHARGE_ELEMENT_FIRST_STEP,
  CHARGE_ELEMENT_LAST_STEP } = require('../lib/charge-elements/constants');
const actions = require('../lib/actions');

const getBackLink = request => {
  const { step, licenceId, elementId } = request.params;
  const { chargeVersionWorkflowId } = request.query;
  if (request.query.returnToCheckData === 1) {
    return routing.getCheckData(licenceId);
  }
  return step === CHARGE_ELEMENT_FIRST_STEP
    ? routing.getUseAbstractionData(licenceId, { chargeVersionWorkflowId })
    : routing.getChargeElementStep(licenceId, elementId, ROUTING_CONFIG[step].back, { chargeVersionWorkflowId });
};

const getRedirectPath = request => {
  const { step, licenceId, elementId } = request.params;
  const { chargeVersionWorkflowId, returnToCheckData } = request.query;
  if (returnToCheckData === 1 || step === CHARGE_ELEMENT_LAST_STEP) {
    return routing.getCheckData(licenceId, { chargeVersionWorkflowId });
  }
  return routing.getChargeElementStep(licenceId, elementId, ROUTING_CONFIG[step].nextStep, { chargeVersionWorkflowId });
};

const getChargeElementStep = async (request, h) => {
  const { step } = request.params;
  return h.view('nunjucks/form', {
    ...getDefaultView(request, getBackLink(request), forms[step]),
    pageTitle: ROUTING_CONFIG[step].pageTitle
  });
};

const postChargeElementStep = async (request, h) => {
  const { step, licenceId, elementId } = request.params;
  const form = getPostedForm(request, forms[step]);

  if (form.isValid) {
    await applyFormResponse(request, form, actions.setChargeElementData);
    return h.redirect(getRedirectPath(request));
  }

  return h.postRedirectGet(form, routing.getChargeElementStep(licenceId, elementId, step, request.query));
};

exports.getChargeElementStep = getChargeElementStep;
exports.postChargeElementStep = postChargeElementStep;
