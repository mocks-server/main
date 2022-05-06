const commander = require("commander");

const { createConfigBeforeElements } = require("../support/helpers");

const Config = require("../../src/Config");

describe("environment", () => {
  let sandbox, cosmiconfigStub, createConfig, config, namespace, option;

  beforeEach(() => {
    ({ sandbox, cosmiconfigStub, createConfig, config, namespace, option } =
      createConfigBeforeElements());
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when option is defined in environment var", () => {
    it("should return value from it", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "testA" }));
      process.env["TEST_A_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init();
      expect(option.value).toEqual("foo-from-env");
    });

    it("should not return value from it when readEnvironment option is disabled using init argument", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "testDisabled" }));
      process.env["TEST_DISABLED_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init({ config: { readEnvironment: false } });
      expect(option.value).toEqual("default-str");
    });

    it("should not return value from it when readEnvironment option is disabled using argument", async () => {
      commander.Command.prototype.opts.returns({ "config.readEnvironment": false });
      ({ config, namespace, option } = createConfig({ moduleName: "testDisabled" }));
      process.env["TEST_DISABLED_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init();
      expect(option.value).toEqual("default-str");
    });

    it("should throw when config does not pass validation", async () => {
      config = new Config({ moduleName: "testEnvWrong" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_ENV_WRONG_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await expect(config.init()).rejects.toThrowError("fooOption");
    });

    it("should return object value if option is of type object", async () => {
      config = new Config({ moduleName: "testObjectEnv" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual({ foo: 1, foo2: { var: false, var2: "x" } });
    });

    it("should return object value if option is of type object when added after init method", async () => {
      config = new Config({ moduleName: "testObjectEnv" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      await config.init();
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.start();
      expect(option.value).toEqual({ foo: 1, foo2: { var: false, var2: "x" } });
    });

    it("should return boolean false if env var is false string", async () => {
      config = new Config({ moduleName: "testN" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_N_FOO_NAMESPACE_FOO_OPTION"] = "false";
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "boolean",
      });
      await config.init();
      expect(option.value).toEqual(false);
    });

    it("should return boolean false if env var is false", async () => {
      config = new Config({ moduleName: "testO" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_O_FOO_NAMESPACE_FOO_OPTION"] = false;
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "boolean",
      });
      await config.init();
      expect(option.value).toEqual(false);
    });

    it("should return boolean false if env var is 0 string", async () => {
      config = new Config({ moduleName: "testP" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_P_FOO_NAMESPACE_FOO_OPTION"] = "0";
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "boolean",
      });
      await config.init();
      expect(option.value).toEqual(false);
    });

    it("should return boolean false if env var is 0 number", async () => {
      config = new Config({ moduleName: "testQ" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_Q_FOO_NAMESPACE_FOO_OPTION"] = 0;
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "boolean",
      });
      await config.init();
      expect(option.value).toEqual(false);
    });

    it("should return boolean true if env var is true string", async () => {
      config = new Config({ moduleName: "testR" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_R_FOO_NAMESPACE_FOO_OPTION"] = "true";
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "boolean",
      });
      await config.init();
      expect(option.value).toEqual(true);
    });

    it("should return boolean true if env var is 1 string", async () => {
      config = new Config({ moduleName: "testS" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_S_FOO_NAMESPACE_FOO_OPTION"] = "1";
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "boolean",
      });
      await config.init();
      expect(option.value).toEqual(true);
    });

    it("should overwrite value from init", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "testB" }));
      process.env["TEST_B_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init({ fooNamespace: { fooOption: "value-from-init" } });
      expect(option.value).toEqual("foo-from-env");
    });

    it("should overwrite value from init and file", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "testC" }));
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      process.env["TEST_C_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init({ fooNamespace: { fooOption: "value-from-init" } });
      expect(option.value).toEqual("foo-from-env");
    });

    it("should merge value from init if option is of type object", async () => {
      config = new Config({ moduleName: "testObjectEnvExtend" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_EXTEND_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.init({
        fooNamespace: { fooOption: { foo: 2, foo2: { var: true, var4: "y" }, foo3: "z" } },
      });
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: false, var2: "x", var4: "y" },
        foo3: "z",
      });
    });

    it("should merge value from default if option is of type object", async () => {
      config = new Config({ moduleName: "testObjectEnvExtendDefault" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_EXTEND_DEFAULT_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: 2, foo2: { var: true, var4: "y" }, foo3: "z" },
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: false, var2: "x", var4: "y" },
        foo3: "z",
      });
    });

    it("should merge value from init and file if option is of type object", async () => {
      config = new Config({ moduleName: "testObjectEnvExtend2" });
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: { foo2: { var: true, var5: 5 }, foo4: "zy" } } },
      });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_EXTEND_2_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.init({
        fooNamespace: { fooOption: { foo: 2, foo2: { var: true, var4: "y" }, foo3: "z" } },
      });
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: false, var2: "x", var4: "y", var5: 5 },
        foo3: "z",
        foo4: "zy",
      });
    });
  });
});
