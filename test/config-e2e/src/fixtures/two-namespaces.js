const { NewConfig } = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new NewConfig({ moduleName: "mocks" });

const fooNamespace = config.addNamespace("fooNamespace");
fooNamespace.addOption({ name: "fooOption", type: "string", default: "foo-value" });

const component = config.addNamespace("component");
component.addOption({ name: "alias", type: "string", default: "" });

config.init({ component: { alias: "foo-alias" } }).then(() => logConfig(config));
