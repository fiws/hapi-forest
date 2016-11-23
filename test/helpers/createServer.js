const hapi = require('hapi');

module.exports = (t) => {
  return new Promise((resolve, reject) => {
    const server = new hapi.Server();
    server.connection({ port: 9999 }); // never started
    server.register({
      register: require('../../forest'),
    }, e => {
      if (e) return reject(e);
      t.true(e === undefined, 'no error');
      t.context.server = server;
      t.context.create = (payload) => {
        return server.inject({
          method: 'POST',
          url: '/testCats1',
          payload,
        })
      };

      t.context.getOne = (id) => {
        return server.inject({
          method: 'GET',
          url: `/testCats1/${id}`,
        });
      };

      resolve(server);
    });
  });
};