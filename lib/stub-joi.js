"use strict";

const joi = require("joi");
const { set } = require("lodash");

const FILTER_PATHS = ["_id", "id", "__v", "updatedAt", "createdAt"];

const transforms = {
  ObjectID: () => joi.string().hex().length(24),
  String: () => joi.string(),
  Boolean: () => joi.boolean(),
  Number: () => joi.number(),
  Date: () => joi.date(),
  Mixed: () => joi.any(),
  Array: (schema) => {
    if (schema.schema !== undefined) {
      // TODO: handle subschema
      return joi.array().label(schema.path);
    } else if (schema.caster !== undefined) {
      // deep array
      return joi
        .array()
        .items(fromProperty(schema.caster))
        .label(schema.caster.path);
    } else {
      // simple array
      return joi.array().label(schema.path);
    }
  },
  any: () => joi.any(),
};

const fromProperty = (mSchema) => {
  const { instance } = mSchema;

  let joiSchema;
  if (transforms[instance] !== undefined) {
    joiSchema = transforms[instance](mSchema).label(mSchema.path);
  } else {
    // TODO: debug log
    joiSchema = transforms.any(mSchema);
  }
  if (mSchema.isRequired === true) joiSchema = joiSchema.required();
  return joiSchema;
};

// guesses a joi schema based on a mongoose model
module.exports = (model, unrequire = false) => {
  const { modelName, schema } = model;
  const newSchema = {};

  const keys = [];
  schema.eachPath((key, schema) => {
    if (FILTER_PATHS.includes(key)) return set(newSchema, key, joi.strip()); // filtered out
    keys.push(key);
    const val = fromProperty(schema);
    set(newSchema, key, val);
  });

  let joiSchema = joi.object().keys(newSchema).label(modelName).required();
  if (unrequire)
    joiSchema = joiSchema.fork(keys, (schema) => schema.optional());
  return joiSchema;
};
