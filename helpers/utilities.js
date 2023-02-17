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
  } catch (error) {
    output = {};
    console.log(error);
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

module.exports = utilities;
