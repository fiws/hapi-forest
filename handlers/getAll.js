'use strict';

const joi = require('joi');
const stream = require('stream');
const jsonStream = require('JSONStream');

module.exports = (route, options) => {
  const Model = options.model;

  return (req, reply) => {

    const filter = options.filterByQuery ? req.query : {};
    const query = Model.find(filter).lean();
    if (options.select) query.select(options.select);
    if (options.preQuery) options.preSend(query); // query extension point

    const readStream = query.cursor().pipe(jsonStream.stringify());
    const stream2 = new stream.Readable().wrap(readStream);

    reply(stream2).type('application/json');
  };
};

module.exports.validOptions = {
  filterByQuery: joi.boolean().default(false),
  select: joi.string(),
};
