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
};

environments.production = {
  port: 6000,
  envName: "production",
  secretKey: "osrtinlasdjfhvn",
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
