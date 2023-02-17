/*
 * Title: Not Found handler
 * Description: Not Found handler
 * Author: Rubel Amin
 * Date: 13/02/2023
 */

// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
  console.log(requestProperties);

  callback(404, {
    message: "The requested url was not found.",
  });
};

module.exports = handler;
