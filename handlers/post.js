'use strict';

const boom = require('boom');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    Model.create(req.payload, (err, mod) => {

      if (err) return reply(boom.badImplementation(err));
      return reply(mod);
    });
  };
};
