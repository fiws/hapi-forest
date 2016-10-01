'use strict';

const boom = require('boom');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    const q = hu.getIdQuery(options, req);
    Model.update(q, req.payload, (err, mod) => {

      if (err) return reply(boom.badImplementation(err));
      return reply(mod);
    });
  };
};

module.exports.validOptions = {
  idKey: hu.schemas.idKey,
};