const test = require('ava');
const hapi = require('hapi');

const CatModel = require('./fixtures/test-cat-model');

test.beforeEach(async t => {
  const server = new hapi.Server({ port: 9999 }); // never started
  const register = server.register(require('../forest'));
  await t.notThrows(register);
  t.context.server = server;
});


test('throw for missing handler', t => {
  const server = t.context.server;
  return t.throws(() => {
    server.route({
      method: 'OPTIONS',
      path: '/users/{id}',
      handler: {
        forest: { model: CatModel }
      }
    });
  }, /no handler/);

});

test('throw for missing model', t => {
  const server = t.context.server;
  return t.throws(() => {
    server.route({
      method: 'GET',
      path: '/users/{id}',
      handler: {
        forest: { }
      }
    });
  });
});

test('throw for invalid options', t => {
  const server = t.context.server;
  return t.throws(() => {
    server.route({
      method: 'GET',
      path: '/users/{id}',
      handler: {
        forest: { model: CatModel, nope: true }
      }
    });
  });
});

test('register a getOne handler', t => {
  const server = t.context.server;
  server.route({
    method: 'GET',
    path: '/users/{id}',
    handler: {
      forest: { model: CatModel }
    }
  });
});

test('register a getAll handler', t => {
  const server = t.context.server;
  server.route({
    method: 'GET',
    path: '/users',
    handler: {
      forest: { model: CatModel }
    }
  });
});

test('register a post handler', t => {
  const server = t.context.server;
  server.route({
    method: 'POST',
    path: '/users',
    handler: {
      forest: { model: CatModel }
    }
  });
});

test('register a patch handler', t => {
  const server = t.context.server;
  server.route({
    method: 'PATCH',
    path: '/user/{id}',
    handler: {
      forest: { model: CatModel }
    }
  });
});

test('register a put handler', t => {
  const server = t.context.server;
  server.route({
    method: 'PUT',
    path: '/user/{id}',
    handler: {
      forest: { model: CatModel }
    }
  });
});
