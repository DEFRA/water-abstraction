'use strict';

const agreementDescriptions = {
  S127: 'Two-part tariff (S127)',
  S130S: 'Canal and Rivers Trust, supported source (S130S)',
  S130U: 'Canal and Rivers Trust, unsupported source (S130U)'
};

const mapAgreement = agreement => ({
  ...agreement,
  description: agreementDescriptions[agreement.code]
});

const mapLicenceAgreementPurposeUse = licenceAgreementPurposeUse =>
  licenceAgreementPurposeUse.purposeUse.name;

const mapLicenceAgreementPurposeUses = licenceAgreementPurposeUses => {
  const purposeUseNames = licenceAgreementPurposeUses.map(mapLicenceAgreementPurposeUse);
  return purposeUseNames.join(', ');
};

exports.agreementDescriptions = agreementDescriptions;
exports.mapAgreement = mapAgreement;
exports.mapLicenceAgreementPurposeUses = mapLicenceAgreementPurposeUses;
