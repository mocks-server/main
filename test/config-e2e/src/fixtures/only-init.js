const Config = require("@mocks-server/config").default;

console.log(Config);

const { logConfig } = require("../../support/utils");

const config = new Config({ moduleName: "mocks" });

config.init().then(async () => {
  await config.load();
  console.log(`loadedFile:${config.loadedFile}`);
  logConfig(config);
});
