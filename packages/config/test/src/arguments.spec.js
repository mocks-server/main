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
      await config.start();
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

    it("commander should call to number parser when option is a number", async () => {
      config = new Config({ moduleName: "testL" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: 2,
        type: "number",
      });
      await config.init();
      // first three calls are from config options
      expect(commander.Option.prototype.argParser.getCall(4).args[0]("1.5")).toEqual(1.5);
    });

    it("commander should call to empty parser when option is a string", async () => {
      config = new Config({ moduleName: "testM" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: "foo",
        type: "string",
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
  });
});
