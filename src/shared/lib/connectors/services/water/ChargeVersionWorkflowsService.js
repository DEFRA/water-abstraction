const ServiceClient = require('../ServiceClient');

class ChargeVersionWorkflowsService extends ServiceClient {
  /**
   * Gets charge version workflows for given licence id
   * @param {String} licenceId
   */
  getChargeVersionWorkflow (workflowId) {
    const url = this.joinUrl('charge-version-workflows', workflowId);
    return this.serviceRequest.get(url);
  }

  /**
 * Gets charge version workflows for given licence id
 * @param {String} licenceId
 */
  getChargeVersionWorkflowsForLicence (licenceId) {
    const url = this.joinUrl('charge-version-workflows');
    return this.serviceRequest.get(url, {
      qs: { licenceId }
    });
  }

  /**
   * Posts draft charge info to water service to store
   * @param {Object} draftChargeInformation
   */
  postChargeVersionWorkflow (draftChargeInformation) {
    const url = this.joinUrl('charge-version-workflows');
    return this.serviceRequest.post(url, {
      body: draftChargeInformation
    });
  }

  /**
   * Send a PATCH request to the service relating to a charge version workflow
   */
  patchChargeVersionWorkflow (status, approverComments, chargeVersion, workflowId) {
    console.log(status);
    console.log(chargeVersion);
    const url = this.joinUrl('charge-version-workflows', workflowId);
    return this.serviceRequest.patch(url, {
      body: {
        status,
        approverComments,
        chargeVersion
      }
    });
  }

  /**
   * Call to delete the charge version work flow for id provided
   * @param {String} chargeVersionWorkflowId guid
   */
  deleteChargeVersionWorkflow (chargeVersionWorkflowId) {
    const url = this.joinUrl('charge-version-workflows', chargeVersionWorkflowId);
    return this.serviceRequest.delete(url);
  }
}

module.exports = ChargeVersionWorkflowsService;
