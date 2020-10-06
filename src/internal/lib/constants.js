'use strict';

const SCOPE_RETURNS = 'returns';
const SCOPE_BULK_RETURNS_NOTIFICATIONS = 'bulk_return_notifications';
const SCOPE_ABSTRACTION_REFORM_USER = 'ar_user';
const SCOPE_ABSTRACTION_REFORM_APPROVER = 'ar_approver';
const SCOPE_HOF_NOTIFICATIONS = 'hof_notifications';
const SCOPE_RENEWAL_NOTIFICATIONS = 'renewal_notifications';
const SCOPE_MANAGE_ACCOUNTS = 'manage_accounts';
const SCOPE_CHARGING = 'charging';
const SCOPE_BILLING = 'billing';
const SCOPE_DELETE_AGREEMENTS = 'delete_agreements';

module.exports = {
  scope: {
    hasManageTab: [
      SCOPE_RETURNS,
      SCOPE_BULK_RETURNS_NOTIFICATIONS,
      SCOPE_ABSTRACTION_REFORM_APPROVER,
      SCOPE_HOF_NOTIFICATIONS,
      SCOPE_RENEWAL_NOTIFICATIONS,
      SCOPE_MANAGE_ACCOUNTS,
      SCOPE_BILLING
    ],
    abstractionReformUser: SCOPE_ABSTRACTION_REFORM_USER,
    abstractionReformApprover: SCOPE_ABSTRACTION_REFORM_APPROVER,
    returns: SCOPE_RETURNS,
    bulkReturnNotifications: SCOPE_BULK_RETURNS_NOTIFICATIONS,
    hofNotifications: SCOPE_HOF_NOTIFICATIONS,
    renewalNotifications: SCOPE_RENEWAL_NOTIFICATIONS,
    allNotifications: [
      SCOPE_RETURNS,
      SCOPE_HOF_NOTIFICATIONS,
      SCOPE_RENEWAL_NOTIFICATIONS,
      SCOPE_BULK_RETURNS_NOTIFICATIONS
    ],
    manageAccounts: SCOPE_MANAGE_ACCOUNTS,
    charging: SCOPE_CHARGING,
    billing: SCOPE_BILLING,
    deleteAgreements: SCOPE_DELETE_AGREEMENTS
  }
};
