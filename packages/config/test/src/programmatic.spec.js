const { createConfigBeforeElements } = require("../support/helpers");

const Config = require("../../src/Config");

describe("programmatic", () => {
  let sandbox, createConfig, config, namespace, option;

  beforeEach(() => {
    ({ sandbox, createConfig, config, namespace, option } = createConfigBeforeElements());
  });

  afterEach(() => {
    sandbox.restore();
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
});
