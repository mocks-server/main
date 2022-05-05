const { NewConfig } = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new NewConfig({ moduleName: "mocks" });

const component = config.addNamespace("component");
component.addOption({ name: "booleanDefaultTrue", default: true, type: "boolean" });
component.addOption({ name: "booleanDefaultFalse", default: false, type: "boolean" });
component.addOption({ name: "stringWithDefault", default: "foo-str", type: "string" });
component.addOption({ name: "objectWithDefault", default: { foo: "var" }, type: "object" });
component.addOption({ name: "numberDefaultZero", default: 0, type: "number" });

config
  .start({ component: { stringWithDefault: "foo-str-from-init" } })
  .then(() => logConfig(config));
