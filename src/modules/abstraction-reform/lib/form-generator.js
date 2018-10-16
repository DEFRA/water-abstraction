const { URL } = require('url');

const { isObject, each } = require('lodash');
const sentenceCase = require('sentence-case');
const apiHelpers = require('./api-helpers');
const { formFactory, fields } = require('../../../lib/forms');

const types = {
  ngr: require('../schema/types/ngr.json')
};

/**
 * Given a picklist record and an array of picklist items loaded from the
 * water service, generates a JSON schema for this picklist data
 * @param {Object} picklist - picklist object from water service
 * @param {Array} items - picklist items from water service
 * @return {Object} JSON schema
 */
const picklistSchemaFactory = (picklist, items) => {
  const filtered = items.filter(item => !item.hidden);
  if (picklist.id_required) {
    return {
      type: 'object',
      enum: filtered.map(item => ({ id: item.id, value: item.value }))
    };
  } else {
    return {
      type: 'string',
      enum: filtered.map(item => item.value)
    };
  }
};

/**
 * A resolver for json-schema-ref-parser
 * This allows refs to be parsed and the relevant schema data to be
 * retrieved
 */
const waterResolver = {
  order: 1,

  canRead: /^water:\/\//i,

  read: async function (file) {
    // Parse URL
    const { host, pathname } = new URL(file.url);

    const ref = pathname.replace('/', '').replace('.json', '');

    // Load picklist schema from API
    if (host === 'picklists') {
      const picklist = await apiHelpers.getPicklist(ref);
      const items = await apiHelpers.getPicklistItems(ref);

      console.log(picklist, items);

      return picklistSchemaFactory(picklist, items);
    }

    // Load types from local files
    if (host === 'types') {
      return types[ref];
    }
  }

};

/**
 * Converts references in the schema to their literals
 * @param {Object} schema - JSON schema with refs
 * @return {Promise} resolves with JSON schema with references converted to literals
 */
const dereference = async (schema) => {
  const refParser = require('json-schema-ref-parser');
  const populated = await refParser.dereference(schema, { resolve: { waterResolver } });
  return populated;
};

/**
 * Guess label given a field name
 * Converts underscore to space and converts to sentence case
 * @param {String} str - field name, snake case
 * @return {String} label
 */
const guessLabel = (str) => {
  return sentenceCase(str.replace(/_+/g, ' '));
};

/**
 * Given a JSON schema for WR22 condition, generates a form object
 * for rendering in the UI
 * @param {String} action - form action
 * @param {Object} schema - JSON schema object
 */
const schemaToForm = (action, csrfToken, schema) => {
  const f = formFactory(action, 'POST', 'json-schema');

  // Add CSRF token
  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));

  each(schema.properties, (item, key) => {
    const label = guessLabel(key);

    if (item.type === 'boolean') {
      f.fields.push(fields.radio(key, { label,
        choices: [
          { value: false, label: 'Yes' },
          { value: true, label: 'No' }
        ],
        mapper: 'booleanMapper'
      }));
    } else if ('enum' in item) {
      // Object enum items
      if (isObject(item.enum[0])) {
        f.fields.push(fields.dropdown(key, { label, choices: item.enum, key: 'id', mapper: 'objectMapper' }));
      } else {
        // Scalar enum values (string/number)
        const mapper = item.type === 'number' ? 'numberMapper' : 'defaultMapper';
        f.fields.push(fields.dropdown(key, { label, choices: item.enum, mapper }));
      }
    } else {
      // Scalar enum values (string/number)
      const mapper = item.type === 'number' ? 'numberMapper' : 'defaultMapper';
      f.fields.push(fields.text(key, { label, mapper }));
    }
  });

  // Add submit button
  f.fields.push(fields.button(null, { label: 'Submit' }));

  return f;
};

module.exports = {
  dereference,
  picklistSchemaFactory,
  schemaToForm,
  guessLabel
};
