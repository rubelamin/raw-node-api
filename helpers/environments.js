/*
 * Title: Environments
 * Description: Handle all environment related things
 * Author: Rubel Amin
 * Date: 16/02/2023
 */

// dependencies

// module scaffoldin
const environments = {};

environments.staging = {
  port: 3000,
  envName: "staging",
  secretKey: "ksdfkajsdioert",
  maxCheks: 5,
  twilio: {
    fromPhone: "+15076323009",
    accountSid: "AC3bf23b7a855a44f50732d4ea823e3bd8",
    authToken: "f606be181fc2302939926ca09ad33216",
  },
};

environments.production = {
  port: 6000,
  envName: "production",
  secretKey: "osrtinlasdjfhvn",
  maxCheks: 5,
  twilio: {
    fromPhone: "+15076323009",
    accountSid: "AC3bf23b7a855a44f50732d4ea823e3bd8",
    authToken: "f606be181fc2302939926ca09ad33216",
  },
};

// detrmine which environment was passed

const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : staging;

// export corresponding environement

const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentToExport;
