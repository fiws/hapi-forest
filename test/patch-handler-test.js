const test = require("ava");
// TODO: separate connection for each test
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/forest-test");
const createServer = require("./helpers/createServer.js");
const CatModel = require("./fixtures/test-cat-model");
const CatModelTimestamps = require("./fixtures/test-cat-model-with-timestamp.js");

test.beforeEach(async (t) => {
  await t.notThrows(CatModel.remove({ fromTest: "patch" }));
  await t.notThrows(CatModelTimestamps.remove({ fromTest: "patch" }));
  await createServer(t);
});

test("update existing db entry", async (t) => {
  const server = t.context.server;
  const patch = t.context.patch;

  CatModel.create({ name: "PatchCat1", fromTest: "patch" });
  server.route({
    method: "PATCH",
    path: "/testCats1/{name}",
    handler: {
      forest: { model: CatModel },
    },
    config: {
      validate: {
        payload: server.plugins["hapi-forest"].stubJoi(CatModel, true),
      },
    },
  });

  const res = await patch("PatchCat1", { likes: ["patch"], fromTest: "patch" });
  t.is(res.statusCode, 200, "Status code is 200");
  t.deepEqual(res.result.likes, ["patch"], "Response payload includes change");

  const dbEntry = await CatModel.findOne({ name: "PatchCat1" }).lean();
  t.true(dbEntry !== null, "db entry exists");
  t.is(dbEntry.name, "PatchCat1", "entry has right name");
  t.is(dbEntry.likes[0], "patch", "entry was updates");
});

test("fail to update non existent entry", async (t) => {
  const server = t.context.server;
  const patch = t.context.patch;

  server.route({
    method: "PATCH",
    path: "/testCats1/{name}",
    handler: {
      forest: { model: CatModel },
    },
    config: {
      validate: {
        payload: server.plugins["hapi-forest"].stubJoi(CatModel, true),
      },
    },
  });

  const res = await patch("NoPatchCat1", {
    likes: ["patch"],
    fromTest: "patch",
  });
  t.is(res.statusCode, 404, "Status code is 404");

  const dbEntry = await CatModel.findOne({ name: "NoPatchCat1" }).lean();
  t.true(dbEntry === null, "db entry does not exists");
});
