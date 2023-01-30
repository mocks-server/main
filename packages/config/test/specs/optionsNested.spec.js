import { createConfigBeforeElements } from "../support/helpers";

import { Config } from "../../src/Config";

describe("options nested", () => {
  let sandbox, createConfig, config, namespace, parentNamespace, option;

  beforeEach(() => {
    ({ sandbox, createConfig, parentNamespace, config, namespace, option } =
      createConfigBeforeElements({ createNamespace: true }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when an option is created", () => {
    it("should have name property", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "string" });
      expect(option.name).toEqual("fooOption");
    });

    it("should be available using namespace option method", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");
      namespace = parentNamespace.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", type: "string" });
      expect(config.namespace("foo").namespace("foo").option("fooOption")).toBe(option);
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

  describe("created options", () => {
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

    it("option should return new value after setting it when option is of type object and merge is true", async () => {
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
      option.set({ foo2: "var2" }, { merge: true });
      expect(option.value).toEqual({ foo2: "var2", foo: "var" });
    });

    it("option should not set value if it is undefined when option is of type object", async () => {
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
      option.set(undefined);
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

    it("option return new value after setting it when it has not default value and option is of type object and merge option is true", async () => {
      config = new Config({ moduleName: "testObjectSet" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        type: "object",
      });
      await config.init();
      expect(option.value).toEqual(undefined);
      option.set({ foo: "var" }, { merge: true });
      expect(option.value).toEqual({ foo: "var" });
    });
  });
});
