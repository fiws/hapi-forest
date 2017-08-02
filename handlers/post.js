'use strict';

const hu = require('../lib/handler-utils');
const joi = require('joi');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    if (options.preQuery) options.preQuery(req.payload); // query extension point

    const model = options.skipMongooseHooks ?
      Model.insertMany([req.payload]) :
      Model.create(req.payload);

    model.then(item => {
      if (options.skipMongooseHooks) item = item[0];
      if (options.transformResponse) item = options.transformResponse(item, req, reply);
      reply(item).code(201);
      if (options.afterResponse) item = options.afterResponse(item, req);
    })
      .catch(err => hu.handleError(err, reply));
  };
};

module.exports.validOptions = {
  skipMongooseHooks: joi.boolean().default(false),
  afterResponse: joi.func().maxArity(2),
};
