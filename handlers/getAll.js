'use strict';

const joi = require('joi');
const hoek = require('hoek');
const stream = require('stream');
const jsonStream = require('JSONStream');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

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

    // change query object extension point
    if (options.transformQuery) filter = options.transformQuery(filter);
    if (options.select) query.select(options.select);
    if (options.preQuery) options.preQuery(query); // query extension point

    const transform = options.transformResponse ?
      poly => options.transformResponse(poly, req, reply) : undefined;

    const readStream = query.where(filter).lean().cursor({
      transform,
    }).pipe(jsonStream.stringify());
    const stream2 = new stream.Readable().wrap(readStream);

    reply(stream2).type('application/json');
  };
};

module.exports.validOptions = {
  filterByQuery: joi.boolean().default(false),
  allowLimit: joi.boolean().default(true),
  select: joi.string(),
};
