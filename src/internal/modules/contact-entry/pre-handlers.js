const Boom = require('@hapi/boom');
const services = require('../../lib/connectors/services');

const searchForCompaniesByString = async request => {
  const { searchQuery } = request.query;
  try {
    const data = await services.water.companies.getCompaniesByName(searchQuery);
    return data;
  } catch (err) {
    if (err.statusCode === 404) {
      return Boom.notFound(`No contacts found matching the search query "${searchQuery}"`);
    }
    throw err;
  }
};

const searchForAddressesByEntityId = async request => {
  const { sessionKey } = request.payload || request.query;
  const { id } = request.yar.get(sessionKey);
  try {
    const data = await services.water.companies.getAddresses(id);
    return data;
  } catch (err) {
    if (err.statusCode === 404) {
      return Boom.notFound(`No address found.`);
    }
    throw err;
  }
};

const searchForFAOsByEntityId = async request => {
  let sessionKey = request.query.sessionKey ? request.query.sessionKey : request.payload.sessionKey;
  const { id } = request.yar.get(sessionKey);
  try {
    const { data } = await services.water.companies.getContacts(id);
    return data;
  } catch (err) {
    if (err.statusCode === 404) {
      return Boom.notFound(`No address found.`);
    }
    throw err;
  }
};

const searchForCompaniesInCompaniesHouse = async request => {
  let sessionKey = request.query.sessionKey ? request.query.sessionKey : request.payload.sessionKey;
  const { companyNameOrNumber } = request.yar.get(sessionKey);
  if (!companyNameOrNumber) {
    return [];
  } else {
    // Search companies house. Return results as array;
    const { data } = await services.water.companies.getCompaniesFromCompaniesHouse(companyNameOrNumber);
    return data;
  }
};

const fetchRegionByCompanyId = async request => {
  let sessionKey = request.query.sessionKey ? request.query.sessionKey : request.payload.sessionKey;
  const { licenceId } = request.yar.get(sessionKey);
  try {
    // TODO asked Stephan which method would be best for figuring out the region for a licence. Awaiting feedback.
    return '';
  } catch (err) {
    console.log(err)
    if (err.statusCode === 404) {
      return Boom.notFound(`No address found.`);
    }
    throw err;
  }
};

exports.searchForCompaniesByString = searchForCompaniesByString;
exports.searchForAddressesByEntityId = searchForAddressesByEntityId;
exports.searchForFAOsByEntityId = searchForFAOsByEntityId;
exports.fetchRegionByCompanyId = fetchRegionByCompanyId;
exports.searchForCompaniesInCompaniesHouse = searchForCompaniesInCompaniesHouse;
