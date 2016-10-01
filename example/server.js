'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();

const mongoose = require('mongoose');
server.app.db = mongoose.connect('localhost');

server.connection({ port: 8080 });
server.register({
  register: require('../forest'),
  options: {
    bootstrap: [require('./models/cat-model'), require('./models/user-model')]
  }
}, e => {
  if (e) console.error(e);
  else console.log('Bootstraped all model routes');
});

server.register(require('blipp'));

server.start((err) => {
  if (err) throw err;
  server.route({
    method: 'GET',
    path: '/otherCats/{id}',
    handler: {
      forest: {
        model: require('./models/cat-model'),
        select: 'likes name'
      }
    }
  })
  console.log(`example server started @ ${server.info.uri}`);
});
