'use strict';

const boom = require('boom');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    const query = hu.getIdQuery(options, req);
    if (options.preQuery) options.preQuery(query); // query extension point
    Model.findOneAndRemove(query).lean().exec((err, item) => {

      if (err) return reply(boom.badImplementation(err));
      if (options.transformResponse) item = options.transformResponse(item, req, reply);
      return reply(item);
    });
  };
};

module.exports.validOptions = {
  idKey: hu.schemas.idKey,
};
