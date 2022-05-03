const cosmiconfig = require("cosmiconfig");
const commander = require("commander");
const sinon = require("sinon");

const Config = require("../../src/Config");

describe("Config", () => {
  let sandbox, cosmiconfigStub, createConfig, config, namespace, option;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    cosmiconfigStub = {
      search: sandbox.stub(),
    };

    sandbox.stub(cosmiconfig, "cosmiconfig").returns(cosmiconfigStub);

    sandbox.stub(commander.Option.prototype, "argParser");
    sandbox.stub(commander.Command.prototype, "addOption");
    sandbox.stub(commander.Command.prototype, "allowUnknownOption");
    sandbox.stub(commander.Command.prototype, "parse");
    sandbox.stub(commander.Command.prototype, "opts").returns({});

    createConfig = function (options) {
      config = new Config(options);
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "String",
        default: "default-str",
      });
      return {
        config,
        namespace,
        option,
      };
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when a namespace is created", () => {
    it("should have name property", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      expect(namespace.name).toEqual("foo");
    });
  });

  describe("when no config is provided", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should have name property", async () => {
      expect(option.name).toEqual("fooOption");
    });

    it("option should return default value", async () => {
      await config.init();
      expect(option.value).toEqual("default-str");
    });

    it("should return default value of options of type Object", async () => {
      config = new Config({ moduleName: "testObjectDefault" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: "var" },
        type: "Object",
      });
      await config.init();
      expect(option.value).toEqual({ foo: "var" });
    });

    it("option should return new value after setting it", async () => {
      await config.init();
      expect(option.value).toEqual("default-str");
      option.value = "new-str";
      expect(option.value).toEqual("new-str");
    });

    it("option should return new value after merging it when option is of type Object", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: "var" },
        type: "Object",
      });
      await config.init();
      expect(option.value).toEqual({ foo: "var" });
      option.merge({ foo2: "var2" });
      expect(option.value).toEqual({ foo2: "var2", foo: "var" });
    });

    it("option should not merge value if it is undefined when option is of type Object", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: "var" },
        type: "Object",
      });
      await config.init();
      expect(option.value).toEqual({ foo: "var" });
      option.merge(undefined);
      expect(option.value).toEqual({ foo: "var" });
    });

    it("option should be undefined if no default value is provided", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "Object",
      });
      await config.init();
      expect(option.value).toEqual(undefined);
    });

    it("option return new value after merging it when it has not default value and option is of type object", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "Object",
      });
      await config.init();
      expect(option.value).toEqual(undefined);
      option.merge({ foo: "var" });
      expect(option.value).toEqual({ foo: "var" });
    });
  });

  describe("when programmatic config is provided", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return value from programmatic options", async () => {
      await config.init({
        fooNamespace: { fooOption: "foo-value" },
      });
      expect(option.value).toEqual("foo-value");
    });
  });

  describe("when programmatic config is provided in init method", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should get value from it", async () => {
      await config.init({
        fooNamespace: { fooOption: "foo-value-2" },
      });
      expect(option.value).toEqual("foo-value-2");
    });

    it("option should have cloned value", async () => {
      const fooNamespace = { fooOption: { foo: "foo" } };
      await config.init({
        fooNamespace,
      });
      fooNamespace.fooOption.foo = "foo2";
      expect(option.value).not.toBe(fooNamespace.fooOption);
      expect(option.value).toEqual({ foo: "foo" });
    });

    it("should merge value from default if option is of type Object", async () => {
      config = new Config({ moduleName: "testObjectInitExtend" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: 2, foo2: { var: true, var3: "foo" }, foo4: "test" },
        type: "Object",
      });
      await config.init({
        fooNamespace: { fooOption: { foo: 4, foo2: { var: false, var4: "y" }, foo3: "z" } },
      });
      expect(option.value).toEqual({
        foo: 4,
        foo2: { var: false, var3: "foo", var4: "y" },
        foo3: "z",
        foo4: "test",
      });
    });
  });

  describe("when programmatic config is provided but namespace is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({
        foo: {},
      });
      expect(option.value).toEqual("default-str");
    });
  });

  describe("when programmatic config and namespace are provided but option is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({
        fooNamespace: { fooOtherOption: "foo-value" },
      });
      expect(option.value).toEqual("default-str");
    });
  });

  describe("when option has a value in files", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("should return value from file", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.init();
      expect(option.value).toEqual("value-from-file");
    });

    it("should overwrite value from init options", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.init({
        fooNamespace: { fooOption: "value-from-init" },
      });
      expect(option.value).toEqual("value-from-file");
    });

    it("should not overwrite value from init options if readFile is disabled", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.init({
        config: { readFile: false },
        fooNamespace: { fooOption: "value-from-init" },
      });
      expect(option.value).toEqual("value-from-init");
    });

    it("should ignore undefined values", async () => {
      cosmiconfigStub.search.resolves({ config: { fooNamespace: { fooOption: undefined } } });
      await config.init();
      expect(option.value).toEqual("default-str");
    });

    it("should return Object when option is of type Object", async () => {
      cosmiconfigStub.search.resolves({
        config: {
          fooNamespace: {
            fooOption: { foo: 1, foo2: { var: false, var2: "x", var4: "y" }, foo3: "z" },
          },
        },
      });
      config = new Config({ moduleName: "testObjectFile" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "Object",
      });
      await config.init();
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: false, var2: "x", var4: "y" },
        foo3: "z",
      });
    });
  });

  describe("when file returns a function", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("should return value from result of sync function", async () => {
      cosmiconfigStub.search.resolves({
        config: () => ({ fooNamespace: { fooOption: "value-from-file" } }),
      });
      await config.init();
      expect(option.value).toEqual("value-from-file");
    });

    it("should return value from result of async function", async () => {
      cosmiconfigStub.search.resolves({
        config: () => {
          return Promise.resolve({ fooNamespace: { fooOption: "value-from-file" } });
        },
      });
      await config.init();
      expect(option.value).toEqual("value-from-file");
    });
  });

  describe("when option has a value in files but readFile option is disabled", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("should return default value", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.init({
        config: { readFile: false },
      });
      expect(option.value).toEqual("default-str");
    });
  });

  describe("when option is defined in environment var", () => {
    it("should return value from it", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "testA" }));
      process.env["TEST_A_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init();
      expect(option.value).toEqual("foo-from-env");
    });

    it("should return object value if option is of type Object", async () => {
      config = new Config({ moduleName: "testObjectEnv" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "Object",
      });
      await config.init();
      expect(option.value).toEqual({ foo: 1, foo2: { var: false, var2: "x" } });
    });

    it("should return boolean false if env var is false string", async () => {
      config = new Config({ moduleName: "testN" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_N_FOO_NAMESPACE_FOO_OPTION"] = "false";
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "Boolean",
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
        type: "Boolean",
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
        type: "Boolean",
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
        type: "Boolean",
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
        type: "Boolean",
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
        type: "Boolean",
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

    it("should merge value from init if option is of type Object", async () => {
      config = new Config({ moduleName: "testObjectEnvExtend" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_EXTEND_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "Object",
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

    it("should merge value from default if option is of type Object", async () => {
      config = new Config({ moduleName: "testObjectEnvExtendDefault" });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_EXTEND_DEFAULT_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: 2, foo2: { var: true, var4: "y" }, foo3: "z" },
        type: "Object",
      });
      await config.init();
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: false, var2: "x", var4: "y" },
        foo3: "z",
      });
    });

    it("should merge value from init and file if option is of type Object", async () => {
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
        type: "Object",
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

  describe("when option is defined in argument", () => {
    it("should return value from it", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": "foo-from-arg" });
      ({ config, namespace, option } = createConfig({ moduleName: "testD" }));
      await config.init();
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should return Object if option is of type Object", async () => {
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": { foo: 1, foo2: { var: true, var2: "x-from-arg", var6: "xyz" } },
      });
      config = new Config({ moduleName: "testArgObject" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "Object",
      });
      await config.init();
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
      });
    });

    it("should not return value from it if it is undefined", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": undefined });
      ({ config, namespace, option } = createConfig({ moduleName: "testE" }));
      await config.init();
      expect(option.value).toEqual("default-str");
    });

    it("commander should call to Number parser when option is a Number", async () => {
      config = new Config({ moduleName: "testL" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: 2,
        type: "Number",
      });
      await config.init();
      // first call is from readFile config option
      expect(commander.Option.prototype.argParser.getCall(1).args[0]("1.5")).toEqual(1.5);
    });

    it("commander should call to empty parser when option is a String", async () => {
      config = new Config({ moduleName: "testM" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: "foo",
        type: "String",
      });
      await config.init();
      // first call is from readFile config option
      expect(commander.Option.prototype.argParser.getCall(1).args[0]("foo")).toEqual("foo");
    });

    it("should overwrite value from init", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": "foo-from-arg" });
      ({ config, namespace, option } = createConfig({ moduleName: "testF" }));
      await config.init({ fooNamespace: { fooOption: "value-from-init" } });
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from env var", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": "foo-from-arg" });
      ({ config, namespace, option } = createConfig({ moduleName: "testG" }));
      process.env["TEST_G_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init();
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from file", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": "foo-from-arg" });
      ({ config, namespace, option } = createConfig({ moduleName: "testH" }));
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.init();
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from init, env var and file", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": "foo-from-arg" });
      ({ config, namespace, option } = createConfig({ moduleName: "testI" }));
      process.env["TEST_I_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.init({ fooNamespace: { fooOption: "value-from-init" } });
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should not overwrite value from init, env var and file if option is boolean, value is true and default value is true", async () => {
      config = new Config({ moduleName: "testJ" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "Boolean",
      });
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": true });
      process.env["TEST_J_FOO_NAMESPACE_FOO_OPTION"] = false;
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: false } },
      });
      await config.init({ fooNamespace: { fooOption: false } });
      expect(option.value).toEqual(false);
    });

    it("should merge value from default, init, file and env var if option is of type Object", async () => {
      config = new Config({ moduleName: "testObjectEnvExtend3" });
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: { foo2: { var: true, var5: 5 }, foo4: "zy" } } },
      });
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": { foo: 1, foo2: { var: true, var2: "x-from-arg", var6: "xyz" } },
      });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_EXTEND_3_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: { foo5: "testing", foo2: { var7: 7 } },
        type: "Object",
      });
      await config.init({
        fooNamespace: { fooOption: { foo: 2, foo2: { var: true, var4: "y" }, foo3: "z" } },
      });
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: true, var2: "x-from-arg", var4: "y", var5: 5, var6: "xyz", var7: 7 },
        foo3: "z",
        foo4: "zy",
        foo5: "testing",
      });
    });
  });
});
