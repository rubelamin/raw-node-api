/*
 * Title: User handler
 * Description: User handler for doing something
 * Author: Rubel Amin
 * Date: 13/02/2023
 */

// dependencies
const data = require("../../lib/data");
const { hash, parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];

  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405, {
      message: "this method is not allowed",
    });
  }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 5
      ? requestProperties.body.password
      : false;

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean"
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure the user doeas not exist
    data.read("users", "phone", (err) => {
      if (err) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        // store the user to db
        data.create("users", phone, userObject, (err1) => {
          if (!err1) {
            callback(200, { message: "User was created successfully" });
          } else {
            callback(500, { error: "There was a problem to create user" });
          }
        });
      } else {
        callback(500, {
          error: "there was a problem. user may already exists.",
        });
      }
    });
  } else {
    callback(400, {
      error: "There is a problem your typing",
    });
  }
};

handler._users.get = (requestProperties, callback) => {
  // check the phone/userid if valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    // verify token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        // look up the user
        data.read("users", phone, (err, u) => {
          const user = { ...parseJSON(u) };
          if (!err && user) {
            delete user.password;
            callback(200, user);
          } else {
            callback(400, {
              error: "Something went wrong",
            });
          }
        });
      } else {
        callback(403, {
          error: "Not authenticated",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested user was not found",
    });
  }
};

handler._users.put = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 5
      ? requestProperties.body.password
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      // verify token
      let token =
        typeof requestProperties.headersObject.token === "string"
          ? requestProperties.headersObject.token
          : false;
      tokenHandler._token.verify(token, phone, (tokenId) => {
        if (tokenId) {
          // look up the user
          data.read("users", phone, (err1, uData) => {
            const userData = { ...parseJSON(uData) };
            if (!err1 && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }
              // store to update database
              data.update("users", phone, userData, (err2) => {
                if (!err2) {
                  callback(200, {
                    message: "The user was updated succesfully",
                  });
                } else {
                  callback(500, {
                    error: "There was a problem in the server side",
                  });
                }
              });
            } else {
              callback(400, {
                error: "Something went wrong!",
              });
            }
          });
        } else {
          callback(403, {
            error: "Not authenticated",
          });
        }
      });
    } else {
      callback(400, {
        error: "You have a problem in your request.",
      });
    }
  } else {
    callback(400, {
      error: "Invalid phone number. Please try again later.",
    });
  }
};

handler._users.delete = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    // verify token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        // look up the database
        data.read("users", phone, (err1, datas) => {
          if (!err1 && datas) {
            data.delete("users", phone, (err2) => {
              if (!err2) {
                callback(200, {
                  message: "User was deleted successfully",
                });
              } else {
                callback(500, {
                  error: "There was an error to delete the user",
                });
              }
            });
          } else {
            callback(500, {
              error: "There was server side error!",
            });
          }
        });
      } else {
        callback(403, {
          error: "Not authenticated",
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
