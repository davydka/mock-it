const { rest } = require("msw");
const posts = require("./models/posts");

const baseApi = 'https://localhost:3000/api';

module.exports = [
  rest.get(`${baseApi}/posts`, (req, res, ctx) => {
    return res(ctx.json(posts));
  }),
];
