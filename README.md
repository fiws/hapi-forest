hapi-forest
===========

[![package on npm](https://img.shields.io/npm/v/hapi-forest.svg)](https://www.npmjs.com/package/hapi-forest)
[![Travis branch](https://img.shields.io/travis/fiws/hapi-forest/master.svg)](https://travis-ci.org/fiws/hapi-forest)
![node 8+ required](https://img.shields.io/badge/node-8%2B-brightgreen.svg)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/fiws/hapi-forest/master/LICENSE)

![A FOREST](https://i.imgur.com/5l9cVaD.png)

Provides REST handlers for mongoose models. Can also generate ready to use
routes, for fast bootstrapping.

## Quickstart

1. Install it
  ```shell
  npm i --save hapi-forest # or yarn add hapi-forest if you prefer
  ```

2. Register the plugin.
  ```JavaScript
  // register hapi-forest
  server.register({
    register: require('hapi-forest'),
    options: {
      // add your models here for auto route generation
      bootstrap: [ require('./models/user-model') ]
    }
  });
  ```

3. Test your dynamically generated REST endpoints. [hapi-swagger](https://github.com/glennjones/hapi-swagger) works nicely with hapi-forest.

Take a look at the `example` directory for a full example.

## Plugin options

* `bootstrap: [ MongooseModel, MongooseModel, … ]`

  Will generate ready to use CRUD routes. hapi-forest will attempt to generate a basic
  joi schema based on the model.

## Handlers

You can use the `forest` handler and define your own routes, instead of auto-generating
them. This is useful if you need more control over your endpoints or want custom validation.

The forest handler behaves differently based on your route definition.
`GET`, `POST`, `PATCH` & `PUT` are supported.

#### URL parameter

For routes like `GET /collection/{name}`, the first URL parameter (`name` in this case)
is used as the "id". It will be used in the condition of the mongoose query.

`{id}` will translate to `_id` for convenience.

#### Generic Options for all methods

Option              | Description
:------------------ | :--------------------------------------------------------------------------------------
`model`             | **required** – The mongoose Model for this route.
`type`              | Overwrites the auto selected handler. Can be one of `getOne, getAll, post, put, delete`
`preQuery`          | A `Function` that gets passed the current mongoose query, that was generated by forest.
`transformResponse` | A `Function` that gets passed the response. You have to return the modified response.



### `getOne`

Returns all documents from the specified `model`.

* Only custom fields can be selected using `select`.
* the first parameter in the path (`name` in this example) will be used to query

```JavaScript
server.route({
  method: 'GET',
  path: '/users/{name}',
  handler: {
    forest: {
      model: User,
    }
  }
});


```

### `getAll`

Returns all documents from the specified `model`. The result will be streamed.

* Only custom fields can be selected using `select`.
* The `filterByQuery` option allows basic filtering of the results by sending a
query with the request. (`?group=nodejs&role=developer`)
  * the query that results from the user input can be modified with the `transformQuery` option.
  You can specify a function that has to return the updated query.
* The `allowLimit` option gives the client the ability to limit the number of results by
adding `$limit=x` to the query parameters.

```JavaScript
server.route({
  method: 'GET',
  path: '/users',
  handler: {
    forest: {
      model: User,
      select: 'firstName group lastName birthday',
    }
  }
});
```

### `post`

Creates a new document.

* `skipMongooseHooks` will use a faster mongoose create implementation, skipping all hooks.

```JavaScript
server.route({
  method: 'POST',
  path: '/users',
  handler: {
    forest: {
      model: User
    }
  }
});
```

### `put`

Updates an existing document or creates a new document if it does not exist.
For now an update will **not** overwrite and existing document but only update it,
like `patch` does.

* you can disallow creating new documents with `allowUpsert: false`. PUT will behave like PATCH in that case.

```JavaScript
server.route({
  method: 'PUT',
  path: '/users/{name}',
  handler: {
    forest: {
      model: User,
      allowUpsert: true,
    }
  }
});
```

### `delete`

Deletes a document.

* the first parameter in the path (`name` in this example) will be used to query

```JavaScript
server.route({
  method: 'DELETE',
  path: '/users/{name}',
  handler: {
    forest: {
      model: User,
    }
  }
});
```
