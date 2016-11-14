'use strict';

const joi = require('joi');
const lodash = require('lodash');

const FILTER_PATHS = ['_id', 'id', '__v', 'updatedAt', 'createdAt'];

const transforms = {
  'ObjectID': () => joi.string().hex().length(24),
  'String': () => joi.string(),
  'Boolean': () => joi.boolean(),
  'Number': () => joi.number(),
  'Date': () => joi.date(),
  'Mixed': () => joi.any(),
  'Array': (schema) => {
    if (schema.schema !== undefined) {
      // TODO: handle subschema
      return joi.array().label(schema.path);
    } else if (schema.caster !== undefined) {
      // deep array
      return joi.array().items(fromProperty(schema.caster)).label(schema.caster.path);
    } else {
      // simple array
      return joi.array().label(schema.path);
    }
  },
  'any': () => joi.any(),
};

const fromProperty = (schema) => {
  const { instance } = schema;
  if (transforms[instance] !== undefined) {
    return transforms[instance](schema).label(schema.path);
  } else {
    // TODO: debug log
    return transforms.any(schema);
  }
}

// guesses a joi schema based on a mongoose model
module.exports = (model) => {
  const { modelName, schema } = model;
  const newSchema = {};

  schema.eachPath((key, schema) => {
    if (FILTER_PATHS.some(k => k === key)) return; // filtered out

    const val = fromProperty(schema);
    lodash.set(newSchema, key, val);
  });

  return joi.object().keys(newSchema).label(modelName);
};
