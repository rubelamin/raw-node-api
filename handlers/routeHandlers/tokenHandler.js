/*
 * Title: Token handler
 * Description: Token handler for Authorizing
 * Author: Rubel Amin
 * Date: 13/02/2023
 */

// dependencies
const data = require("../../lib/data");
const {
  hash,
  createRandomString,
  parseJSON,
} = require("../../helpers/utilities");

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];

  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405, {
      message: "this method is not allowed",
    });
  }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
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

  if (phone && password) {
    data.read("users", phone, (err1, userData) => {
      let hashPasswred = hash(password);
      if (hashPasswred === parseJSON(userData).password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone: phone,
          id: tokenId,
          expires: expires,
        };

        // store the token object
        data.create("tokens", tokenId, tokenObject, (err2) => {
          if (!err2) {
            callback(200, tokenObject);
          } else {
            callback(500, {
              error: "Token creation problem",
            });
          }
        });
      } else {
        callback(400, {
          error: "Pasword is not valid",
        });
      }
    });
  } else {
    callback(400, {
      error: "There is a problem your typing",
    });
  }
};

handler._token.get = (requestProperties, callback) => {
  // check the id if valid
  const tid =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (tid) {
    // look up the token
    data.read("tokens", tid, (err, tokenData) => {
      //   console.log(tokenData);
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        // delete token.password;
        callback(200, token);
      } else {
        callback(400, {
          error: "Something went wrong! token not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested token was not found",
    });
  }
};

handler._token.put = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? true
      : false;

  if (id && extend) {
    data.read("tokens", id, (err1, tokenData) => {
      let tokenObject = parseJSON(tokenData);
      if (tokenObject.expires > Date.now()) {
        tokenObject.expires = Date.now() + 60 * 60 * 1000;
        // store the updated token
        data.update("tokens", id, tokenObject, (err2) => {
          if (!err2) {
            callback(200);
          } else {
            callback(500, {
              error: "There was a server side error.",
            });
          }
        });
      } else {
        callback(400, {
          error: "Token already expired.",
        });
      }
    });
  } else {
    callback(400, {
      error: "there was a problem in your request",
    });
  }
};

handler._token.delete = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // look up the database
    data.read("tokens", id, (err1, tokenData) => {
      if (!err1 && tokenData) {
        data.delete("tokens", id, (err2) => {
          if (!err2) {
            callback(200, {
              message: "Token was deleted successfully",
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
    callback(400, {
      error: "There was a problem with your request",
    });
  }
};

handler._token.verify = (id, phone, callback) => {
  data.read("tokens", id, (err, tokenData) => {
    // console.log(parseJSON(tokenData).phone === phone);
    // console.log(parseJSON(tokenData).expires > Date.now());
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phone === phone &&
        parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handler;
