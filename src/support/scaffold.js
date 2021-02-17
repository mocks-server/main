/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

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
