'use strict';

const joi = require('joi');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    const condition = hu.getIdQuery(options, req);
    req.payload[options.idKey] = hu.getId(options, req);
    const query = Model.update(condition, req.payload, {
      upsert: options.allowUpsert
    });
    if (options.preQuery) options.preSend(query); // query extension point
    query.exec((err, mod) => {

      if (err) return hu.handleError(err, reply);
      return reply(mod);
    });
  };
};

module.exports.validOptions = {
  allowUpsert: joi.boolean().default(true),
  idKey: hu.schemas.idKey,
};
