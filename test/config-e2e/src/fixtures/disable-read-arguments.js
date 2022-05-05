const { NewConfig } = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new NewConfig({ moduleName: "mocks" });

config.start({ config: { readArguments: false } }).then(() => logConfig(config));
