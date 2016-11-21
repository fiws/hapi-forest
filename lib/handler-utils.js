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

const mongo3Match = /collection: .*\..+ index: (.+)_\d+ dup/;
const mongo2Match = /E11000 duplicate key error index: .+\..+\.\$(.+)_\d+ {2}dup/;

exports.handleError = (err, reply) => {
  // duplicate key
  if (err.code === 11000) {
    let fieldName = 'field';
    // try mongodb 3 error string first
    const m3 = err.message.match(mongo3Match);
    if (m3 !== null) fieldName = m3[1];
    else {
      // fallback to mongodb 2 error string
      const m2 = err.message.match(mongo2Match);
      if (m2 !== null) fieldName = m2[1];
    }
    return reply(boom.conflict(`Entry with that ${fieldName} already exists`, {
      fieldName,
    }));
  }
  return reply(boom.badImplementation(err));
};

exports.schemas = {
  idKey: joi.string().default('_id').example('nickname'),
};
