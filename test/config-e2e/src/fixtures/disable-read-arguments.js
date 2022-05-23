const Config = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new Config({ moduleName: "mocks" });

config.load({ config: { readArguments: false } }).then(() => logConfig(config));
