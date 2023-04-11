/*
 * Title: Initial File
 * Description: Initial file statrt the node server and workers..
 * Author: Rubel Amin
 * Date: 13/02/2023
 */

// Dependencies
const server = require("./lib/server");
const workers = require("./lib/worker");

const environment = require("./helpers/environments");
const data = require("./lib/data");

// App Object - Module Scaffolding
const app = {};

app.init = () => {
  // start the server
  server.init();

  // start the worker
  workers.init();
};

app.init();

// export the app
module.exports = app;
