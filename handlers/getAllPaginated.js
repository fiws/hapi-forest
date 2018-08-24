'use strict';

const joi = require('joi');
const hoek = require('hoek');

module.exports = (route, options) => {
  const Model = options.model;

  return async (req, h) => {

    let filter = options.filterByQuery ? req.query : {};
    let query = Model.find();

    // allow the user to limit the number of results, if option allows it
    if (options.allowLimit === true && req.query.$limit) {
      // limit query, if limit is a number
      if (hoek.isInteger(+req.query.$limit)) {
        const limit = Number.parseInt(req.query.$limit, 10);
        query.limit(limit);
      }
      delete filter.$limit; // remove from filter
    }

    let count = await Model.count(filter).lean();

    // change query object extension point
    if (options.transformQuery) filter = options.transformQuery(filter);
    if (options.select) query.select(options.select);
    if (options.preQuery) options.preQuery(query); // query extension point

    let result = await query.where(filter).skip(filter.$start).lean();
    if (options.transformResponse) result = result.map(obj => options.transformResponse(obj, req));

    return h.response(result)
      .header('x-total-count', count);
  };
};

module.exports.validOptions = {
  filterByQuery: joi.boolean().default(false),
  allowLimit: joi.boolean().default(true),
  select: joi.string(),
};
