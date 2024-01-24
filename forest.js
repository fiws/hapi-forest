"use strict";

const joi = require("joi");
const stubJoi = require("./lib/stub-joi");
const call = new require("@hapi/call");
const router = new call.Router();

/**
  Hapi plugin register function
  @param {Hapi.Server} server
  @param {import("./types.d.ts").RegisterOptions} opts
*/
const register = (server, opts) => {
  const defaultSchema = joi
    .object()
    .keys({
      model: joi.func().required(),
      preQuery: joi.func().maxArity(1),
      transformResponse: joi.func().maxArity(2),
      type: joi.valid(
        "getOne",
        "getAll",
        "getAllPaginated",
        "post",
        "put",
        "patch",
        "delete"
      ),
    })
    .optional();

  // register handlers
  const handlers = {
    getOne: require("./handlers/getOne"),
    getAll: require("./handlers/getAll"),
    getAllPaginated: require("./handlers/getAllPaginated"),
    post: require("./handlers/post"),
    put: require("./handlers/put"),
    patch: require("./handlers/patch"),
    delete: require("./handlers/delete"),
  };

  server.decorate("handler", "forest", (route, options) => {
    let handler = null;

    const analyzed = router.analyze(route.path);
    // set idKey to first param if not set
    if (analyzed.params[0] && options.idKey === undefined) {
      if (analyzed.params[0] === "id") options.idKey = "_id";
      else options.idKey = analyzed.params[0];
    }

    if (options.type !== undefined) handler = handlers[options.type];
    else if (route.method === "get") {
      if (/.*\/\?$/.test(route.fingerprint) === true) {
        handler = handlers.getOne;
      } else {
        handler = handlers.getAll;
      }
    } else if (handlers[route.method] !== undefined) {
      handler = handlers[route.method];
    } else {
      throw new Error("no handler for method");
    }

    const oSchema = handler.validOptions
      ? defaultSchema.concat(handler.validOptions)
      : defaultSchema;
    options = joi.attempt(
      options,
      oSchema,
      "invalid options passed to forest plugin:"
    );
    return handler(route, options);
  });

  // bootstrap routes
  if (opts.bootstrap) {
    opts.bootstrap.forEach((Model) => {
      const collectionName = Model.collection.name;
      const modelName = Model.modelName;
      const path = "/" + collectionName; // default path

      // generate joi model to get you started
      const stubJoiSchema = stubJoi(Model);
      const stubJoiSchemaUnrequired = stubJoi(Model, true);
      const paramIdSchema = {
        id: joi.string().hex().length(24),
      };

      server.route({
        path,
        method: "GET",
        handler: {
          forest: { model: Model, filterByQuery: true },
        },
        config: {
          tags: ["api"],
          description: `Gets all ${collectionName}`,
          validate: {
            query: stubJoiSchemaUnrequired,
          },
        },
      });

      server.route({
        path: path + "/{id}",
        method: "GET",
        handler: {
          forest: { model: Model },
        },
        config: {
          tags: ["api"],
          description: `Gets a single ${modelName}`,
          validate: {
            params: paramIdSchema,
          },
        },
      });

      server.route({
        path,
        method: "POST",
        handler: {
          forest: { model: Model },
        },
        config: {
          tags: ["api"],
          description: `Create a new ${modelName}`,
          validate: {
            payload: stubJoiSchema,
          },
        },
      });

      server.route({
        path: path + "/{id}",
        method: "PATCH",
        handler: {
          forest: { model: Model },
        },
        config: {
          tags: ["api"],
          description: `Update existing ${modelName}`,
          validate: {
            params: paramIdSchema,
            payload: stubJoiSchemaUnrequired,
          },
        },
      });

      server.route({
        path: path + "/{id}",
        method: "PUT",
        handler: {
          forest: { model: Model },
        },
        config: {
          tags: ["api"],
          description: `Puts ${modelName}`,
          validate: {
            params: paramIdSchema,
            payload: stubJoiSchema,
          },
        },
      });

      server.route({
        path: path + "/{id}",
        method: "DELETE",
        handler: {
          forest: { model: Model },
        },
        config: {
          tags: ["api"],
          description: `Delete specified ${modelName}`,
          validate: {
            params: paramIdSchema,
          },
        },
      });
    });
  }

  server.expose("stubJoi", stubJoi);
};

module.exports.plugin = {
  pkg: require("./package.json"),
  register,
};
