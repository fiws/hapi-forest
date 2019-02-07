'use strict';

const joi = require('joi');
const hu = require('../lib/handler-utils');

module.exports = (route, options) => {
  const Model = options.model;

  return async (req, h) => {

    const condition = hu.getIdQuery(options, req);
    req.payload[options.idKey] = hu.getId(options, req);

    const { overwrite, upsert } = options;
    const query = overwrite
      ? Model.replaceOne(condition, req.payload, { upsert })
      : Model.updateOne(condition, req.payload, { upsert });

    if (options.preQuery) options.preQuery(query); // query extension point
    let res = await query.exec().catch(hu.handleError);
    let item = await Model.findOne(condition).lean().exec();

    if (options.transformResponse) item = options.transformResponse(item, req);
    if (options.afterResponse) process.nextTick(() => options.afterResponse(item, req));
    if (res.upserted !== undefined) return h.response(item).code(201); // create
    else return item; // update
  };
};

module.exports.validOptions = {
  overwrite: joi.boolean().default(true), // "true" PUT by default – overwrite doc
  upsert: joi.boolean().default(true),
  afterResponse: joi.func().maxArity(2),
  idKey: hu.schemas.idKey,
};
