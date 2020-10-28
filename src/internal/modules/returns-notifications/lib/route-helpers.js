'use strict';

const createHandlerPair = (controller, getMethodName, config) => {
  const postMethodName = getMethodName.replace('get', 'post');
  return {
    [getMethodName]: {
      method: 'GET',
      handler: controller[getMethodName],
      ...config
    },
    [postMethodName]: {
      method: 'POST',
      handler: controller[postMethodName],
      ...config
    }
  };
};

exports.createHandlerPair = createHandlerPair;
