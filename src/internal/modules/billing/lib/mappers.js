const { omit, flatMap, mapValues } = require('lodash');
const groupArray = require('group-array');
const sentenceCase = require('sentence-case');
const helpers = require('@envage/water-abstraction-helpers');

/**
 * Creates a link to the batch specified if the batch
 * is in a suitable status
 * @param {Object} batch
 * @return {String}
 */
const mapBatchLink = batch => {
  const links = {
    processing: `/billing/batch/${batch.id}/summary`,
    ready: `/billing/batch/${batch.id}/summary`,
    review: `/billing/batch/${batch.id}/two-part-tariff-review`
  };
  return links[batch.status];
};

/**
 * Maps a batch for the batch list view, adding the badge, batch type and
 * bill count
 * @param {Object} batch
 * @return {Object}
 */
const mapBatchListRow = batch => ({
  ...batch,
  batchType: mapBatchType(batch.type),
  billCount: batch.totals ? batch.totals.invoiceCount + batch.totals.creditNoteCount : null,
  link: mapBatchLink(batch)
});

const mapTransaction = transaction => ({
  ...omit(transaction, ['chargeElement']),
  isEdited: transaction.calculatedVolume !== transaction.volume
});

const mapChargeElementTransactions = group => {
  const transactions = group.map(row => row.transaction);
  const initialValue = {
    debits: 0,
    credits: 0,
    netTotal: 0
  };

  const totals = transactions.reduce((acc, row) => ({
    debits: acc.debits + (row.isCredit ? 0 : row.value),
    credits: acc.credits + (row.isCredit ? row.value : 0),
    netTotal: acc.netTotal + row.value
  }), initialValue);

  return {
    transactions: transactions.map(mapTransaction),
    totals,
    chargeElement: transactions[0].chargeElement
  };
};

const mapLicence = (chargeElements, licenceNumber) => {
  const arr = Object.values(chargeElements);
  return {
    link: arr[0][0].link,
    chargeElements: arr.map(mapChargeElementTransactions)
  };
};

const mapFinancialYear = (licences, financialYear) =>
  mapValues(licences, mapLicence);

/**
   *
   * @param {Object} invoice - payload from water service invoice detail call
   * @param {Map} documentIds - map of licence numbers / CRM document IDs
   */
const mapInvoiceTransactions = (invoice, documentIds) => {
  const transactions = flatMap(invoice.invoiceLicences.map(invoiceLicence => {
    const { licenceNumber } = invoiceLicence.licence;
    return invoiceLicence.transactions.map(transaction => ({
      transaction,
      financialYear: helpers.charging.getFinancialYear(transaction.chargePeriod.startDate),
      licenceNumber,
      link: `/licences/${documentIds.get(licenceNumber)}`
    }));
  }));

  // Group by financial year, licence number, charge element
  const grouped = groupArray(transactions, 'financialYear', 'licenceNumber', 'transaction.chargeElement.id');

  // Map the returned values
  return mapValues(grouped, mapFinancialYear);
};

const mapBatchType = (type) => type === 'two_part_tariff' ? 'Two-part tariff' : sentenceCase(type);

const mapCondition = (conditionType, condition) => ({
  title: sentenceCase(conditionType.displayTitle.replace('Aggregate condition', '')),
  parameter1Label: conditionType.parameter1Label.replace('licence number', 'licence'),
  parameter1: condition.parameter1,
  parameter2Label: conditionType.parameter2Label,
  parameter2: condition.parameter2,
  text: condition.text
});

/**
 * Maps an array of conditions retrieved from licence summary water service call
 * to the shape necessary for display on the two part tariff transaction review screen
 * @param {Array} nested conditions
 * @return {Array} flat list ready for view
 */
const mapConditions = conditions => conditions.reduce((acc, conditionType) => {
  conditionType.points.forEach(point => {
    point.conditions.forEach(condition => {
      acc.push(mapCondition(conditionType, condition));
    });
  });
  return acc;
}, []);

exports.mapBatchListRow = mapBatchListRow;
exports.mapInvoiceTransactions = mapInvoiceTransactions;
exports.mapBatchType = mapBatchType;
exports.mapConditions = mapConditions;
exports.mapBatchType = mapBatchType;
