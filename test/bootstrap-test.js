const test = require("ava");
const hapi = require("@hapi/hapi");

test("register without errors (no opts)", async (t) => {
  const server = new hapi.Server();
  await t.notThrows(server.register(require("../forest")));
});

test("register and bootstrap", async (t) => {
  const server = new hapi.Server(); // will never be used
  server.validator(require("joi"));

  await server.register({
    plugin: require("../forest"),
    options: {
      bootstrap: [require("./fixtures/test-cat-model")],
    },
  });
  t.pass();
  // TODO: check for routes
});
