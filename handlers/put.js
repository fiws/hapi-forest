'use strict';

const joi = require('joi');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    const condition = hu.getIdQuery(options, req);
    req.payload[options.idKey] = hu.getId(options, req);

    const query = Model.update(condition, req.payload, {
      overwrite: options.overwrite,
      upsert: options.upsert,
    }).lean();

    if (options.preQuery) options.preQuery(query); // query extension point
    query.exec((err, res) => {

      if (err) return hu.handleError(err, reply);
      if (res.upserted !== undefined) reply(req.payload).code(201); // create
      else reply(req.payload); // update
    });
  };
};

module.exports.validOptions = {
  overwrite: joi.boolean().default(true), // "true" PUT by default – overwrite doc
  upsert: joi.boolean().default(true),
  idKey: hu.schemas.idKey,
};
