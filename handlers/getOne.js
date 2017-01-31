'use strict';

const boom = require('boom');
const joi = require('joi');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    const q = hu.getIdQuery(options, req);
    const query = Model.findOne(q).lean();
    if (options.select) query.select(options.select);
    if (options.preQuery) options.preQuery(query); // query extension point

    query.exec((err, item) => {

      if (err) return reply(boom.badImplementation(err));
      if (item === null) return reply(boom.notFound(`${Model.modelName} not found`));
      if (options.transformResponse) item = options.transformResponse(item, req, reply);
      return reply(item);
    });
  };
};

module.exports.validOptions = {
  idKey: hu.schemas.idKey,
  select: joi.string(),
};
