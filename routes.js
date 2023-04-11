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
const { tokenHandler } = require("./handlers/routeHandlers/tokenHandler");
const { checkHandler } = require("./handlers/routeHandlers/checkHandler");

const routes = {
  sample: sampleHandler,
  about: aboutHandler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};

module.exports = routes;
