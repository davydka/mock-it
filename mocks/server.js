const { setupServer } = require('msw/node/lib/index');

const handlers = require('./handlers');

const server = setupServer(...handlers);

module.exports = server;
