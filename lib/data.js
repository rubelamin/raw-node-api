// dependencies
const fs = require("fs");
const path = require("path");

const lib = {};

// bas edirectory of the data folder
lib.basedir = path.join(__dirname, "/../.data/");

// write data to file
lib.create = function (dir, file, data, callback) {
  // open file for writing
  fs.open(
    lib.basedir + dir + "/" + file + ".json",
    "wx",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // convert data to string
        const stringData = JSON.stringify(data);

        // write data to file and then close it
        fs.writeFile(fileDescriptor, stringData, (err2) => {
          if (!err2) {
            fs.close(fileDescriptor, (err3) => {
              if (!err3) {
                callback(false);
              } else {
                callback("Error closing the new file");
              }
            });
          } else {
            callback("Error writing to new file!");
          }
        });
      } else {
        callback("Error happen, file may exists");
      }
    }
  );
};

// read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.basedir + dir}/${file}.json`, "utf8", (err, data) => {
    callback(err, data);
  });
};

// update existing file
lib.update = (dir, file, data, callback) => {
  fs.open(`${lib.basedir + dir}/${file}.json`, "r+", (err, filedescriptor) => {
    if (!err && filedescriptor) {
      // convert data to string
      const stringData = JSON.stringify(data);

      // truncate the file
      fs.ftruncate(filedescriptor, (err2) => {
        if (!err2) {
          // write to the file
          fs.writeFile(filedescriptor, stringData, (err3) => {
            if (!err3) {
              // close the file
              fs.close(filedescriptor, (err4) => {
                if (!err4) {
                  callback(false);
                } else {
                  callback("Error to write file in fs close");
                }
              });
            } else {
              callback("Error writing file in err3");
            }
          });
        } else {
          callback("Error truncating file in err2");
        }
      });
    } else {
      callback("Error happen, file may not exists");
    }
  });
};

// delete existing file
lib.delete = (dir, file, callback) => {
  // unlink or delete
  fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting file");
    }
  });
};

module.exports = lib;
