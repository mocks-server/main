const { NewConfig } = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new NewConfig({ moduleName: "mocks" });

config.init().then(() => logConfig(config));