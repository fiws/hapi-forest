'use strict';

const boom = require('boom');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    const query = hu.getIdQuery(options, req);
    if (options.preQuery) options.preQuery(query); // query extension point
    Model.findOneAndUpdate(query, req.payload).lean().exec((err, mod) => {

      if (err) return reply(boom.badImplementation(err));
      if (mod === null) return reply(boom.notFound(`${Model.modelName} not found`));
      return reply(mod);
    });
  };
};

module.exports.validOptions = {
  idKey: hu.schemas.idKey,
};
