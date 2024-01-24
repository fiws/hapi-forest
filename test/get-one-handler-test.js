const test = require("ava");
// TODO: separate connection for each test
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/forest-test");
const createServer = require("./helpers/createServer.js");
const CatModel = require("./fixtures/test-cat-model");

let testId;
// cleanup previous test runs
test.before(async () => {
  await CatModel.remove({ fromTest: "getOne" });

  const res = await CatModel.create({
    name: "GetOneCat1",
    fromTest: "getOne",
  });
  testId = res._id.toString();
});

test.beforeEach(async (t) => {
  await createServer(t);
});

test("getOne for {id}", async (t) => {
  const server = t.context.server;
  const getOne = t.context.getOne;

  server.route({
    method: "GET",
    path: "/testCats1/{id}",
    handler: {
      forest: { model: CatModel },
    },
  });

  const resGet = await getOne(testId);
  t.is(resGet.statusCode, 200);
});

test("getOne for {name}", async (t) => {
  const server = t.context.server;
  const getOne = t.context.getOne;

  server.route({
    method: "GET",
    path: "/testCats1/{name}",
    handler: {
      forest: { model: CatModel },
    },
  });

  const resGetId = await getOne(testId);
  t.is(resGetId.statusCode, 404, "by id does not work");

  const resGetByName = await getOne("GetOneCat1");
  t.is(resGetByName.statusCode, 200, "by name works");
  t.is(resGetByName.result._id.toString(), testId, "is the same cat");
});
