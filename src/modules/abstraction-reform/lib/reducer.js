const update = require('immutability-helper');
const { EDIT_PURPOSE, EDIT_LICENCE, EDIT_POINT, EDIT_CONDITION, SET_STATUS, EDIT_CURRENT_VERSION } = require('./action-types');
const { STATUS_IN_PROGRESS } = require('./statuses');
const { findIndex } = require('lodash');

/**
 * Gets a base update query with the user who edited and timestamp
 * included.
 * @param {Object} action
 * @return {Object} query for immutability helper
 */
const getBaseQuery = (action, status = STATUS_IN_PROGRESS) => {
  const { user, timestamp } = action.payload;
  return {
    status: {
      $set: status
    },
    lastEdit: {
      $set: {
        user,
        timestamp
      }
    }
  };
};

/**
 * Edits a licence purpose within the current_version by ID
 */
const editPurpose = (state, action) => {
  const { purposeId, data } = action.payload;

  const index = findIndex(state.licence.data.current_version.purposes, (row) => {
    return parseInt(row.ID) === parseInt(purposeId);
  });

  if (index === -1) {
    throw new Error(`Purpose ${purposeId} not found`);
  }

  const query = {
    ...getBaseQuery(action),
    licence: {
      data: {
        current_version: {
          purposes: {
            [index]: {
              $merge: data
            }
          }
        }
      }
    }
  };

  return update(state, query);
};

/**
 * Edits base level licence data
 */
const editLicence = (state, action) => {
  const { data } = action.payload;
  let query = {
    ...getBaseQuery(action),
    licence: {
      $merge: data
    }
  };
  return update(state, query);
};

/**
 * Edits a point within current licence data
 */
const editPoint = (state, action) => {
  const { pointId, data } = action.payload;

  const query = {
    ...getBaseQuery(action),
    licence: {
      data: {
        current_version: {
          purposes: {
          }
        }
      }
    }
  };

  state.licence.data.current_version.purposes.forEach((purpose, i) => {
    purpose.purposePoints.forEach((point, j) => {
      if (parseInt(point.point_detail.ID) === parseInt(pointId)) {
        query.licence.data.current_version.purposes[i] = {
          purposePoints: {
            [j]: {
              point_detail: {
                $merge: data
              }
            }
          }
        };
      }
    });
  });

  return update(state, query);
};

const editCondition = (state, action) => {
  const { conditionId, data } = action.payload;

  const query = {
    ...getBaseQuery(action),
    licence: {
      data: {
        current_version: {
          purposes: {
          }
        }
      }
    }
  };

  state.licence.data.current_version.purposes.forEach((purpose, i) => {
    purpose.licenceConditions.forEach((condition, j) => {
      if (parseInt(condition.ID) === parseInt(conditionId)) {
        query.licence.data.current_version.purposes[i] = {
          licenceConditions: {
            [j]: {
              $merge: data
            }
          }
        };
      }
    });
  });

  return update(state, query);
};

const editCurrentVersion = (state, action) => {
  const { data } = action.payload;

  const query = {
    ...getBaseQuery(action),
    licence: {
      data: {
        current_version: {
          licence: {
            $merge: data
          }
        }
      }
    }
  };

  return update(state, query);
};

const setState = (state, action) => {
  const { status, notes, user, timestamp } = action.payload;

  const query = getBaseQuery(action, status);

  if (notes) {
    query.notes = {
      $push: [{
        notes,
        user,
        timestamp
      }]
    };
  }

  return update(state, query);
};

const reducer = (state, action) => {
  switch (action.type) {
    case EDIT_PURPOSE:
      return editPurpose(state, action);

    case EDIT_LICENCE:
      return editLicence(state, action);

    case EDIT_POINT:
      return editPoint(state, action);

    case EDIT_CONDITION:
      return editCondition(state, action);

    case SET_STATUS:
      return setState(state, action);

    case EDIT_CURRENT_VERSION:
      return editCurrentVersion(state, action);

    default:
      return state;
  }
};

module.exports = reducer;
