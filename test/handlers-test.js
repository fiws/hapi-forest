'use strict';

const test = require('ava');

const Hapi = require('hapi');

const server = new Hapi.Server();
server.register(require('../forest'));
server.connection({ host: 'localhost' }); // will never be used

const CatModel = require('../example/models/cat-model')

test('throw for missing handler', (t) => {
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

test('throw for missing model', (t) => {
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

test('throw for invalid options', (t) => {
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

test('register a getOne handler', (t) => {
  server.route({
    method: 'GET',
    path: '/users/{id}',
    handler: {
      forest: { model: CatModel }
    }
  });

  t.pass();

});

test('register a getAll handler', (t) => {
  server.route({
    method: 'GET',
    path: '/users',
    handler: {
      forest: { model: CatModel }
    }
  });

  t.pass();

});

test('register a post handler', (t) => {
  server.route({
    method: 'POST',
    path: '/users',
    handler: {
      forest: { model: CatModel }
    }
  });

  t.pass();

});

test('register a patch handler', (t) => {
  server.route({
    method: 'PATCH',
    path: '/user/{id}',
    handler: {
      forest: { model: CatModel }
    }
  });

  t.pass();

});

test('register a put handler', (t) => {
  server.route({
    method: 'PUT',
    path: '/user/{id}',
    handler: {
      forest: { model: CatModel }
    }
  });

  t.pass();

});
