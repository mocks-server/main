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
