const commander = require("commander");

const { createConfigBeforeElements } = require("../support/helpers");

const Config = require("../../src/Config");

describe("arguments", () => {
  let sandbox, cosmiconfigStub, createConfig, config, namespace, option;

  beforeEach(() => {
    ({ sandbox, cosmiconfigStub, createConfig, config, namespace, option } =
      createConfigBeforeElements());
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when option is defined in argument", () => {
    it("should return value from it", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": "foo-from-arg" });
      ({ config, namespace, option } = createConfig({ moduleName: "testD" }));
      await config.init();
      expect(option.value).toEqual("foo-from-arg");
    });

    it("should not return value from it if readArguments option is disabled in init method", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": "foo-from-arg" });
      ({ config, namespace, option } = createConfig({ moduleName: "testD" }));
      await config.init({ config: { readArguments: false } });
      expect(option.value).toEqual("default-str");
    });

    it("should not allow unknown arguments if allowUnknownArguments is not set in init method", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": "foo-from-arg" });
      ({ config, namespace, option } = createConfig({ moduleName: "testD" }));
      await config.load();
      expect(commander.Command.prototype.allowUnknownOption.callCount).toEqual(1);
    });

    it("should allow unknown arguments if allowUnknownArguments is set in init method", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": "foo-from-arg" });
      ({ config, namespace, option } = createConfig({ moduleName: "testD" }));
      await config.load({ config: { allowUnknownArguments: true } });
      expect(commander.Command.prototype.allowUnknownOption.callCount).toEqual(2);
    });

    it("should return object if option is of type object", async () => {
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": { foo: 1, foo2: { var: true, var2: "x-from-arg", var6: "xyz" } },
      });
      config = new Config({ moduleName: "testArgobject" });
      namespace = config.addNamespace("fooNamespace");
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

    it("should return object if option is of type object when added after init method", async () => {
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": { foo: 1, foo2: { var: true, var2: "x-from-arg", var6: "xyz" } },
      });
      config = new Config({ moduleName: "testArgobject" });
      namespace = config.addNamespace("fooNamespace");
      await config.init();
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      await config.load();
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

    it("should parse value when option is a number", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": "2" });
      config = new Config({ moduleName: "testL" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: 2,
        type: "number",
      });
      await config.init();
      expect(option.value).toEqual(2);
    });

    it("should convert items types when option is an array with itemsType number", async () => {
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": ["1.5", "2"] });
      config = new Config({ moduleName: "testL" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: [2],
        type: "array",
        itemsType: "number",
      });
      await config.init();
      expect(option.value).toEqual([1.5, 2]);
    });

    it("should return undefined when parsing array contents if value is not defined", async () => {
      config = new Config({ moduleName: "testL" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "array",
      });
      await config.init();
      expect(option.value).toEqual(undefined);
    });

    it("should convert items types when option is an array with itemsType object", async () => {
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": ['{ "foo2": "foo2" }', '{ "foo3": "foo3" }'],
      });
      config = new Config({ moduleName: "testL" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: [{ foo: "foo" }],
        type: "array",
        itemsType: "object",
      });
      await config.init();
      expect(option.value).toEqual([{ foo2: "foo2" }, { foo3: "foo3" }]);
    });

    it("should convert items types when option is an array with itemsType boolean", async () => {
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": ["1", "false", "0", "true"],
      });
      config = new Config({ moduleName: "testL" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "array",
        itemsType: "boolean",
      });
      await config.init();
      expect(option.value).toEqual([true, false, false, true]);
    });

    it("should not convert array items when itemType is string", async () => {
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": ["2", "1"],
      });
      config = new Config({ moduleName: "testM" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "array",
        itemsType: "string",
      });
      await config.init();
      expect(option.value).toEqual(["2", "1"]);
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
        type: "boolean",
      });
      commander.Command.prototype.opts.returns({ "fooNamespace.fooOption": true });
      process.env["TEST_J_FOO_NAMESPACE_FOO_OPTION"] = false;
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: false } },
      });
      await config.init({ fooNamespace: { fooOption: false } });
      expect(option.value).toEqual(false);
    });

    it("should merge value from default, init, file and env var if option is of type object", async () => {
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
        type: "object",
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

    it("should merge arrays from init, file and env var if option is of type object", async () => {
      config = new Config({ moduleName: "testObjectEnvExtend4" });
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: { arr: ["file-1"] } } },
      });
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": { arr: ["arg-1"] },
      });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_EXTEND_4_FOO_NAMESPACE_FOO_OPTION"] = '{"arr": ["env-1"]}';
      option = namespace.addOption({
        name: "fooOption",
        default: { arr: ["default-1"] },
        type: "object",
      });
      await config.init({
        fooNamespace: { fooOption: { arr: ["init-1"] } },
      });
      expect(option.value).toEqual({ arr: ["init-1", "file-1", "env-1", "arg-1"] });
    });

    it("should not merge arrays from default, init, file and env var if option is of type object and mergeArrays option is false", async () => {
      config = new Config({ moduleName: "testObjectEnvExtend5", mergeArrays: false });
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: { arr: ["file-1"] } } },
      });
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": { arr: ["arg-1"] },
      });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_OBJECT_ENV_EXTEND_5_FOO_NAMESPACE_FOO_OPTION"] = '{"arr": ["env-1"]}';
      option = namespace.addOption({
        name: "fooOption",
        default: { arr: ["default-1"] },
        type: "object",
      });
      await config.init({
        fooNamespace: { fooOption: { arr: ["init-1"] } },
      });
      expect(option.value).toEqual({ arr: ["arg-1"] });
    });

    it("should merge array values from init, file and env var if option is of type array", async () => {
      config = new Config({ moduleName: "testArrayExtend1" });
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: ["file-1", "file-2"] } },
      });
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": ["arg-1", "arg-2"],
      });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_ARRAY_EXTEND_1_FOO_NAMESPACE_FOO_OPTION"] = '["env-1","env-2"]';
      option = namespace.addOption({
        name: "fooOption",
        default: ["default-1", "default-2"],
        type: "array",
      });
      await config.init({
        fooNamespace: { fooOption: ["init-1", "init-2"] },
      });
      expect(option.value).toEqual([
        "init-1",
        "init-2",
        "file-1",
        "file-2",
        "env-1",
        "env-2",
        "arg-1",
        "arg-2",
      ]);
    });

    it("should not merge array values from init, file and env var if mergeArrays option is false", async () => {
      config = new Config({ moduleName: "testArrayExtend2", mergeArrays: false });
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: ["file-1", "file-2"] } },
      });
      commander.Command.prototype.opts.returns({
        "fooNamespace.fooOption": ["arg-1", "arg-2"],
      });
      namespace = config.addNamespace("fooNamespace");
      process.env["TEST_ARRAY_EXTEND_2_FOO_NAMESPACE_FOO_OPTION"] = '["env-1","env-2"]';
      option = namespace.addOption({
        name: "fooOption",
        type: "array",
        default: ["default-1", "default-2"],
      });
      await config.init({
        fooNamespace: { fooOption: ["init-1", "init-2"] },
      });
      expect(option.value).toEqual(["arg-1", "arg-2"]);
    });
  });
});
