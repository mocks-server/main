/*
Copyright 2019-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const Core = require("@mocks-server/core");
const PluginProxy = require("@mocks-server/plugin-proxy");
const AdminApi = require("@mocks-server/plugin-admin-api");
const InquirerCli = require("@mocks-server/plugin-inquirer-cli");
const OpenApi = require("@mocks-server/plugin-openapi").default;
const deepMerge = require("deepmerge");

const pkg = require("../package.json");

const DEFAULT_CONFIG = {
  config: {
    readArguments: false,
    readEnvironment: false,
    readFile: false,
  },
  plugins: {
    register: [PluginProxy, AdminApi, InquirerCli, OpenApi],
    inquirerCli: {
      enabled: false,
    },
  },
  files: {
    enabled: false,
  },
};

const createCore = (userConfig) => {
  const config = userConfig ? deepMerge(DEFAULT_CONFIG, userConfig) : DEFAULT_CONFIG;
  return new Core(config, {
    pkg,
  });
};

module.exports = {
  createCore,
};
