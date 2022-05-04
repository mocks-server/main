const cosmiconfig = require("cosmiconfig");
const commander = require("commander");
const sinon = require("sinon");

const Config = require("../../src/Config");

describe("Config group", () => {
  let sandbox, cosmiconfigStub, createConfig, config, namespace, group, option;

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
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "string",
        default: "default-str",
      });
      return {
        config,
        group,
        namespace,
        option,
      };
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when a group is created", () => {
    it("should have name property", async () => {
      config = new Config();
      group = config.addGroup("foo");
      expect(group.name).toEqual("foo");
    });
  });

  describe("when an option is created", () => {
    it("should have name property", async () => {
      config = new Config();
      group = config.addGroup("foo");
      namespace = group.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "string" });
      expect(option.name).toEqual("fooOption");
    });

    it("should throw when type is string and default does not match type", async () => {
      config = new Config();
      group = config.addGroup("foo");
      namespace = group.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "string", default: 5 })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is string and value does not match type", async () => {
      config = new Config();
      group = config.addGroup("foo");
      namespace = group.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "string" });
      expect(() => (option.value = 5)).toThrowError("5 is not of type string");
    });

    it("should throw when type is number and default does not match type", async () => {
      config = new Config();
      group = config.addGroup("foo");
      namespace = group.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "number", default: "5" })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is number and value does not match type", async () => {
      config = new Config();
      group = config.addGroup("foo");
      namespace = group.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "number" });
      expect(() => (option.value = "foo")).toThrowError("foo is not of type number");
    });

    it("should throw when type is object and default does not match type", async () => {
      config = new Config();
      group = config.addGroup("foo");
      namespace = group.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "object", default: "{}" })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is object and value does not match type", async () => {
      config = new Config();
      group = config.addGroup("foo");
      namespace = group.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "object" });
      expect(() => (option.value = "foo")).toThrowError("foo is not of type object");
    });

    it("should throw when type is boolean and default does not match type", async () => {
      config = new Config();
      group = config.addGroup("foo");
      namespace = group.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "boolean", default: "foo" })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is boolean and value does not match type", async () => {
      config = new Config();
      group = config.addGroup("foo");
      namespace = group.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "boolean" });
      expect(() => (option.value = 1)).toThrowError("1 is not of type boolean");
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

    it("should return default value of options of type object", async () => {
      config = new Config({ moduleName: "testObjectDefault" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: "var" },
        type: "object",
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

    it("option should return new value after setting it when it is of type number", async () => {
      config = new Config({ moduleName: "testnumberSet" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: 5,
        type: "number",
      });
      await config.init();
      expect(option.value).toEqual(5);
      option.value = 10;
      expect(option.value).toEqual(10);
    });

    it("option should return new value after setting it when it is of type boolean", async () => {
      config = new Config({ moduleName: "testbooleanSet" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "boolean",
      });
      await config.init();
      expect(option.value).toEqual(true);
      option.value = false;
      expect(option.value).toEqual(false);
    });

    it("option should return new value after merging it when option is of type object", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: "var" },
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual({ foo: "var" });
      option.merge({ foo2: "var2" });
      expect(option.value).toEqual({ foo2: "var2", foo: "var" });
    });

    it("option should not merge value if it is undefined when option is of type object", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: "var" },
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual({ foo: "var" });
      option.merge(undefined);
      expect(option.value).toEqual({ foo: "var" });
    });

    it("option should be undefined if no default value is provided", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual(undefined);
    });

    it("option return new value after merging it when it has not default value and option is of type object", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual(undefined);
      option.merge({ foo: "var" });
      expect(option.value).toEqual({ foo: "var" });
    });
  });

  describe("when programmatic config is provided in init method", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("should throw when config does not pass validation", async () => {
      await expect(
        config.init({
          fooGroup: {
            fooNamespace: { fooOption: false },
          },
        })
      ).rejects.toThrowError("fooOption");
    });

    it("option should get value from it", async () => {
      await config.init({
        fooGroup: { fooNamespace: { fooOption: "foo-value-2" } },
      });
      expect(option.value).toEqual("foo-value-2");
    });

    it("option should have cloned value", async () => {
      config = new Config({ moduleName: "testObjectClone" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: "var" },
        type: "object",
      });
      const value = { fooOption: { foo: "foo" } };
      await config.init({
        fooGroup: { fooNamespace: value },
      });
      value.fooOption.foo = "foo2";
      expect(option.value).not.toBe(value.fooOption);
      expect(option.value).toEqual({ foo: "foo" });
    });

    it("should merge value from default if option is of type object", async () => {
      config = new Config({ moduleName: "testObjectInitExtend" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: 2, foo2: { var: true, var3: "foo" }, foo4: "test" },
        type: "object",
      });
      await config.init({
        fooGroup: {
          fooNamespace: { fooOption: { foo: 4, foo2: { var: false, var4: "y" }, foo3: "z" } },
        },
      });
      expect(option.value).toEqual({
        foo: 4,
        foo2: { var: false, var3: "foo", var4: "y" },
        foo3: "z",
        foo4: "test",
      });
    });
  });

  describe("when programmatic config is provided but group is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({});
      expect(option.value).toEqual("default-str");
    });
  });

  describe("when programmatic config and group are provided but namespace is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({
        fooGroup: {},
      });
      expect(option.value).toEqual("default-str");
    });
  });

  describe("when programmatic config, group and namespace are provided but option is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({
        fooGroup: { fooNamespace: {} },
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
        config: { fooGroup: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init();
      expect(option.value).toEqual("value-from-file");
    });

    it("should throw when config does not pass validation", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooGroup: { fooNamespace: { fooOption: 5 } } },
      });
      await expect(config.init()).rejects.toThrow("fooOption");
    });

    it("should overwrite value from init options", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooGroup: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({
        fooGroup: { fooNamespace: { fooOption: "value-from-init" } },
      });
      expect(option.value).toEqual("value-from-file");
    });

    it("should not overwrite value from init options if readFile is disabled", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooGroup: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({
        config: { readFile: false },
        fooGroup: { fooNamespace: { fooOption: "value-from-init" } },
      });
      expect(option.value).toEqual("value-from-init");
    });

    it("should ignore undefined values", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooGroup: { fooNamespace: { fooOption: undefined } } },
      });
      await config.init();
      expect(option.value).toEqual("default-str");
    });

    it("should return object when option is of type object", async () => {
      cosmiconfigStub.search.resolves({
        config: {
          fooGroup: {
            fooNamespace: {
              fooOption: { foo: 1, foo2: { var: false, var2: "x", var4: "y" }, foo3: "z" },
            },
          },
        },
      });
      config = new Config({ moduleName: "testObjectFile" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
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

    it("should receive previous config from init as argument", async () => {
      const func = sinon
        .stub()
        .returns({ fooGroup: { fooNamespace: { fooOption: "value-from-file" } } });
      cosmiconfigStub.search.resolves({
        config: func,
      });
      await config.init({
        fooGroup: {
          fooNamespace: {
            fooOption: "foo-from-init",
          },
        },
      });
      expect(func.getCall(0).args[0]).toEqual({
        fooGroup: {
          fooNamespace: {
            fooOption: "foo-from-init",
          },
        },
      });
    });

    it("should return value from result of sync function", async () => {
      cosmiconfigStub.search.resolves({
        config: () => ({ fooGroup: { fooNamespace: { fooOption: "value-from-file" } } }),
      });
      await config.init();
      expect(option.value).toEqual("value-from-file");
    });

    it("should return value from result of async function", async () => {
      cosmiconfigStub.search.resolves({
        config: () => {
          return Promise.resolve({ fooGroup: { fooNamespace: { fooOption: "value-from-file" } } });
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
        config: { fooGroup: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({
        config: { readFile: false },
      });
      expect(option.value).toEqual("default-str");
    });
  });

  describe("when option is defined in environment var", () => {
    it("should return value from it", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "groupTestA" }));
      process.env["GROUP_TEST_A_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init();
      expect(option.value).toEqual("foo-from-env");
    });

    it("should throw when config does not pass validation", async () => {
      config = new Config({ moduleName: "groupTestEnvWrong" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      process.env["GROUP_TEST_ENV_WRONG_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await expect(config.init()).rejects.toThrowError("fooOption");
    });

    it("should return object value if option is of type object", async () => {
      config = new Config({ moduleName: "groupTestObjectEnv" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      process.env["GROUP_TEST_OBJECT_ENV_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual({ foo: 1, foo2: { var: false, var2: "x" } });
    });

    it("should overwrite value from init", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "groupTestB" }));
      process.env["GROUP_TEST_B_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init({ fooGroup: { fooNamespace: { fooOption: "value-from-init" } } });
      expect(option.value).toEqual("foo-from-env");
    });

    it("should overwrite value from init and file", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "groupTestC" }));
      cosmiconfigStub.search.resolves({
        config: { fooGroup: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      process.env["GROUP_TEST_C_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init({ fooGroup: { fooNamespace: { fooOption: "value-from-init" } } });
      expect(option.value).toEqual("foo-from-env");
    });

    it("should merge value from init if option is of type object", async () => {
      config = new Config({ moduleName: "groupTestObjectEnvExtend" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      process.env["GROUP_TEST_OBJECT_ENV_EXTEND_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.init({
        fooGroup: {
          fooNamespace: { fooOption: { foo: 2, foo2: { var: true, var4: "y" }, foo3: "z" } },
        },
      });
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: false, var2: "x", var4: "y" },
        foo3: "z",
      });
    });

    it("should merge value from default if option is of type object", async () => {
      config = new Config({ moduleName: "groupTestObjectEnvExtendDefault" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      process.env["GROUP_TEST_OBJECT_ENV_EXTEND_DEFAULT_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] =
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
      config = new Config({ moduleName: "groupTestObjectEnvExtend2" });
      cosmiconfigStub.search.resolves({
        config: {
          fooGroup: { fooNamespace: { fooOption: { foo2: { var: true, var5: 5 }, foo4: "zy" } } },
        },
      });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      process.env["GROUP_TEST_OBJECT_ENV_EXTEND_2_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.init({
        fooGroup: {
          fooNamespace: { fooOption: { foo: 2, foo2: { var: true, var4: "y" }, foo3: "z" } },
        },
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
      commander.Command.prototype.opts.returns({
        "fooGroup.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testD" }));
      await config.init();
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should return object if option is of type object", async () => {
      commander.Command.prototype.opts.returns({
        "fooGroup.fooNamespace.fooOption": {
          foo: 1,
          foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
        },
      });
      config = new Config({ moduleName: "testArgobject" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
      });
    });

    it("should not return value from it if it is undefined", async () => {
      commander.Command.prototype.opts.returns({ "fooGroup.fooNamespace.fooOption": undefined });
      ({ config, namespace, option } = createConfig({ moduleName: "testE" }));
      await config.init();
      expect(option.value).toEqual("default-str");
    });

    it("should overwrite value from init", async () => {
      commander.Command.prototype.opts.returns({
        "fooGroup.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testF" }));
      await config.init({ fooGroup: { fooNamespace: { fooOption: "value-from-init" } } });
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from env var", async () => {
      commander.Command.prototype.opts.returns({
        "fooGroup.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "groupTestG" }));
      process.env["GROUP_TEST_G_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init();
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from file", async () => {
      commander.Command.prototype.opts.returns({
        "fooGroup.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testH" }));
      cosmiconfigStub.search.resolves({
        config: { fooGroup: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init();
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from init, env var and file", async () => {
      commander.Command.prototype.opts.returns({
        "fooGroup.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "groupTestI" }));
      process.env["GROUP_TEST_I_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      cosmiconfigStub.search.resolves({
        config: { fooGroup: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({ fooGroup: { fooNamespace: { fooOption: "value-from-init" } } });
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should not overwrite value from init, env var and file if option is boolean, value is true and default value is true", async () => {
      config = new Config({ moduleName: "groupTestJ" });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "boolean",
      });
      commander.Command.prototype.opts.returns({ "fooGroup.fooNamespace.fooOption": true });
      process.env["GROUP_TEST_J_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] = false;
      cosmiconfigStub.search.resolves({
        config: { fooGroup: { fooNamespace: { fooOption: false } } },
      });
      await config.init({ fooGroup: { fooNamespace: { fooOption: false } } });
      expect(option.value).toEqual(false);
    });

    it("should merge value from default, init, file and env var if option is of type object", async () => {
      config = new Config({ moduleName: "groupTestObjectEnvExtend3" });
      cosmiconfigStub.search.resolves({
        config: {
          fooGroup: { fooNamespace: { fooOption: { foo2: { var: true, var5: 5 }, foo4: "zy" } } },
        },
      });
      commander.Command.prototype.opts.returns({
        "fooGroup.fooNamespace.fooOption": {
          foo: 1,
          foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
        },
      });
      group = config.addGroup("fooGroup");
      namespace = group.addNamespace("fooNamespace");
      process.env["GROUP_TEST_OBJECT_ENV_EXTEND_3_FOO_GROUP_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: { foo5: "testing", foo2: { var7: 7 } },
        type: "object",
      });
      await config.init({
        fooGroup: {
          fooNamespace: { fooOption: { foo: 2, foo2: { var: true, var4: "y" }, foo3: "z" } },
        },
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
