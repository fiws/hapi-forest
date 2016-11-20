const test = require('ava');
const hapi = require('hapi');
// TODO: separate connection for each test
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('localhost');
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

test('create a new database entry', async t => {
  const send = t.context.send;
  const res = await send({
    name: 'PostCat1',
  });

  t.is(res.statusCode, 201, 'Status code is 201');

  const dbEntry = await CatModel.findOne({ name: 'PostCat1' }).lean();
  t.true(dbEntry !== null, 'db entry exists');
  t.is(dbEntry.name, 'PostCat1', 'entry has right name');
  t.pass();
});

test('do not allow duplicate entries', async t => {
  const send = t.context.send;
  const res = await send({
    name: 'testCat2',
    meta: { age: 1 },
  });
  t.is(res.statusCode, 201, 'Status code is 201 for first POST');

  const res2 = await send({
    name: 'testCat2',
    meta: { age: 2 },
  });
  t.is(res2.statusCode, 409, 'Status code is 409 (conflict) for second POST');
  t.is(res2.result.message, 'Entry with that name already exists');

  const dbEntry = await CatModel.findOne({ name: 'testCat2' }).lean();
  t.true(dbEntry !== null, 'db entry exists');
  t.is(dbEntry.name, 'testCat2', 'entry has right name');
  t.is(dbEntry.meta.age, 1, 'entry has right age');
  t.pass();
});

test.after.always(t => {
  return t.notThrows(CatModel.remove({}));
});
