/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const commander = require("commander");
const { omitBy, isUndefined } = require("lodash");

const { stringToBoolean } = require("./helpers");

const defaultOptions = {
  port: 3100,
  host: "0.0.0.0",
  log: "info",
  feature: null,
  delay: 0,
  watch: true,
  recursive: true,
  cli: true
};

const get = () => {
  const userOptions = commander
    .option("--host <host>", "Host for server")
    .option("--port <port>", "Port for server", parseInt)
    .option("--log <log>", "Log level")
    .option("--feature <feature>", "Define current feature")
    .option("--delay <delay>", "Define delay time")
    .option("--features <features>", "Define folder from which load features")
    .option("--watch", "Watch or not", stringToBoolean)
    .option("--recursive", "Load features recursively", stringToBoolean)
    .option("--cli <cli>", "Use provided CLI", stringToBoolean)
    .parse(process.argv);

  return {
    ...defaultOptions,
    ...omitBy(
      {
        port: userOptions.port,
        host: userOptions.host,
        log: userOptions.log,
        feature: userOptions.feature,
        delay: userOptions.delay,
        features: userOptions.features,
        watch: userOptions.watch,
        recursive: userOptions.recursive,
        cli: userOptions.cli
      },
      isUndefined
    )
  };
};

module.exports = {
  get,
  defaultOptions
};
