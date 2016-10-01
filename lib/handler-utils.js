'use strict';

const joi = require('joi');

exports.getId = (opts, req) => {
  const params = req.params;
  return params[opts.idKey] || req.params.id || req.paramsArray[0];
}

exports.getIdQuery = (opts, req) => {
  const id = exports.getId(opts, req);
  return { [opts.idKey]: id };
}

exports.schemas = {
  idKey: joi.string().default('_id').example('nickname'),
};
