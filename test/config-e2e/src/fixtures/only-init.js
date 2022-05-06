const Config = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new Config({ moduleName: "mocks" });

config.init().then(async () => {
  await config.start();
  logConfig(config);
});
