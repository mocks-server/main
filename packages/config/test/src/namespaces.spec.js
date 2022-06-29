const { createConfigBeforeElements } = require("../support/helpers");

const Config = require("../../src/Config");

describe("namespaces", () => {
  let sandbox, config, namespace, option;

  beforeEach(() => {
    ({ sandbox, config, namespace, option } = createConfigBeforeElements());
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

    it("should be available using namespaces getter", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      expect(config.namespaces.includes(namespace)).toBe(true);
    });

    it("should have root property returning root config", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      expect(namespace.root).toBe(config);
      expect(config.root).toBe(config);
    });

    it("should return same namespace if name already exists", async () => {
      let namespace2;
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace2 = config.addNamespace("foo");
      option = namespace.addOption({ name: "foo", default: "foo-value", type: "string" });
      expect(option.value).toEqual("foo-value");
      expect(namespace2.options.length).toEqual(1);
      expect(namespace.options.length).toEqual(1);
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
      expect(namespace3.options.length).toEqual(1);
      expect(namespace2.options.length).toEqual(1);
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
});
