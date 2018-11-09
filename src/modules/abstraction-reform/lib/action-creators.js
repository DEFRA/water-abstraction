const statuses = require('./statuses');
const { EDIT_PURPOSE, EDIT_LICENCE, EDIT_POINT, EDIT_CONDITION, SET_STATUS, EDIT_CURRENT_VERSION } = require('./action-types');

const formatUser = (user) => {
  const {user_id: id, username: email} = user;
  return {id, email};
};

/**
 * Edits the purpose of a licence
 * @param {Object} data - key/value pairs of purpose data to edit
 * @param {Object} user - the current user of the application
 * @param {Number} id - the purpose ID
 * @return {Object} action to edit purpose
 */
const createEditPurpose = (data, user, id) => {
  return {
    type: EDIT_PURPOSE,
    payload: {
      purposeId: parseInt(id),
      data,
      user: formatUser(user),
      timestamp: Date.now()
    }
  };
};

/**
 * Edits the base licence data
 * @param {Object} data - key/value pairs of data to edit
 * @param {Object} user - the current user of the application
 * @return {Object} action to edit licence base data
 */
const createEditLicence = (data, user) => {
  return {
    type: EDIT_LICENCE,
    payload: {
      data,
      user: formatUser(user),
      timestamp: Date.now()
    }
  };
};

/**
 * Edits the point of a licence
 * @param {Object} data - key/value pairs of purpose data to edit
 * @param {Object} user - the current user of the application
 * @param {Number} id - the point ID
 * @return {Object} action to edit point
 */
const createEditPoint = (data, user, id) => {
  return {
    type: EDIT_POINT,
    payload: {
      pointId: parseInt(id),
      data,
      user: formatUser(user),
      timestamp: Date.now()
    }
  };
};

/**
 * Edits the condition of a licence
 * @param {Object} data - key/value pairs of purpose data to edit
 * @param {Object} user - the current user of the application
 * @param {Number} id - the condition ID
 * @return {Object} action to edit condition
 */
const createEditCondition = (data, user, id) => {
  return {
    type: EDIT_CONDITION,
    payload: {
      conditionId: parseInt(id),
      data,
      user: formatUser(user),
      timestamp: Date.now()
    }
  };
};

/**
 * Edits the condition of a licence
 * @param {String} status - the new status
 * @param {String} notes - notes to record with the status change
 * @param {Object} user - the current user of the application
 * @return {Object} action to edit condition
 */
const createSetStatus = (status, notes, user) => {
  if (!Object.values(statuses).includes(status)) {
    throw new Error(`Invalid AR status ${status}`);
  }

  return {
    type: SET_STATUS,
    payload: {
      status,
      notes: notes.trim() || null,
      user: formatUser(user),
      timestamp: Date.now()
    }
  };
};

/**
 * Edits the current licence version
 * @param {Object} data - key/value pairs of purpose data to edit
 * @param {Object} user - the current user of the application
 * @param {Number} id - the condition ID
 * @return {Object} action to edit condition
 */
const createEditCurrentVersion = (data, user) => {
  return {
    type: EDIT_CURRENT_VERSION,
    payload: {
      data,
      user: formatUser(user),
      timestamp: Date.now()
    }
  };
};

module.exports = {
  createEditPurpose,
  createEditLicence,
  createEditPoint,
  createEditCondition,
  createSetStatus,
  createEditCurrentVersion
};
