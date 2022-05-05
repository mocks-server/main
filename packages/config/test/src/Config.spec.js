const cosmiconfig = require("cosmiconfig");
const commander = require("commander");
const sinon = require("sinon");

const Config = require("../../src/Config");

function wait(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

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
        type: "string",
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

    it("should return same namespace if name already exists", async () => {
      let namespace2;
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace2 = config.addNamespace("foo");
      option = namespace.addOption({ name: "foo", default: "foo-value", type: "string" });
      expect(option.value).toEqual("foo-value");
      expect(namespace2.options.size).toEqual(1);
      expect(namespace.options.size).toEqual(1);
      expect(namespace).toBe(namespace2);
    });

    it("should return same nested namespace if name already exists", async () => {
      let namespace2, namespace3;
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace2 = namespace.addNamespace("foo");
      namespace3 = namespace.addNamespace("foo");
      option = namespace3.addOption({ name: "foo", default: "foo-value", type: "string" });
      expect(option.value).toEqual("foo-value");
      expect(namespace3.options.size).toEqual(1);
      expect(namespace2.options.size).toEqual(1);
      expect(namespace2).toBe(namespace3);
    });

    it("should throw if option with same name already exists", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", default: "foo-value", type: "string" });
      expect(() => namespace.addNamespace("fooOption")).toThrow("already exists");
    });

    it("should throw if option with same name already exists in root level", async () => {
      config = new Config();
      option = config.addOption({ name: "fooOption", default: "foo-value", type: "string" });
      expect(() => config.addNamespace("fooOption")).toThrow("already exists");
    });
  });

  describe("when an option is created", () => {
    it("should have name property", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "string" });
      expect(option.name).toEqual("fooOption");
    });

    it("should throw if option with same name already exist", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "string" });
      expect(() => namespace.addOption({ name: "fooOption", type: "string" })).toThrow(
        "already exists"
      );
    });

    it("should throw if option with same name already exist in root", async () => {
      config = new Config();
      option = config.addOption({ name: "fooOption", type: "string" });
      expect(() => config.addOption({ name: "fooOption", type: "string" })).toThrow(
        "already exists"
      );
    });

    it("should throw if namespace with same name already exist", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace.addNamespace("fooOption");
      expect(() => namespace.addOption({ name: "fooOption", type: "string" })).toThrow(
        "already exists"
      );
    });

    it("should throw if namespace with same name already exist in root", async () => {
      config = new Config();
      config.addNamespace("foo");
      expect(() => config.addOption({ name: "foo", type: "string" })).toThrow("already exists");
    });

    it("should have metaData property", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({
        name: "fooOption",
        type: "string",
        metaData: { restartServer: true },
      });
      expect(option.metaData).toEqual({ restartServer: true });
    });

    it("should throw when type is string and default does not match type", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "string", default: 5 })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is string and value does not match type", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "string" });
      expect(() => (option.value = 5)).toThrowError("5 is not of type string");
    });

    it("should throw when type is number and default does not match type", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "number", default: "5" })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is number and value does not match type", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "number" });
      expect(() => (option.value = "foo")).toThrowError("foo is not of type number");
    });

    it("should throw when type is object and default does not match type", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "object", default: "{}" })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is object and value does not match type", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "object" });
      expect(() => (option.value = "foo")).toThrowError("foo is not of type object");
    });

    it("should throw when type is boolean and default does not match type", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      expect(() =>
        namespace.addOption({ name: "fooOption", type: "boolean", default: "foo" })
      ).toThrowError("default");
    });

    it("should throw when setting value if type is boolean and value does not match type", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "boolean" });
      expect(() => (option.value = 1)).toThrowError("1 is not of type boolean");
    });
  });

  describe("when an option is deprecated", () => {
    let option2;

    beforeEach(() => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "string" });
      option2 = namespace.addOption({
        name: "fooDeprecatedOption",
        deprecatedBy: option,
        type: "string",
      });
    });

    it("should set the value of the new option also", async () => {
      await config.start();
      expect(option.value).toEqual(undefined);
      expect(option2.value).toEqual(undefined);
      option2.value = "foo-value";
      expect(option.value).toEqual("foo-value");
      expect(option2.value).toEqual("foo-value");
    });

    it("should merge the value of the new option also", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "object" });
      option2 = namespace.addOption({
        name: "fooDeprecatedOption",
        deprecatedBy: option,
        type: "object",
      });
      await config.start();
      option2.merge({ foo: "foo" });
      expect(option.value).toEqual({ foo: "foo" });
      expect(option2.value).toEqual({ foo: "foo" });
    });

    it("should set the value of the new option also from init config", async () => {
      await config.start({ foo: { fooDeprecatedOption: "foo-from-init" } });
      expect(option.value).toEqual("foo-from-init");
      expect(option2.value).toEqual("foo-from-init");
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

    it("option should be initializated when calling to start only", async () => {
      await config.start();
      expect(option.value).toEqual("default-str");
    });

    it("should return default value of options of type object", async () => {
      config = new Config({ moduleName: "testObjectDefault" });
      namespace = config.addNamespace("fooNamespace");
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

    it("option omit undefined when setting value", async () => {
      await config.init();
      expect(option.value).toEqual("default-str");
      option.value = undefined;
      expect(option.value).toEqual("default-str");
    });

    it("option should return new value after setting it when it is of type number", async () => {
      config = new Config({ moduleName: "testnumberSet" });
      namespace = config.addNamespace("fooNamespace");
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
      namespace = config.addNamespace("fooNamespace");
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
      namespace = config.addNamespace("fooNamespace");
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
      namespace = config.addNamespace("fooNamespace");
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

    it("option should emit an event after setting new value", async () => {
      expect.assertions(2);
      let resolver;
      await config.start();
      expect(option.value).toEqual("default-str");
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      option.onChange((newValue) => {
        expect(newValue).toEqual("new-str");
        resolver();
      });
      option.value = "new-str";
      return promise;
    });

    it("option should emit an event after setting new value in option in root config", async () => {
      expect.assertions(2);
      let resolver;
      option = config.addOption({
        name: "rootOption",
        type: "string",
        default: "foo-root-value",
      });
      await config.start();
      expect(option.value).toEqual("foo-root-value");
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      option.onChange((newValue) => {
        expect(newValue).toEqual("new-str");
        resolver();
      });
      option.value = "new-str";
      return promise;
    });

    it("option should emit an event after setting new value in option in nested namespace", async () => {
      expect.assertions(2);
      let resolver;
      option = namespace.addNamespace("childNamespace").addNamespace("childNamespace").addOption({
        name: "childOption",
        type: "string",
        default: "foo-child-value",
      });
      await config.start();
      expect(option.value).toEqual("foo-child-value");
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      option.onChange((newValue) => {
        expect(newValue).toEqual("new-str");
        resolver();
      });
      option.value = "new-str";
      return promise;
    });

    it("option should not emit an event after setting same value", async () => {
      expect.assertions(2);
      const spy = sinon.spy();
      await config.start();
      expect(option.value).toEqual("default-str");
      option.onChange(spy);
      option.value = "default-str";
      await wait();

      expect(spy.callCount).toEqual(0);
    });

    it("option should not emit an event before calling to start", async () => {
      expect.assertions(2);
      const spy = sinon.spy();
      await config.init();
      expect(option.value).toEqual("default-str");
      option.onChange(spy);
      option.value = "foo-str";
      await wait();

      expect(spy.callCount).toEqual(0);
    });

    it("option event should be removed if returned callback is executed", async () => {
      expect.assertions(2);
      const spy = sinon.spy();
      await config.start();
      expect(option.value).toEqual("default-str");
      const removeCallback = option.onChange(spy);
      removeCallback();
      option.value = "foo-str";
      await wait();

      expect(spy.callCount).toEqual(0);
    });

    it("option should emit an event after merging new value when it is of type object", async () => {
      expect.assertions(2);
      let resolver;
      config = new Config({ moduleName: "testObjectSet" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: "var" },
        type: "object",
      });
      await config.start();
      expect(option.value).toEqual({ foo: "var" });
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      option.onChange((newValue) => {
        expect(newValue).toEqual({ foo: "var", foo2: "foo" });
        resolver();
      });
      option.merge({ foo2: "foo" });
      return promise;
    });

    it("option should be undefined if no default value is provided", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual(undefined);
    });

    it("option return new value after merging it when it has not default value and option is of type object", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      namespace = config.addNamespace("fooNamespace");
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

  describe("when using namespace set method", () => {
    let option2, option3;

    beforeEach(async () => {
      config = new Config({ moduleName: "testNamespaceSet" });
      namespace = config.addNamespace("fooNamespace");
      [option, option2, option3] = namespace.addOptions([
        {
          name: "fooOption",
          default: true,
          type: "boolean",
        },
        {
          name: "fooOption2",
          default: "foo",
          type: "string",
        },
        {
          name: "fooOption3",
          default: { foo: "foo" },
          type: "object",
        },
      ]);
      await config.init();
    });

    it("options should return new values after setting it", async () => {
      expect(option.value).toEqual(true);
      expect(option2.value).toEqual("foo");
      namespace.set({
        fooOption: false,
        fooOption2: "foo-new",
      });
      expect(option.value).toEqual(false);
      expect(option2.value).toEqual("foo-new");
    });

    it("should emit option with new value after setting it", async () => {
      await config.start();
      expect.assertions(4);
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      namespace.onChange((options) => {
        expect(option.value).toEqual(false);
        expect(options[0]).toBe(option);
        resolver();
      });
      expect(option.value).toEqual(true);
      expect(option2.value).toEqual("foo");
      namespace.set({
        fooOption: false,
      });
      return promise;
    });

    it("should emit option with new value after merging it when it is of type object", async () => {
      await config.start();
      expect.assertions(3);
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      namespace.onChange((options) => {
        expect(option3.value).toEqual({ foo: "foo", foo2: "foo2" });
        expect(options[0]).toBe(option3);
        resolver();
      });
      expect(option3.value).toEqual({ foo: "foo" });
      namespace.set({
        fooOption3: { foo2: "foo2" },
      });
      return promise;
    });

    it("should not emit option with same value after merging it when it is of type object", async () => {
      await config.start();
      const spy = sinon.spy();
      namespace.onChange(spy);
      namespace.set({
        fooOption3: { foo: "foo" },
      });
      await wait();
      expect(spy.callCount).toEqual(0);
    });

    it("should not emit before calling to start", async () => {
      const spy = sinon.spy();
      namespace.onChange(spy);
      namespace.set({
        fooOption2: "new-value",
      });
      await wait();
      expect(spy.callCount).toEqual(0);
    });

    it("should emit options with new value after setting it", async () => {
      await config.start();
      expect.assertions(7);
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      namespace.onChange((options) => {
        expect(option.value).toEqual(false);
        expect(option2.value).toEqual("foo-new");
        expect(options[0]).toBe(option);
        expect(options[1]).toBe(option2);
        expect(options.length).toEqual(2);
        resolver();
      });
      expect(option.value).toEqual(true);
      expect(option2.value).toEqual("foo");
      namespace.set({
        fooOption: false,
        fooOption2: "foo-new",
      });
      return promise;
    });

    it("should not emit options with same value after setting it", async () => {
      await config.start();
      expect.assertions(5);
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      namespace.onChange((options) => {
        expect(option.value).toEqual(false);
        expect(options[0]).toBe(option);
        expect(options.length).toEqual(1);
        resolver();
      });
      expect(option.value).toEqual(true);
      expect(option2.value).toEqual("foo");
      namespace.set({
        fooOption: false,
        fooOption2: "foo",
      });
      return promise;
    });

    it("should not emit if all options have same value after setting it", async () => {
      await config.start();
      const spy = sinon.spy();
      namespace.onChange(spy);
      namespace.set({
        fooOption: true,
        fooOption2: "foo",
      });
      await wait();
      expect(spy.callCount).toEqual(0);
    });

    it("should not emit if onChange returned function is executed", async () => {
      await config.start();
      const spy = sinon.spy();
      const removeEvent = namespace.onChange(spy);
      removeEvent();
      namespace.set({
        fooOption: false,
      });
      await wait();
      expect(spy.callCount).toEqual(0);
    });
  });

  describe("when programmatic config is provided in init method", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("should throw when config does not pass validation", async () => {
      await expect(
        config.init({
          fooNamespace: { fooOption: false },
        })
      ).rejects.toThrowError("fooOption");
    });

    it("should throw when config does not pass validation when calling to start", async () => {
      await expect(
        config.start({
          fooNamespace: { fooOption: false },
        })
      ).rejects.toThrowError("fooOption");
    });

    it("option should get value from it", async () => {
      await config.init({
        fooNamespace: { fooOption: "foo-value-2" },
      });
      expect(option.value).toEqual("foo-value-2");
    });

    it("option should get value from it when calling to start", async () => {
      await config.start({
        fooNamespace: { fooOption: "foo-value-2" },
      });
      expect(option.value).toEqual("foo-value-2");
    });

    it("option should have cloned value", async () => {
      config = new Config({ moduleName: "testObjectClone" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: "var" },
        type: "object",
      });
      const value = { fooOption: { foo: "foo" } };
      await config.init({
        fooNamespace: value,
      });
      value.fooOption.foo = "foo2";
      expect(option.value).not.toBe(value.fooOption);
      expect(option.value).toEqual({ foo: "foo" });
    });

    it("should merge value from default if option is of type object", async () => {
      config = new Config({ moduleName: "testObjectInitExtend" });
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: 2, foo2: { var: true, var3: "foo" }, foo4: "test" },
        type: "object",
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

    it("should merge value from default if option is of type object when added after init method", async () => {
      config = new Config({ moduleName: "testObjectInitExtend" });
      namespace = config.addNamespace("fooNamespace");
      await config.init({
        fooNamespace: { fooOption: { foo: 4, foo2: { var: false, var4: "y" }, foo3: "z" } },
      });
      option = namespace.addOption({
        name: "fooOption",
        default: { foo: 2, foo2: { var: true, var3: "foo" }, foo4: "test" },
        type: "object",
      });
      await config.start();
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
      await config.init({});
      expect(option.value).toEqual("default-str");
    });
  });

  describe("when programmatic config and namespace are provided but option is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({
        fooNamespace: {},
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

    it("should not return value from file if readFile is disabled in init method", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.init({
        config: { readFile: false },
      });
      expect(option.value).toEqual("default-str");
    });

    it("should not return value from file if readFile is disabled in argument", async () => {
      commander.Command.prototype.opts.returns({ "config.readFile": false });
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.start();
      expect(option.value).toEqual("default-str");
    });

    it("should not return value from file if readFile is disabled in environment", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "testLoadFileDisabled" }));
      process.env["TEST_LOAD_FILE_DISABLED_CONFIG_READ_FILE"] = "0";
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.init();
      expect(option.value).toEqual("default-str");
    });

    it("should throw when config does not pass validation", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: 5 } },
      });
      await expect(config.init()).rejects.toThrow("fooOption");
    });

    it("should overwrite value from init options", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.start({
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

    it("should return object when option is of type object", async () => {
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
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: false, var2: "x", var4: "y" },
        foo3: "z",
      });
    });

    it("should return object when option is of type object and it is added after init method", async () => {
      cosmiconfigStub.search.resolves({
        config: {
          fooNamespace: {
            fooOption: { foo: 1, foo2: { var: false, var2: "x", var4: "y" }, foo3: "z" },
          },
        },
      });
      config = new Config({ moduleName: "testObjectFile" });
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
      const func = sinon.stub().returns({ fooNamespace: { fooOption: "value-from-file" } });
      cosmiconfigStub.search.resolves({
        config: func,
      });
      await config.init({
        fooNamespace: {
          fooOption: "foo-from-init",
        },
      });
      expect(func.getCall(0).args[0]).toEqual({
        fooNamespace: {
          fooOption: "foo-from-init",
        },
      });
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
      expect(commander.Option.prototype.argParser.getCall(3).args[0]("1.5")).toEqual(1.5);
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
