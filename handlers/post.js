'use strict';

const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    const model = Model.create(req.payload);
    if (options.preQuery) options.preQuery(model); // query extension point

    model.then(item => {
      if (options.transformResponse) item = options.transformResponse(item);
      return reply(item).code(201);
    })
      .catch(err => hu.handleError(err, reply));
  };
};
