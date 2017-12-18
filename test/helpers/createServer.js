const hapi = require('hapi');

module.exports = async t => {
  const server = new hapi.Server({ port: 9999 }); // never started
  await t.notThrows(server.register(require('../../forest')));

  t.context.server = server;
  t.context.create = (payload) => server.inject({
    method: 'POST',
    url: '/testCats1',
    payload,
  });

  t.context.getAll = (q = '') => server.inject({
    method: 'GET',
    url: `/testCats1${q}`,
  });

  t.context.getOne = (id) => server.inject({
    method: 'GET',
    url: `/testCats1/${id}`,
  });

  t.context.put = (id, payload) => server.inject({
    method: 'PUT',
    url: `/testCats1/${id}`,
    payload,
  });

  t.context.patch = (id, payload) => server.inject({
    method: 'PATCH',
    url: `/testCats1/${id}`,
    payload,
  });

  return server;
};
