'use strict';

const joi = require('joi');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    const q = hu.getIdQuery(options, req);
    req.payload[options.idKey] = hu.getId(options, req);
    Model.update(q, req.payload, {
      upsert: options.allowUpsert
    }, (err, mod) => {

      if (err) return hu.handleError(err, reply);
      return reply(mod);
    });
  };
};

module.exports.validOptions = {
  allowUpsert: joi.boolean().default(true),
  idKey: hu.schemas.idKey,
};
