const test = require('ava');
// TODO: separate connection for each test
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/forest-test', { useMongoClient: true });
const createServer = require('./helpers/createServer.js');
const CatModel = require('./fixtures/test-cat-model');
const CatModelTimestamps = require('./fixtures/test-cat-model-with-timestamp.js');

test.beforeEach(async t => {
  await t.notThrows(CatModel.remove({ fromTest: 'put' }));
  await t.notThrows(CatModelTimestamps.remove({ fromTest: 'put' }));
  await createServer(t);
});

test('create a new database entry', async t => {
  const server = t.context.server;
  const put = t.context.put;
  server.route({
    method: 'PUT',
    path: '/testCats1/{name}',
    handler: {
      forest: { model: CatModel }
    },
    config: {
      validate: {
        payload: server.plugins['hapi-forest'].stubJoi(CatModel, true),
      }
    }
  });

  const res = await put('PutCat1', { fromTest: 'put' });
  t.is(res.statusCode, 201, 'Status code is 201');

  const dbEntry = await CatModel.findOne({ name: 'PutCat1' }).lean();
  t.true(dbEntry !== null, 'db entry exists');
  t.is(dbEntry.name, 'PutCat1', 'entry has right name');
});

test('create a new database entry from model with timestamps', async t => {
  const server = t.context.server;
  const put = t.context.put;
  server.route({
    method: 'PUT',
    path: '/testCats1/{name}',
    handler: {
      forest: { model: CatModelTimestamps }
    },
    config: {
      validate: {
        payload: server.plugins['hapi-forest'].stubJoi(CatModel, true),
      }
    }
  });

  const res = await put('PutCatTimestamp', { fromTest: 'put', meta: { age: 2 } });
  t.is(res.statusCode, 201, 'Status code is 201');

  const dbEntry = await CatModelTimestamps.findOne({ name: 'PutCatTimestamp' }).lean();
  t.true(dbEntry !== null, 'db entry exists');
  t.is(dbEntry.name, 'PutCatTimestamp', 'entry has right name');
  t.is(dbEntry.meta.age, 2, 'entry has right meta');
});

test('update an existing database entry', async t => {
  const server = t.context.server;
  const put = t.context.put;
  server.route({
    method: 'PUT',
    path: '/testCats1/{name}',
    handler: {
      forest: { model: CatModel }
    },
    config: {
      validate: {
        payload: server.plugins['hapi-forest'].stubJoi(CatModel, true),
      }
    }
  });

  const res = await put('PutCat2', {
    fromTest: 'put',
    meta: { age: 2 },
    likes: [ 'yarn' ]
  });
  t.is(res.statusCode, 201, 'Status code is 201');
  t.is(res.result.meta.age, 2, 'returns right data');

  const dbEntry = await CatModel.findOne({ name: 'PutCat2' }).lean();
  t.true(dbEntry !== null, 'db entry exists');

  t.is(dbEntry.name, 'PutCat2', 'entry has right name');
  t.is(dbEntry.meta.age, 2, 'entry has right age');

  const res2 = await put('PutCat2', { fromTest: 'put', meta: { age: 1 } });
  t.is(res2.statusCode, 200, 'Status code is 200');

  const updatedDbEntry = await CatModel.findOne({ name: 'PutCat2' }).lean();
  t.true(updatedDbEntry !== null, 'db entry exists');
  t.is(updatedDbEntry.name, 'PutCat2', 'entry has the same name');
  t.is(updatedDbEntry.meta.age, 1, 'entry the updated age');
  t.falsy(updatedDbEntry.likes && updatedDbEntry.likes.length, 'document was overwritten');
});
