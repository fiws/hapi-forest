'use strict';

const joi = require('joi');
const hoek = require('hoek');
const stubJoi = require('./lib/stub-joi');

module.exports = (server, opts, next) =>  {

  const defaultSchema = {
    model: joi.func().required(),
    type: joi.string().allow([
      'getOne', 'getAll', 'post', 'put', 'patch', 'delete'
    ]),
  };

  // register handlers
  const handlers = {
    getOne: require('./handlers/getOne'),
    getAll: require('./handlers/getAll'),
    post: require('./handlers/post'),
    put: require('./handlers/put'),
    patch: require('./handlers/patch'),
    delete: require('./handlers/delete'),
  };

  server.handler('forest', (route, options) => {
    let handler = null;

    if (route.method === 'get') {
      if (/.*\/\?$/.test(route.fingerprint) === true) {
        handler = handlers.getOne;
      } else {
        handler = handlers.getAll;
      }
    } else if (handlers[route.method] !== undefined) {

      handler = handlers[route.method];
    } else {
      throw new Error('no handler for method');
    }
    const oSchema = hoek.applyToDefaults(defaultSchema, handler.validOptions || {});
    options = joi.attempt(options, oSchema, 'invalid options');
    return handler(route, options);
  });

  // bootstrap routes
  if (opts.bootstrap) {
    opts.bootstrap.forEach((Model) => {
      const collectionName = Model.collection.name;
      const modelName = Model.modelName;
      const path = '/' + collectionName; // default path

      // generate joi model to get you started
      const stubJoiSchema = stubJoi(Model);
      const paramIdSchema = {
        id: joi.string().hex().length(24)
      };

      server.route({
        path,
        method: 'GET',
        handler: {
          forest: { model: Model, filterByQuery: true }
        },
        config: {
          tags: ['api'],
          description: `Gets all ${collectionName}`,
          validate: {
            query: stubJoiSchema,
          }
        }
      });

      server.route({
        path: path + '/{id}',
        method: 'GET',
        handler: {
          forest: { model: Model }
        },
        config: {
          tags: ['api'],
          description: `Gets a single ${modelName}`,
          validate: {
            params: paramIdSchema
          }
        }
      });

      server.route({
        path,
        method: 'POST',
        handler: {
          forest: { model: Model }
        },
        config: {
          tags: ['api'],
          description: `Create a new ${modelName}`,
          validate: {
            payload: stubJoiSchema
          }
        }
      });

      server.route({
        path: path + '/{id}',
        method: 'PATCH',
        handler: {
          forest: { model: Model }
        },
        config: {
          tags: ['api'],
          description: `Update existing ${modelName}`,
          validate: {
            params: paramIdSchema,
            payload: stubJoiSchema,
          }
        }
      });

      server.route({
        path: path + '/{id}',
        method: 'PUT',
        handler: {
          forest: { model: Model }
        },
        config: {
          tags: ['api'],
          description: `Puts ${modelName}`,
          validate: {
            params: paramIdSchema,
            payload: stubJoiSchema,
          }
        }
      });

      server.route({
        path: path + '/{id}',
        method: 'DELETE',
        handler: {
          forest: { model: Model }
        },
        config: {
          tags: ['api'],
          description: `Delete specified ${modelName}`,
          validate: {
            params: paramIdSchema
          }
        }
      });

    });
  }

  next();
};

module.exports.attributes = {
  pkg: require('./package.json')
};
