'use strict';

const boom = require('@hapi/boom');
const joi = require('@hapi/joi');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return async req => {

    const q = hu.getIdQuery(options, req);
    const query = Model.findOne(q).lean();
    if (options.select) query.select(options.select);
    if (options.preQuery) options.preQuery(query); // query extension point

    let item = await query.exec();
    if (item === null) throw boom.notFound(`${Model.modelName} not found`);
    if (options.transformResponse) item = options.transformResponse(item, req);
    if (options.afterResponse) process.nextTick(() => options.afterResponse(item, req));
    return item;
  };
};

module.exports.validOptions = {
  idKey: hu.schemas.idKey,
  select: joi.string(),
  afterResponse: joi.func().maxArity(2),
};
