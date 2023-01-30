import { createConfigBeforeElements } from "../support/helpers";

import { Config } from "../../src/Config";

describe("namespaces", () => {
  let sandbox, config, namespace;

  beforeEach(() => {
    ({ sandbox, config, namespace } = createConfigBeforeElements());
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

    it("should throw if name already exists", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      expect(() => config.addNamespace("foo")).toThrow("already exists");
    });

    it("should throw if nested namespace name already exists", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace.addNamespace("foo");
      expect(() => namespace.addNamespace("foo")).toThrow("already exists");
    });

    it("should throw if option with same name already exists", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace.addOption({ name: "fooOption", type: "boolean" });
      expect(() => namespace.addNamespace("fooOption")).toThrow("already exists");
    });

    it("should throw if option with same name already exists in root level", async () => {
      config = new Config();
      config.addOption({ name: "fooOption", default: "foo-value", type: "string" });
      expect(() => config.addNamespace("fooOption")).toThrow("already exists");
    });
  });
});
