/*
 * Title: Routes
 * Description: Application routes
 * Author: Rubel Amin
 * Date: 13/02/2023
 */

// dependencies
const {
  sampleHandler,
  aboutHandler,
} = require("./handlers/routeHandlers/sampleHandler");
const { userHandler } = require("./handlers/routeHandlers/userHandler");

const routes = {
  sample: sampleHandler,
  about: aboutHandler,
  user: userHandler,
};

module.exports = routes;
