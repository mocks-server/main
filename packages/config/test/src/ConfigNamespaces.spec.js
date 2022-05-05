const cosmiconfig = require("cosmiconfig");
const commander = require("commander");
const sinon = require("sinon");

const Config = require("../../src/Config");

describe("Config namespaces", () => {
  let sandbox, cosmiconfigStub, createConfig, config, namespace, parentNamespace, option;

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
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "string",
        default: "default-str",
      });
      return {
        config,
        parentNamespace,
        namespace,
        option,
      };
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when option is created in root", () => {
    it("should have default value", async () => {
      config = new Config();
      option = config.addOption({
        name: "fooOption",
        type: "string",
        default: "default-str",
      });
      expect(option.value).toEqual("default-str");
      await config.init({ fooOption: "foo-str" });
      await config.start();
      expect(option.value).toEqual("foo-str");
    });

    it("should have default value when created using addOptions", async () => {
      config = new Config();
      [option] = config.addOptions([
        {
          name: "fooOption",
          type: "string",
          default: "default-str",
        },
      ]);
      expect(option.value).toEqual("default-str");
      await config.init({ fooOption: "foo-str" });
      await config.start();
      expect(option.value).toEqual("foo-str");
    });
  });

  describe("when a namespace is created", () => {
    it("should have name property", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      expect(parentNamespace.name).toEqual("foo");
    });

    it("should throw if no name is provided", async () => {
      createConfig();
      expect(() => namespace.addNamespace()).toThrow("provide a name");
    });

    it("should throw if no name is provided when created in root", async () => {
      createConfig();
      expect(() => config.addNamespace()).toThrow("provide a name");
    });
  });

  describe("when an option is created", () => {
    it("should have name property", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "string" });
      expect(option.name).toEqual("fooOption");
    });

    it("should throw when type is string and default does not match type", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "string", default: 5 })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is string and value does not match type", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "string" });
      expect(() => (option.value = 5)).toThrowError("5 is not of type string");
    });

    it("should throw when type is number and default does not match type", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "number", default: "5" })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is number and value does not match type", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "number" });
      expect(() => (option.value = "foo")).toThrowError("foo is not of type number");
    });

    it("should throw when type is object and default does not match type", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "object", default: "{}" })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is object and value does not match type", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "object" });
      expect(() => (option.value = "foo")).toThrowError("foo is not of type object");
    });

    it("should throw when type is boolean and default does not match type", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "boolean", default: "foo" })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is boolean and value does not match type", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
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
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
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
      config = new Config({ moduleName: "testNumberSet" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
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
      config = new Config({ moduleName: "testBooleanSet" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
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
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
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
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
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
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual(undefined);
    });

    it("option return new value after merging it when it has not default value and option is of type object", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
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
          parentNamespace: {
            fooNamespace: { fooOption: false },
          },
        })
      ).rejects.toThrowError("fooOption");
    });

    it("should throw when config does not pass validation and namespaces have several levels", async () => {
      namespace.addNamespace("secondNamespace").addOption({
        name: "fooOption2",
        type: "string",
      });

      await expect(
        config.init({
          parentNamespace: {
            fooNamespace: { fooOption: "foo", secondNamespace: { fooOption2: 5 } },
          },
        })
      ).rejects.toThrowError("fooOption2");
    });

    it("should not throw when config includes unknwon namespaces", async () => {
      await config.init({
        parentNamespace: {
          fooNamespace: { fooOption: "value" },
          anotherNamespace: { fooOption2: "foo", anotherOption: false },
        },
        fooNewNamespace: { fooOption: 5, anotherOption: { fooProperty: true } },
      });
      expect(option.value).toEqual("value");
    });

    it("option should get value from it", async () => {
      await config.init({
        parentNamespace: { fooNamespace: { fooOption: "foo-value-2" } },
      });
      expect(option.value).toEqual("foo-value-2");
    });

    it("option should have cloned value", async () => {
      config = new Config({ moduleName: "testObjectClone" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: "var" },
        type: "object",
      });
      const value = { fooOption: { foo: "foo" } };
      await config.init({
        parentNamespace: { fooNamespace: value },
      });
      value.fooOption.foo = "foo2";
      expect(option.value).not.toBe(value.fooOption);
      expect(option.value).toEqual({ foo: "foo" });
    });

    it("should merge value from default if option is of type object", async () => {
      config = new Config({ moduleName: "testObjectInitExtend" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: 2, foo2: { var: true, var3: "foo" }, foo4: "test" },
        type: "object",
      });
      await config.init({
        parentNamespace: {
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

    it("should merge value from default if option is of type object and namespaces have several levels", async () => {
      let namespace2, option2, option3;
      config = new Config({ moduleName: "testObjectInitExtend" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: 2, foo2: { var: true, var3: "foo" }, foo4: "test" },
        type: "object",
      });
      namespace2 = namespace.addNamespace("secondNamespace");
      option2 = namespace2.addOption({
        name: "fooOption2",
        default: { foo5: { foo6: "x" } },
        type: "object",
      });
      option3 = namespace2.addOption({
        name: "fooOption3",
        default: false,
        type: "boolean",
      });
      await config.init({
        parentNamespace: {
          fooNamespace: {
            fooOption: { foo: 4, foo2: { var: false, var4: "y" }, foo3: "z" },
            secondNamespace: {
              fooOption2: {
                foo5: { foo7: "y" },
              },
              fooOption3: true,
            },
          },
        },
      });
      expect(option.value).toEqual({
        foo: 4,
        foo2: { var: false, var3: "foo", var4: "y" },
        foo3: "z",
        foo4: "test",
      });
      expect(option2.value).toEqual({ foo5: { foo6: "x", foo7: "y" } });
      expect(option3.value).toEqual(true);
    });
  });

  describe("when started", () => {
    beforeEach(() => {
      ({ config, parentNamespace, namespace, option } = createConfig());
    });

    it("should throw when config has unknown namespaces", async () => {
      await config.init({
        parentNamespace: {
          fooNamespace: { fooOption: "value" },
          anotherNamespace: { fooOption2: "foo", anotherOption: false },
        },
        fooNewNamespace: { fooOption: 5, anotherOption: { fooProperty: true } },
      });
      expect(option.value).toEqual("value");
      await expect(config.start()).rejects.toThrow("fooNewNamespace");
    });

    it("should throw when config has unknown namespaces under nested namespaces", async () => {
      namespace.addNamespace("secondNamespace").addOption({
        name: "fooOption2",
        type: "string",
      });
      await config.init({
        parentNamespace: {
          fooNamespace: {
            fooOption: "value",
            secondNamespace: { fooOption2: "foo", anotherNamespace: { foo: "5" } },
          },
        },
      });
      expect(option.value).toEqual("value");
      await expect(config.start()).rejects.toThrow("anotherNamespace");
    });

    it("should not throw when unknown namespaces are added after calling the init method", async () => {
      await config.init({
        parentNamespace: {
          fooNamespace: { fooOption: "value" },
          anotherNamespace: { fooOption2: "foo", anotherOption: false },
        },
        fooNewNamespace: { fooOption3: 5, anotherOption3: { fooProperty: true } },
      });
      expect(option.value).toEqual("value");

      const anotherNamespace = parentNamespace.addNamespace("anotherNamespace");
      const fooOption2 = anotherNamespace.addOption({
        name: "fooOption2",
        type: "string",
      });
      const anotherOption = anotherNamespace.addOption({
        name: "anotherOption",
        type: "boolean",
      });
      const fooNewNamespace = config.addNamespace("fooNewNamespace");
      const fooOption3 = fooNewNamespace.addOption({
        name: "fooOption3",
        type: "number",
      });
      const anotherOption3 = fooNewNamespace.addOption({
        name: "anotherOption3",
        type: "object",
      });

      await config.start();

      expect(fooOption2.value).toEqual("foo");
      expect(anotherOption.value).toEqual(false);
      expect(fooOption3.value).toEqual(5);
      expect(anotherOption3.value).toEqual({ fooProperty: true });
    });
  });

  describe("when programmatic config is provided but parentNamespace is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({});
      expect(option.value).toEqual("default-str");
    });
  });

  describe("when programmatic config and parentNamespace are provided but namespace is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({
        parentNamespace: {},
      });
      expect(option.value).toEqual("default-str");
    });
  });

  describe("when programmatic config, parentNamespace and namespace are provided but option is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({
        parentNamespace: { fooNamespace: {} },
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
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init();
      expect(option.value).toEqual("value-from-file");
    });

    it("should throw when config does not pass validation", async () => {
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: 5 } } },
      });
      await expect(config.init()).rejects.toThrow("fooOption");
    });

    it("should overwrite value from init options", async () => {
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({
        parentNamespace: { fooNamespace: { fooOption: "value-from-init" } },
      });
      expect(option.value).toEqual("value-from-file");
    });

    it("should not overwrite value from init options if readFile is disabled", async () => {
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({
        config: { readFile: false },
        parentNamespace: { fooNamespace: { fooOption: "value-from-init" } },
      });
      expect(option.value).toEqual("value-from-init");
    });

    it("should ignore undefined values", async () => {
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: undefined } } },
      });
      await config.init();
      expect(option.value).toEqual("default-str");
    });

    it("should return object when option is of type object", async () => {
      cosmiconfigStub.search.resolves({
        config: {
          parentNamespace: {
            fooNamespace: {
              fooOption: { foo: 1, foo2: { var: false, var2: "x", var4: "y" }, foo3: "z" },
            },
          },
        },
      });
      config = new Config({ moduleName: "testObjectFile" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
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
        .returns({ parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } });
      cosmiconfigStub.search.resolves({
        config: func,
      });
      await config.init({
        parentNamespace: {
          fooNamespace: {
            fooOption: "foo-from-init",
          },
        },
      });
      expect(func.getCall(0).args[0]).toEqual({
        parentNamespace: {
          fooNamespace: {
            fooOption: "foo-from-init",
          },
        },
      });
    });

    it("should return value from result of sync function", async () => {
      cosmiconfigStub.search.resolves({
        config: () => ({ parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } }),
      });
      await config.init();
      expect(option.value).toEqual("value-from-file");
    });

    it("should return value from result of async function", async () => {
      cosmiconfigStub.search.resolves({
        config: () => {
          return Promise.resolve({
            parentNamespace: { fooNamespace: { fooOption: "value-from-file" } },
          });
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
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({
        config: { readFile: false },
      });
      expect(option.value).toEqual("default-str");
    });
  });

  describe("when option is defined in environment var", () => {
    it("should return value from it", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "namespaceTestA" }));
      process.env["NAMESPACE_TEST_A_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init();
      expect(option.value).toEqual("foo-from-env");
    });

    it("should throw when config does not pass validation", async () => {
      config = new Config({ moduleName: "namespaceTestEnvWrong" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      process.env["NAMESPACE_TEST_ENV_WRONG_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] =
        "foo-from-env";
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await expect(config.init()).rejects.toThrowError("fooOption");
    });

    it("should return object value if option is of type object", async () => {
      config = new Config({ moduleName: "namespaceTestObjectEnv" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      process.env["NAMESPACE_TEST_OBJECT_ENV_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] =
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
      ({ config, namespace, option } = createConfig({ moduleName: "namespaceTestB" }));
      process.env["NAMESPACE_TEST_B_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init({ parentNamespace: { fooNamespace: { fooOption: "value-from-init" } } });
      expect(option.value).toEqual("foo-from-env");
    });

    it("should overwrite value from init and file", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "namespaceTestC" }));
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      process.env["NAMESPACE_TEST_C_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init({ parentNamespace: { fooNamespace: { fooOption: "value-from-init" } } });
      expect(option.value).toEqual("foo-from-env");
    });

    it("should merge value from init if option is of type object", async () => {
      config = new Config({ moduleName: "namespaceTestObjectEnvExtend" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      process.env["NAMESPACE_TEST_OBJECT_ENV_EXTEND_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.init({
        parentNamespace: {
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
      config = new Config({ moduleName: "namespaceTestObjectEnvExtendDefault" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      process.env[
        "NAMESPACE_TEST_OBJECT_ENV_EXTEND_DEFAULT_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"
      ] = '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
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
      config = new Config({ moduleName: "namespaceTestObjectEnvExtend2" });
      cosmiconfigStub.search.resolves({
        config: {
          parentNamespace: {
            fooNamespace: { fooOption: { foo2: { var: true, var5: 5 }, foo4: "zy" } },
          },
        },
      });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      process.env["NAMESPACE_TEST_OBJECT_ENV_EXTEND_2_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.init({
        parentNamespace: {
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

    it("should merge value from init and file if option is of type object and namespaces have several levels", async () => {
      let namespace2, option2, option3;
      config = new Config({ moduleName: "namespaceTestObjectEnvExtend4" });
      cosmiconfigStub.search.resolves({
        config: {
          parentNamespace: {
            fooNamespace: {
              secondNamespace: {
                fooOption2: {
                  foo5: { foo8: 8 },
                },
                fooOption3: true,
              },
            },
          },
        },
      });
      process.env[
        "NAMESPACE_TEST_OBJECT_ENV_EXTEND_4_PARENT_NAMESPACE_FOO_NAMESPACE_SECOND_NAMESPACE_FOO_OPTION_2"
      ] = '{"foo5": {"foo9": true}}';
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: 2, foo2: { var: true, var3: "foo" }, foo4: "test" },
        type: "object",
      });
      namespace2 = namespace.addNamespace("secondNamespace");
      option2 = namespace2.addOption({
        name: "fooOption2",
        default: { foo5: { foo6: "x" } },
        type: "object",
      });
      option3 = namespace2.addOption({
        name: "fooOption3",
        default: false,
        type: "boolean",
      });
      await config.init({
        parentNamespace: {
          fooNamespace: {
            secondNamespace: {
              fooOption2: {
                foo5: { foo7: "y" },
              },
              fooOption3: true,
            },
          },
        },
      });
      expect(option.value).toEqual({ foo: 2, foo2: { var: true, var3: "foo" }, foo4: "test" });
      expect(option2.value).toEqual({ foo5: { foo6: "x", foo7: "y", foo8: 8, foo9: true } });
      expect(option3.value).toEqual(true);
    });
  });

  describe("when option is defined in argument", () => {
    it("should return value from it", async () => {
      commander.Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testD" }));
      await config.init();
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should return object if option is of type object", async () => {
      commander.Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": {
          foo: 1,
          foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
        },
      });
      config = new Config({ moduleName: "testArgobject" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
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

    it("should return object if option is of type object and namespaces have several levels", async () => {
      let secondNamespace, option2;
      commander.Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": {
          foo: 1,
          foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
        },
        "parentNamespace.fooNamespace.secondNamespace.fooOption2": {
          foo3: { var3: "y-from-arg" },
        },
      });
      config = new Config({ moduleName: "testArgobject" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      secondNamespace = namespace.addNamespace("secondNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      option2 = secondNamespace.addOption({
        name: "fooOption2",
        default: {},
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
      });
      expect(option2.value).toEqual({
        foo3: { var3: "y-from-arg" },
      });
    });

    it("should not return value from it if it is undefined", async () => {
      commander.Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": undefined,
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testE" }));
      await config.init();
      expect(option.value).toEqual("default-str");
    });

    it("should overwrite value from init", async () => {
      commander.Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testF" }));
      await config.init({ parentNamespace: { fooNamespace: { fooOption: "value-from-init" } } });
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from env var", async () => {
      commander.Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "namespaceTestG" }));
      process.env["NAMESPACE_TEST_G_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init();
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from file", async () => {
      commander.Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testH" }));
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init();
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from init, env var and file", async () => {
      commander.Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "namespaceTestI" }));
      process.env["NAMESPACE_TEST_I_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({ parentNamespace: { fooNamespace: { fooOption: "value-from-init" } } });
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should not overwrite value from init, env var and file if option is boolean, value is true and default value is true", async () => {
      config = new Config({ moduleName: "namespaceTestJ" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "boolean",
      });
      commander.Command.prototype.opts.returns({ "parentNamespace.fooNamespace.fooOption": true });
      process.env["NAMESPACE_TEST_J_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] = false;
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: false } } },
      });
      await config.init({ parentNamespace: { fooNamespace: { fooOption: false } } });
      expect(option.value).toEqual(false);
    });

    it("should merge value from default, init, file and env var if option is of type object", async () => {
      config = new Config({ moduleName: "namespaceTestObjectEnvExtend3" });
      cosmiconfigStub.search.resolves({
        config: {
          parentNamespace: {
            fooNamespace: { fooOption: { foo2: { var: true, var5: 5 }, foo4: "zy" } },
          },
        },
      });
      commander.Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": {
          foo: 1,
          foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
        },
      });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      process.env["NAMESPACE_TEST_OBJECT_ENV_EXTEND_3_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: { foo5: "testing", foo2: { var7: 7 } },
        type: "object",
      });
      await config.init({
        parentNamespace: {
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
