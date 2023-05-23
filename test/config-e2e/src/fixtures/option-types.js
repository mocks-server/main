const Config = require("@mocks-server/config").default;

const { logConfig } = require("../../support/utils");

const config = new Config({ moduleName: "mocks" });

const component = config.addNamespace("component");
component.addOption({ name: "booleanDefaultTrue", default: true, type: "boolean" });
component.addOption({ name: "booleanDefaultFalse", default: false, type: "boolean" });
component.addOption({ name: "stringWithDefault", default: "foo-str", type: "string" });
component.addOption({ name: "objectWithDefault", default: { foo: "var" }, type: "object" });
component.addOption({ name: "numberDefaultZero", default: 0, type: "number" });
component.addOption({ name: "arrayWithDefault", default: ["foo-default"], type: "array" });
component.addOption({ name: "arrayNumber", type: "array", itemsType: "number" });
component.addOption({ name: "arrayObject", type: "array", itemsType: "object" });
component.addOption({ name: "arrayBoolean", type: "array", itemsType: "boolean" });

config
  .load({ component: { stringWithDefault: "foo-str-from-init" } })
  .then(() => logConfig(config));
