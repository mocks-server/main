const { NewConfig } = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new NewConfig({ moduleName: "mocks" });

const secondNamespace = config.addNamespace("firstNamespace").addNamespace("secondNamespace");

secondNamespace.addOption({ name: "fooOption", type: "string", default: "foo-value" });
secondNamespace.addOption({ name: "fooBooleanOption", type: "boolean", default: true });

const thirdNamespace = secondNamespace.addNamespace("thirdNamespace");
thirdNamespace.addOption({ name: "fooOption2", type: "boolean", default: true });
thirdNamespace.addOption({ name: "fooOption3", type: "string", default: "3-default" });

config
  .addNamespace("namespace")
  .addNamespace("component")
  .addOption({ name: "alias", type: "string", default: "" });

config.init({ namespace: { component: { alias: "foo-alias" } } }).then(() => logConfig(config));
