const test = require("ava");
// TODO: separate connection for each test
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/forest-test");
const createServer = require("./helpers/createServer.js");
const CatModel = require("./fixtures/test-cat-model");

test.beforeEach(async (t) => {
  await t.notThrows(CatModel.remove({ fromTest: "getAll" }));
  await createServer(t);
});

test("getAll", async (t) => {
  const server = t.context.server;
  const getAll = t.context.getAll;
  server.route({
    method: "GET",
    path: "/testCats1",
    handler: {
      forest: { model: CatModel },
    },
  });

  await CatModel.create({ name: "getAllCat", fromTest: "getAll" });

  const resGet = await getAll();
  t.is(resGet.statusCode, 200);
});

test("getAll limit", async (t) => {
  const server = t.context.server;
  const getAll = t.context.getAll;

  server.route({
    method: "GET",
    path: "/testCats1",
    handler: {
      forest: { model: CatModel },
    },
  });

  await CatModel.create({ name: "getAllLimitCat1", fromTest: "getAll" });
  await CatModel.create({ name: "getAllLimitCat2", fromTest: "getAll" });
  await CatModel.create({ name: "getAllLimitCat3", fromTest: "getAll" });

  const resGet = await getAll("?$limit=1");
  t.is(resGet.statusCode, 200);
  const res = JSON.parse(resGet.result);
  t.is(res.length, 1, "one result");

  const resGet2 = await getAll("?$limit=2");
  t.is(resGet2.statusCode, 200);
  const res2 = JSON.parse(resGet2.result);
  t.is(res2.length, 2, "two results");

  const resGetCrap = await getAll("?$limit=nope");
  t.is(resGetCrap.statusCode, 200);
  const resCrap = JSON.parse(resGetCrap.result);
  t.true(resCrap.length >= 3, "more than 2");
});

test("getAll limit does not affect filter", async (t) => {
  const server = t.context.server;
  const getAll = t.context.getAll;

  server.route({
    method: "GET",
    path: "/testCats1",
    handler: {
      forest: { model: CatModel, filterByQuery: true },
    },
  });

  await CatModel.create({ name: "getAllLimitFilterCat1", fromTest: "getAll" });
  await CatModel.create({ name: "getAllLimitFilterCat2", fromTest: "getAll" });
  await CatModel.create({ name: "getAllLimitFilterCat3", fromTest: "getAll" });

  const resGet = await getAll("?$limit=2&name=getAllLimitFilterCat3");
  t.is(resGet.statusCode, 200);
  const res = JSON.parse(resGet.result);
  t.is(res.length, 1, "one result");

  const resGetFilterAll = await getAll("?$limit=1&fromTest=getAll");
  t.is(resGetFilterAll.statusCode, 200);
  t.is(JSON.parse(resGetFilterAll.result).length, 1, "one result");

  const resGetFilterAllMore = await getAll("?$limit=2&fromTest=getAll");
  t.is(resGetFilterAllMore.statusCode, 200);
  t.is(JSON.parse(resGetFilterAllMore.result).length, 2, "two results");
});

test.todo("query test");
test.todo("empty db test");
test.todo("filled db");
