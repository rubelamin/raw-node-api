/*
 * Title: Sample handler
 * Description: Sample handler
 * Author: Rubel Amin
 * Date: 13/02/2023
 */

// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
  callback(200, {
    message: "This is sample url",
  });
};

handler.aboutHandler = (requestProperties, callback) => {
  //   console.log(requestProperties);
  callback(200, {
    message: "This is about Url",
  });
};

module.exports = handler;
