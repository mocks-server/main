const Config = require("@mocks-server/config");

const { logConfig } = require("../../support/utils");

const config = new Config({ moduleName: "mocks" });

config.addOption({ name: "booleanDefaultTrue", default: true, type: "boolean" });
config.addOption({ name: "booleanDefaultFalse", default: false, type: "boolean" });
config.addOption({ name: "stringWithDefault", default: "foo-str", type: "string" });
config.addOption({ name: "objectWithDefault", default: { foo: "var" }, type: "object" });
config.addOption({ name: "numberDefaultZero", default: 0, type: "number" });

config.start({ stringWithDefault: "foo-str-from-init" }).then(() => logConfig(config));
