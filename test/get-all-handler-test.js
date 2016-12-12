const test = require('ava');
// TODO: separate connection for each test
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('localhost');
const createServer = require('./helpers/createServer.js');
const CatModel = require('./fixtures/test-cat-model');

test.beforeEach(async t => {
  await t.notThrows(CatModel.remove({ fromTest: 'getAll' }));
  await createServer(t);
});

test('getAll', async t => {
  const server = t.context.server;
  const getAll = t.context.getAll;

  server.route({
    method: 'GET',
    path: '/testCats1',
    handler: {
      forest: { model: CatModel }
    }
  });

  await CatModel.create({ name: 'getAllCat', fromTest: 'getAll' });

  const resGet = await getAll();
  t.is(resGet.statusCode, 200);
});

test.todo('query test');
test.todo('empty db test');
test.todo('filled db');
