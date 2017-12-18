'use strict';

require('make-promises-safe');
const hapi = require('hapi');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/forest-example', { useMongoClient: true });

const server = new hapi.server({ port: 8080 });

const plugins = [
  {
    plugin: require('../forest'),
    options: {
      bootstrap: [ require('./models/cat-model') ] //, require('./models/user-model') ]
    }
  },
  // TODO: require('vision'), require('inert'), require('hapi-swagger'),
  require('blipp'),
];

server.register(plugins)
  .catch(console.error)
  .then(() => console.log('Bootstraped all model routes'))
  .then(() => server.start())
  .then(() => console.log(`example server started @ ${server.info.uri}`));
