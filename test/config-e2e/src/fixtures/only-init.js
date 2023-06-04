const Config = require("@mocks-server/config").default;

// eslint-disable-next-line no-console
console.log(Config);

const { logConfig } = require("../../support/utils");

const config = new Config({ moduleName: "mocks" });

config.init().then(async () => {
  await config.load();
  // eslint-disable-next-line no-console
  console.log(`loadedFile:${config.loadedFile}`);
  logConfig(config);
});
