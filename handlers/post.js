'use strict';

const hu = require('../lib/handler-utils');
const joi = require('joi');

module.exports = (route, options) => {
  const Model = options.model;

  return async (req, h) => {

    if (options.preQuery) options.preQuery(req.payload); // query extension point

    const model = options.skipMongooseHooks ?
      Model.insertMany([req.payload]) :
      Model.create(req.payload);

    let item = await model.catch(hu.handleError);
    if (options.skipMongooseHooks) item = item[0];
    if (options.transformResponse) item = options.transformResponse(item, req);
    if (options.afterResponse) process.nextTick(() => options.afterResponse(item, req));
    return h.response(item).code(201);
  };
};

module.exports.validOptions = {
  skipMongooseHooks: joi.boolean().default(false),
  afterResponse: joi.func().maxArity(2),
};
