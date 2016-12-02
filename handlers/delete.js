'use strict';

const boom = require('boom');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    const query = hu.getIdQuery(options, req);
    if (options.preQuery) options.preSend(query); // query extension point
    Model.findOneAndRemove(query, (err, mod) => {

      if (err) return reply(boom.badImplementation(err));
      return reply(mod);
    });
  };
};

module.exports.validOptions = {
  idKey: hu.schemas.idKey,
};
