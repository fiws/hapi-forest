'use strict';

const boom = require('boom');
const joi = require('joi');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return async req => {

    const query = hu.getIdQuery(options, req);
    if (options.preQuery) options.preQuery(query); // query extension point
    let item = await Model.findOneAndUpdate(query, req.payload, { new: true }).lean().catch(hu.handleError);
    if (item === null) throw boom.notFound(`${Model.modelName} not found`);
    if (options.transformResponse) item = options.transformResponse(item, req);
    if (options.afterResponse) process.nextTick(() => options.afterResponse(item, req));
    return item;
  };
};

module.exports.validOptions = {
  idKey: hu.schemas.idKey,
  afterResponse: joi.func().maxArity(2),
};
