/*
 * Title: Server library
 * Description: Server related files..
 * Author: Rubel Amin
 * Date: 11/04/2023
 */

// Dependencies
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes");

// const environment = require("../helpers/environments");
// const data = require("../lib/data");

// App Object - Module Scaffolding
const server = {};

// Configuration
server.config = {
  port: 3000,
};

// Create Server
server.createServer = () => {
  const serverVariable = http.createServer(server.handleRequest);
  serverVariable.listen(server.config.port, () => {
    console.log(`Server running at port ${server.config.port}`);
  });
};

// handle request response
server.handleRequest = handleReqRes;

// start the server
server.init = () => {
  server.createServer();
};

module.exports = server;
