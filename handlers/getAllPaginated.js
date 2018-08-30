'use strict';

const joi = require('joi');
const hoek = require('hoek');

module.exports = (route, options) => {
  const Model = options.model;

  return async (req, h) => {

    let filter = options.filterByQuery ? req.query : {};
    let query = Model.find();

    if (hoek.isInteger(+filter.$start)) {
      query.skip(parseInt(filter.$start, 10));
      delete filter.$start;
    }
    // limit query, if limit is a number
    if (hoek.isInteger(+filter.$limit)) {
      query.limit(parseInt(filter.$limit, 10));
      delete filter.$limit; // remove from filter
    }

    if (options.allowSort === true) {
      // order query ascending or descending if sort property is given
      let order = 'asc';
      if (filter.$order && typeof filter.$order === 'string') {
        if (filter.$order.toLowerCase() === 'desc') order = 'desc';
        delete filter.$order;
      }
      // sort to a certain property
      if (filter.$sort && typeof filter.$sort === 'string') {
        query.sort({ [filter.$sort]: order });
        delete filter.$sort;
      }
    }

    let count = await Model.count(filter).lean();

    // change query object extension point
    if (options.transformQuery) filter = options.transformQuery(filter);
    if (options.select) query.select(options.select);
    if (options.preQuery) options.preQuery(query); // query extension point

    let result = await query.where(filter).lean();
    if (options.transformResponse) result = result.map(obj => options.transformResponse(obj, req));

    return h.response(result)
      .header('x-total-count', count);
  };
};

module.exports.validOptions = {
  filterByQuery: joi.boolean().default(true),
  allowSort: joi.boolean().default(true),
  select: joi.string(),
};
