'use strict';

const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    Model.create(req.payload, (err, item) => {

      if (err) return hu.handleError(err, reply);
      return reply(item).code(201);
    });
  };
};
