/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const { Core } = require("../../../../index");

const SERVER_PORT = 3100;

const defaultOptions = {
  port: SERVER_PORT,
  log: "silent",
  watch: false,
};

const fixturesFolder = (folderName) => {
  return path.resolve(__dirname, "..", "fixtures", folderName);
};

const startCore = (options = {}) => {
  const core = new Core({
    onlyProgrammaticOptions: true,
    plugins: options.plugins,
  });

  return core
    .init({
      ...defaultOptions,
      ...options,
    })
    .then(() => {
      return core.start().then(() => {
        return Promise.resolve(core);
      });
    });
};

module.exports = {
  startCore,
  fixturesFolder,
};
