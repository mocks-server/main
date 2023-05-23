const Config = require("@mocks-server/config").default;

const { logConfig } = require("../../support/utils");

const config = new Config({ moduleName: "mocks" });

config
  .addNamespace("firstNamespace")
  .addNamespace("secondNamespace")
  .addOption({ name: "fooOption", type: "string", default: "foo-value" });
config
  .addNamespace("namespace")
  .addNamespace("component")
  .addOption({ name: "alias", type: "string", default: "" });

config.load({ namespace: { component: { alias: "foo-alias" } } }).then(() => logConfig(config));
