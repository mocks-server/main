const { NewConfig } = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new NewConfig({ moduleName: "mocks" });

const component = config.addNamespace("component");
component.addOption({ name: "booleanDefaultTrue", default: true, type: "Boolean" });
component.addOption({ name: "booleanDefaultFalse", default: false, type: "Boolean" });
component.addOption({ name: "stringWithDefault", default: "foo-str", type: "String" });
component.addOption({ name: "numberDefaultZero", default: 0, type: "Number" });

config
  .init({ component: { stringWithDefault: "foo-str-from-init" } })
  .then(() => logConfig(config));
