'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();

const mongoose = require('mongoose');
server.app.db = mongoose.connect('localhost');

server.connection({ port: 8080 });

const plugins = [
  {
    register: require('../forest'),
    options: {
      bootstrap: [ require('./models/cat-model'), require('./models/user-model') ]
    }
  },
  // hapi-forest works great with hapi-swagger, but it is not required
  require('vision'),
  require('inert'), {
    register: require('hapi-swagger'),
    options: {
      info: {
        title: 'hapi-forest test API',
        version: '1.0.0'
      }
    }
  }
];

server.register(plugins, e => {
  if (e) console.error(e);
  else console.log('Bootstraped all model routes');
});

server.register(require('blipp'));

server.start((err) => {
  if (err) throw err;
  console.log(`example server started @ ${server.info.uri}`);
});
