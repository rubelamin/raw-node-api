/*
 * Title: Utilities
 * Description: Important utilities functions
 * Author: Rubel Amin
 * Date: 16/02/2023
 */

// dependencies
const crypto = require("crypto");
const environments = require("./environments");

// module scaffoldin
const utilities = {};

// parse JSON string to object
utilities.parseJSON = (jsonstring) => {
  let output;
  try {
    output = JSON.parse(jsonstring);
  } catch {
    output = {};
  }

  return output;
};

// convert password to hash
utilities.hash = (password) => {
  if (typeof password === "string" && password.length > 0) {
    const hash = crypto
      .createHmac("sha256", environments.secretKey)
      .update(password)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// create random string
utilities.createRandomString = (stringlength) => {
  let strlength = stringlength;
  strlength =
    typeof stringlength === "number" && stringlength > 0 ? stringlength : false;
  if (strlength) {
    let possiblecharecters = "abcdefghijklmnopqrstuvwxyz1234567890";
    let output = "";
    for (let i = 1; i <= strlength; i += 1) {
      let randomCharacter = possiblecharecters.charAt(
        Math.floor(Math.random() * possiblecharecters.length)
      );
      output += randomCharacter;
    }
    return output;
  }
  return false;
};

module.exports = utilities;
