/*
Copyright 2019-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
import { readFileSync } from "fs";
import path from "path";

import { Core } from "@mocks-server/core";
import type { CoreInterface, Configuration } from "@mocks-server/core";
import { Plugin as AdminApi } from "@mocks-server/plugin-admin-api";
import { Plugin as InquirerCli } from "@mocks-server/plugin-inquirer-cli";
import { Plugin as OpenApi } from "@mocks-server/plugin-openapi";
import { Plugin as PluginProxy } from "@mocks-server/plugin-proxy";
import deepMerge from "deepmerge";

const DEFAULT_CONFIG: Configuration = {
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

export function createServer(userConfig: Configuration): CoreInterface {
  const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"));
  const config = userConfig ? deepMerge(DEFAULT_CONFIG, userConfig) : DEFAULT_CONFIG;
  return new Core(config, {
    pkg,
  });
}
