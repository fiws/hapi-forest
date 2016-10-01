'use strict';

const joi = require('joi');
const lodash = require('lodash');

const FILTER_PATHS = ['_id', 'id', '__v', 'updatedAt', 'createdAt'];

// guesses a joi schema based on a mongoose model
module.exports = (model) => {
  const { modelName, schema } = model;
  // const joiSchema = Joi.object().label(modelName);
  const newSchema = {};

  schema.eachPath((key, v) => {
    if (FILTER_PATHS.some(k => k === key)) return; // filtered out

    let val;
    switch (v.instance) {
    case 'ObjectID': // TODO: objectId
      val = joi.string().hex().length(24);
      break;
    case 'String':
      val = joi.string();
      break;
    case 'Boolean':
      val = joi.boolean();
      break;
    case 'Number':
      val = joi.number();
      break;
    case 'Date':
      val = joi.date();
      break;
    case 'Mixed':
    default:
      val = joi.object();
    }
    lodash.set(newSchema, key, val);
  });

  return joi.object(newSchema).label(modelName);

  // return joi.object().label(modelName);
};
