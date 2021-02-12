const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");

function scaffoldPath(filePath) {
  return path.resolve(__dirname, "..", "..", "scaffold", filePath);
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
  return readScaffoldConfigFile().then((fileContent) => {
    return writeConfigFile(filePath, fileContent);
  });
}

function createMocksFolder(destPath) {
  fsExtra.copySync(scaffoldPath("mocks"), destPath);
}

module.exports = {
  createConfigFile,
  createMocksFolder,
};
