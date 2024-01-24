"use strict";

require("make-promises-safe");
const hapi = require("@hapi/hapi");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/forest-example");

const server = new hapi.server();

server.validator(require("joi"));

const plugins = [
  {
    plugin: require("../forest"),
    options: {
      bootstrap: [
        require("./models/cat-model"),
        require("./models/user-model"),
      ],
    },
  },
  require("./test-route"),
  // TODO: require('vision'), require('inert'), require('hapi-swagger'),
  require("blipp"),
];

server
  .register(plugins)
  .catch(console.error)
  .then(() => server.start())
  .then(() => console.log(`example server started @ ${server.info.uri}`));
