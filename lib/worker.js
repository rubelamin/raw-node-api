/*
 * Title: Workers library
 * Description: Workers related files..
 * Author: Rubel Amin
 * Date: 11/04/2023
 */

// Dependencies
const url = require("url");
const http = require("http");
const https = require("https");
const data = require("./data");
const { parseJSON } = require("../helpers/utilities");
const { sendTwilioSms } = require("../helpers/notifications");

// worker Object - Module Scaffolding
const worker = {};

// lookup all the checks
worker.gatherAllChecks = () => {
  // get al the checks
  data.list("checks", (err1, checks) => {
    if (!err1 && checks && checks.length > 0) {
      checks.forEach((check) => {
        data.read("checks", check, (err2, originalCheckData) => {
          if (!err2 && originalCheckData) {
            // pass the data to the check validator
            worker.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log("Error: reading one of the checks data!");
          }
        });
      });
    } else {
      console.log("Error: could not find any checks to proccess");
    }
  });
};

// validate individual check data
worker.validateCheckData = (originalData) => {
  let originalCheckData = originalData;
  if (originalCheckData && originalCheckData.id) {
    originalCheckData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";

    originalCheckData.lastChecked =
      typeof originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

    // pass to the next proccess
    worker.performCheck(originalCheckData);
  } else {
    console.log("Error: check was invalid or not properly formatted!");
  }
};

// perform check
worker.performCheck = (originalCheckData) => {
  // prepare the initial check outcome
  let checkOutCome = {
    error: false,
    responseCode: false,
  };
  // mark the outcome has not been sent yet
  let outComeSent = false;
  // parse the hostname & full url from original data
  const parseUrl = url.parse(
    originalCheckData.protocol + "://" + originalCheckData.url,
    true
  );
  const hostName = parseUrl.hostname;
  const path = parseUrl.path;

  // construct the request
  const requestDetails = {
    protocol: originalCheckData.protocol + ":",
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };
  const protocolToUse = originalCheckData.protocol === "http" ? http : https;

  let req = protocolToUse.request(requestDetails, (res) => {
    // grab the status of the response
    const status = res.statusCode;

    // update the check outcome and pass to the next proccess
    checkOutCome.responseCode = status;
    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });

  req.on("error", (e) => {
    checkOutCome = {
      error: true,
      value: e,
    };

    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });

  req.on("timeout", (e) => {
    checkOutCome = {
      error: true,
      value: "timeout",
    };

    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });

  // req send
  req.end();
};
// save check outcome to database and send to next process
worker.processCheckOutCome = (originalCheckData, checkOutCome) => {
  // check if check out come is up or down
  let state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1
      ? "up"
      : "down";

  // decide whether we should alert the user or not
  let alertWanted =
    originalCheckData.lastChecked && originalCheckData.state !== state
      ? true
      : false;

  // update the check data
  let newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // update the check to disk
  data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        // send the check data to the next process
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Alert is not needed as there is no state change");
      }
    } else {
      console.log("Error: trying to save check data of one of the checks!");
    }
  });
};

// send notification sms to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
  let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is currently ${newCheckData.state}`;

  sendTwilioSms(newCheckData.phone, msg, (err) => {
    if (!err) {
      console.log(`User was alerted to a status change via SMS: ${msg}`);
    } else {
      console.log("There was a problem sending sms to one of the user!");
    }
  });
};

// timer to execute the worker process onece per minute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 8000);
};

// start the worker
worker.init = () => {
  // execute all the checks
  worker.gatherAllChecks();

  // call the loop so that checks continue
  worker.loop();
};

module.exports = worker;
