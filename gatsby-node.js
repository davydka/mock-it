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
