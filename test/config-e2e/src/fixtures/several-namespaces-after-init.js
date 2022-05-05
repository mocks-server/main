const { NewConfig } = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new NewConfig({ moduleName: "mocks" });

config.init({ namespace: { component: { alias: "foo-alias" } } }).then(async () => {
  config
    .addNamespace("firstNamespace")
    .addNamespace("secondNamespace")
    .addOption({ name: "fooOption", type: "string", default: "foo-value" });
  config
    .addNamespace("namespace")
    .addNamespace("component")
    .addOption({ name: "alias", type: "string", default: "" });
  await config.start();
  logConfig(config);
});
