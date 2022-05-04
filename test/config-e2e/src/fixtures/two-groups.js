const { NewConfig } = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new NewConfig({ moduleName: "mocks" });

const fooGroup = config.addGroup("fooGroup");
const fooNamespace = fooGroup.addNamespace("fooNamespace");
fooNamespace.addOption({ name: "fooOption", type: "string", default: "foo-value" });

const group = config.addGroup("group");
const component = group.addNamespace("component");
component.addOption({ name: "alias", type: "string", default: "" });

config.init({ group: { component: { alias: "foo-alias" } } }).then(() => logConfig(config));
