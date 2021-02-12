const fs = require("fs");
// const fsExtra = require("fs-extra");
const path = require("path");

const JSON_FILE_REGEXP = /\.json$/;

function scaffoldPath(filePath) {
  return path.resolve(__dirname, "..", "..", "scaffold", filePath);
}

function isJsonConfigFile(filePath) {
  return JSON_FILE_REGEXP.test(filePath);
}

function readScaffoldConfigFile() {
  return new Promise((resolve, reject) => {
    fs.readFile(scaffoldPath("mocks.config.js"), "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function writeConfigFile(filePath, fileContent) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, fileContent, "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function createConfigFile(filePath) {
  // Do not create config files as .json, as the user has changed it, so it knows enough about config
  if (isJsonConfigFile(filePath)) {
    return Promise.resolve();
  }
  return readScaffoldConfigFile().then((fileContent) => {
    return writeConfigFile(filePath, fileContent);
  });
}

module.exports = {
  createConfigFile,
};
