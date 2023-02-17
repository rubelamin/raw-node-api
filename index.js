/*
 * Title: First nodejs application
 * Description: Running qoutes randomly..
 * Author: Rubel Amin
 * Date: 13/02/2023
 */

// Dependencies
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const environment = require("./helpers/environments");
const data = require("./lib/data");

// App Object - Module Scaffolding
const app = {};

// testing file system
// data.delete("test", "newFile", (err) => {
//   console.log(`${err}`);
// });

// Configuration
app.config = {
  port: 3000,
};

// Create Server
app.createServer = () => {
  const server = http.createServer(app.handleRequest);
  server.listen(environment.port, () => {
    console.log(`Server running at port ${environment.port}`);
  });
};

// handle request response
app.handleRequest = handleReqRes;

// start the server
app.createServer();
