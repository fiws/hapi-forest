"use strict";

const Cat = require("./models/cat-model");

exports.register = (server) => {
  server.route({
    method: "GET",
    path: "/test/getAllPaginated",
    config: {
      handler: {
        forest: {
          model: Cat,
          type: "getAllPaginated",
          allowSort: true,
        },
      },
    },
  });
};

exports.name = "test-route";
