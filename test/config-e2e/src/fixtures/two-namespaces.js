const Config = require("@mocks-server/config").default;

const { logConfig } = require("../../support/utils");

const config = new Config({ moduleName: "mocks" });

config
  .addNamespace("firstNamespace")
  .addOption({ name: "fooOption", type: "string", default: "foo-value" });

config.addNamespace("component").addOption({ name: "alias", type: "string", default: "" });

config.init({ component: { alias: "foo-alias" } }).then(() => logConfig(config));
