const test = require('ava');
const hapi = require('hapi');

test.cb('register without errors (no opts)', (t) => {
  const server = new hapi.Server();
  server.register({
    register: require('../forest')
  }, e => {
    t.true(e === undefined, 'no error');
    t.end();
  });

});

test.cb('register and bootstrap', (t) => {
  const server = new hapi.Server();
  server.connection({ host: 'localhost' }); // will never be used
  server.register({
    register: require('../forest'),
    options: {
      bootstrap: [
        require('./fixtures/test-cat-model'),
      ]
    }
  }, e => {
    // TODO: check for routes
    t.true(e === undefined, 'no error');
    t.end();
  });

});
