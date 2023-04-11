/*
 * Title: Check handler
 * Description: User define check
 * Author: Rubel Amin
 * Date: 13/02/2023
 */

// dependencies
const data = require("../../lib/data");
const { createRandomString, parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("../../helpers/environments");

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];

  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405, {
      message: "this method is not allowed",
    });
  }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
  // validate inputs
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;
  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // verify token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    // look up the user phone
    data.read("tokens", token, (err1, tokenData) => {
      if (!err1 && tokenData) {
        let userPhone = parseJSON(tokenData).phone;
        // look up the user data
        data.read("users", userPhone, (err2, userData) => {
          if (!err2 && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                let userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                if (userChecks.length < 5) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    phone: userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };
                  // save the object
                  data.create("checks", checkId, checkObject, (err3) => {
                    if (!err3) {
                      // add check id to the users object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      // save the new user data
                      data.update("users", userPhone, userObject, (err4) => {
                        if (!err4) {
                          // return the data about the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: "There was a problem to update data.",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: "There was a problem in the server side.",
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error: "User alreay reach max check limit",
                  });
                }
              } else {
                callback(403, {
                  error: "Authentication failed.",
                });
              }
            });
          } else {
            callback(403, {
              error: "User not found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication problem",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request.",
    });
  }
};

handler._check.get = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // look up the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        // verify token

        let token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).phone,
          (tokenIsValid) => {
            // console.log(tokenIsValid);
            if (tokenIsValid) {
              callback(200, parseJSON(checkData));
            } else {
              callback(403, {
                error: "Authentication failure",
              });
            }
          }
        );
      } else {
        callback(500, {
          error: "There was a problem with your request",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem with your request",
    });
  }
};

handler._check.put = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;
  // validate inputs
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;
  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read("checks", id, (err1, checkData) => {
        if (!err1 && checkData) {
          let checkObject = parseJSON(checkData);
          let token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;

          tokenHandler._token.verify(
            token,
            checkObject.phone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkObject.timeoutSeconds = timeoutSeconds;
                }
                // store the check object
                data.update("checks", id, checkObject, (err2) => {
                  if (!err2) {
                    callback(200);
                  } else {
                    callback(500, {
                      error: "There was a problem in the server side",
                    });
                  }
                });
              } else {
                callback(403, {
                  error: "Authorization Failiure",
                });
              }
            }
          );
        } else {
          callback(500, {
            error: "There was a problem in the server side",
          });
        }
      });
    } else {
      callback(400, {
        error: "You must provide at least one fields",
      });
    }
  } else {
    callback(400, {
      error: "There was a problem with your request",
    });
  }
};

handler._check.delete = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // look up the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        // verify token

        let token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).phone,
          (tokenIsValid) => {
            // console.log(tokenIsValid);
            if (tokenIsValid) {
              // delete the check data
              data.delete("checks", id, (err1) => {
                if (!err1) {
                  data.read(
                    "users",
                    parseJSON(checkData).phone,
                    (err2, userData) => {
                      let userObject = parseJSON(userData);
                      if (!err2 && userData) {
                        let userChecks =
                          typeof userObject.checks === "object" &&
                          userObject.checks instanceof Array
                            ? userObject.checks
                            : [];

                        // remove the deleted check id from the user check list
                        let checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // save the user data
                          userObject.checks = userChecks;
                          data.update(
                            "users",
                            userObject.phone,
                            userObject,
                            (err3) => {
                              if (!err3) {
                                callback(200);
                              } else {
                                callback(500, {
                                  error: "There was a server side problem",
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            error: "check id not found in user check filed",
                          });
                        }
                      } else {
                        callback(500, {
                          error: "There was a server side problem",
                        });
                      }
                    }
                  );
                } else {
                  callback(500, {
                    error: "There was a server side problem",
                  });
                }
              });
            } else {
              callback(403, {
                error: "Authentication failure",
              });
            }
          }
        );
      } else {
        callback(500, {
          error: "There was a problem with your request",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem with your request",
    });
  }
};

module.exports = handler;
