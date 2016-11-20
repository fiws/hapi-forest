'use strict';

const joi = require('joi');
const boom = require('boom');

exports.getId = (opts, req) => {
  const params = req.params;
  return params[opts.idKey] || req.params.id || req.paramsArray[0];
};

exports.getIdQuery = (opts, req) => {
  const id = exports.getId(opts, req);
  return { [opts.idKey]: id };
};

exports.handleError = (err, reply) => {
  // duplicate key
  if (err.code === 11000) {
    const field = err.message.match(/collection: .*\..+ index: (.+)_\d+ dup/)[1];

    return reply(boom.conflict(`Entry with that ${field} already exists`, {
      field,
    }));
  }
  return reply(boom.badImplementation(err));
};

exports.schemas = {
  idKey: joi.string().default('_id').example('nickname'),
};
