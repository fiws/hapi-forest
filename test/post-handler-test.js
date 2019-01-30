const test = require('ava');
// TODO: separate connection for each test
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/forest-test');
const createServer = require('./helpers/createServer.js');
const CatModel = require('./fixtures/test-cat-model');

test.beforeEach(async t => {
  await t.notThrows(t.notThrows(CatModel.remove({ fromTest: 'post' })));
  const server = await createServer(t);
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
});

test('respond with 400 for invalid payload', async t => {
  const create = t.context.create;
  const a = await create('');
  t.true(a.statusCode === 400, 'empty payload');
  // const b = await create({});
  // t.true(b.statusCode === 400, 'empty object');
  const c = await create({ wrong: 1 });
  t.true(c.statusCode === 400, 'wrong attributes');
  const d = await create({ born: 'wrong type' });
  t.true(d.statusCode === 400, 'wrong type');
});

test('create a new database entry', async t => {
  const create = t.context.create;
  const res = await create({
    name: 'PostCat1',
    fromTest: 'post',
  });

  t.is(res.statusCode, 201, 'Status code is 201');

  const dbEntry = await CatModel.findOne({ name: 'PostCat1' }).lean();
  t.true(dbEntry !== null, 'db entry exists');
  t.is(dbEntry.name, 'PostCat1', 'entry has right name');
});

test('do not allow duplicate entries', async t => {
  const create = t.context.create;
  const res = await create({
    name: 'testCat2',
    meta: { age: 1 },
    fromTest: 'post',
  });
  t.is(res.statusCode, 201, 'Status code is 201 for first POST');

  const res2 = await create({
    name: 'testCat2',
    meta: { age: 2 },
    fromTest: 'post',
  });
  t.is(res2.statusCode, 409, 'Status code is 409 (conflict) for second POST');
  t.is(res2.result.message, 'Entry with that name already exists');

  const dbEntry = await CatModel.findOne({ name: 'testCat2' }).lean();
  t.true(dbEntry !== null, 'db entry exists');
  t.is(dbEntry.name, 'testCat2', 'entry has right name');
  t.is(dbEntry.meta.age, 1, 'entry has right age');
});
