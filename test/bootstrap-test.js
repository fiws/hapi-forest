'use strict';

const test = require('ava');

const Hapi = require('hapi');

test.cb('register without errors (no opts)', (t) => {
  const server = new Hapi.Server();
  server.register({
    register: require('../forest')
  }, e => {
    t.true(e === undefined, 'no error');
    t.end();
  });

});

test.cb('registerand bootstrap', (t) => {
  const server = new Hapi.Server();
  server.connection({ host: 'localhost' }); // will never be used
  server.register({
    register: require('../forest'),
    options: {
      bootstrap: [
        require('../example/models/cat-model'),
        require('../example/models/user-model'),
      ]
    }
  }, e => {
    // TODO: check for routes
    t.true(e === undefined, 'no error');
    t.end();
  });

});
