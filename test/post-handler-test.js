const test = require('ava');
const hapi = require('hapi');
const CatModel = require('./fixtures/test-cat-model');

test.beforeEach.cb(t => {
  const server = new hapi.Server();
  server.connection({ port: 9999 }); // never started
  server.register({
    register: require('../forest'),
  }, e => {
    t.true(e === undefined, 'no error');
    server.route({
      method: 'POST',
      path: '/testCats1',
      handler: {
        forest: { model: CatModel }
      },
      config: {
        validate: {
          payload: server.plugins['hapi-forest'].stubJoi(CatModel),
        }
      }
    });
    t.context.server = server;
    t.context.send = (payload) => {
      return server.inject({
        method: 'POST',
        url: '/testCats1',
        payload,
      })
    };
    t.end();
  });
});

test('respond with 400 for invalid payload', async t => {
  const send = t.context.send;
  const a = await send('');
  t.true(a.statusCode === 400, 'empty payload');
  const b = await send({});
  t.true(b.statusCode === 400, 'empty object');
  const c = await send({ wrong: 1 });
  t.true(c.statusCode === 400, 'wrong attributes');
  const d = await send({ born: 'wrong type' });
  t.true(d.statusCode === 400, 'wrong type');

  t.pass();
});

// test('create a new database entry', t => {
//   const server = t.context.server;
//   server.inject({
//     method: 'POST',
//     path: '/testCats1',
//     payload: {
//
//     }
//   })
//
//   t.pass();
//
// });
