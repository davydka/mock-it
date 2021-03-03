# Mock it till you make it - with MSW

<i>— David Whitely</i>

[MSW](https://mswjs.io/) is an api mocking library that uses service workers. When your application performs an http request, it gets intercepted by the service worker. Instead of returning the result from cache, it returns the mocked result you want. Since the interception happens at the network level, the application is unaware of the mocking that is going on.

## Why we used it on Outdoorsy

The [Outdoorsy](https://outdoorsy.com) project was originally using [Mirage](https://miragejs.com/), another api mocking library. The killer feature in Mirage for Outdoorsy was the concept of [traits](https://miragejs.com/docs/main-concepts/factories/#traits). Traits allow one to mock different scenarios based on one initial data state. For instance, a default api mock for a blog post might have a boolean `published` set to `false`. With traits, one can use the base `post` Model and extend it to have the `published` flag set to `true`, as well as any other data attributes changed (`publishedDate`, for instance). In one's tests, they can now call up the published or unpublished version of the data and write their tests.

The main drawback for Mirage is that it is client side only. This makes it impossible to use the library for mocking server side rendering, which is an important part of two of the most popular React frameworks, Gatsby and Next.js.

## Setting up MSW for SSR

For fun, we can walk through using MSW to create pages in Gatsby.

* Use the gatsby cli to create a site from a starter: `gatsby new mock-it https://github.com/davydka/gatsby-starter-typescript-sass`
* Install MSW: `yarn add msw --dev`
* Create a `mocks/handlers.js` file. This handler file can be used both server-side and client-side. Notice the placeholder `baseApi`, which assumes the location of our data server. MSW will be overriding calls to this api.
```js
const { rest } = require("msw");
const posts = require("./models/posts");

const baseApi = 'https://localhost:3000/api';

module.exports = [
  rest.get(`${baseApi}/posts`, (req, res, ctx) => {
    return res(ctx.json(posts));
  }),
];
```
* Create your data models. The content here is really up to your api requirements and business needs. You can use static files, tools such as `faker` to help build mock data, and schema.org to help plan out your data model. For our purposes, we will use an overly simple blog posts model. Create a `mocks/models/posts.js` file.
```js
module.exports = [
  {
    id: 123,
    title: 'Blogs are for the dogs',
    body:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 456,
    title: 'Blogs are for the cats',
    body:
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    id: 789,
    title: 'Blogs are for the everyone',
    body:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  },
];
```
* From here, we need to integrate our mocked data. We can decide to do this in the browser or in Node. The handler we wrote previously will work with both solutions. In this case, we'll use Node to demonstrate using MSW as a mock SSR solution. Create a `mocks/server.js` file.
```js
const { setupServer } = require('msw/node/lib/index');

const handlers = require('./handlers');

const server = setupServer(...handlers);

module.exports = server;
```
* For Gatsby, we can use the `createPages` method in the `gatsby-node.js` file to generate SSR pages from an api endpoint. Create a `gatsby-node.js` file.
```js
const path = require('path');
const fetch = require('node-fetch');
const server = require('./mocks/server.js');

const baseApi = 'https://localhost:3000/api';

// use MSW for mock data to test or develop
if (process.env.NODE_ENV === 'mock') {
  server.listen();
}

exports.createPages = async ({ actions }) => {
  const { createPage } = actions;

  const data = await fetch(`${baseApi}/posts`)
    .then(response => response.json())
    .then(data => data)
    .catch(err => console.log(err));

  data?.forEach(post => {
    createPage({
      path: `/post/${post.id}/`,
      component: path.resolve('./src/pages/post.tsx'),
      context: { post },
    });
  });
};
```
* Notice that when we use `yarn start` get a connection refused error from the api (in the terminal, `code: 'ECONNREFUSED'`). We can use environment variables to tell MSW to override our currently non-existent api and use our mock data. Add the following to `package.json`:
  ```js
  "start:mock": "NODE_ENV=mock gatsby develop",
  ```
  * Run `yarn start:mock` and navigate to `http://localhost:8000/post/123`. See that mock data is used for the post pages.

* You can now follow [further instructions](https://mswjs.io/docs/getting-started/integrate/browser) on MSW's documentation to setup a client-side service worker and we will have a mocking solution for both SSR and client api calls. Further work can be done to integrate MSW into Cypress, Jest, and even Storybook.
  * Hint: For the client portion of the Gatsy site, use the MSW cli to generate a serviceWorker for testing in the web browser: `npx msw init static/ --save`

