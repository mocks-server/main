import { createConfigBeforeElements } from "../support/helpers";

import { Config } from "../../src/Config";

describe("namespaces nested", () => {
  let sandbox, createConfig, config, namespace, parentNamespace, option;

  beforeEach(() => {
    ({ sandbox, createConfig, parentNamespace, config, namespace, option } =
      createConfigBeforeElements({ createNamespace: true }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when a namespace is created", () => {
    it("should have name property", async () => {
      config = new Config();
      parentNamespace = config.addNamespace("foo");

      expect(parentNamespace.name).toEqual("foo");
    });

    it("should throw if no name is provided", async () => {
      ({ namespace } = createConfig());

      expect(() => namespace.addNamespace()).toThrow("provide a name");
    });

    it("should throw if no name is provided when created in root", async () => {
      ({ config } = createConfig());

      expect(() => config.addNamespace()).toThrow("provide a name");
    });
  });

  describe("when started", () => {
    beforeEach(() => {
      ({ config, parentNamespace, namespace, option } = createConfig());
    });

    it("should have root property returning root config", async () => {
      namespace = config.addNamespace("foo");

      expect(parentNamespace.root).toBe(config);
      expect(namespace.root).toBe(config);
      expect(config.root).toBe(config);
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
      await expect(config.load()).rejects.toThrow("fooNewNamespace");
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
      await expect(config.load()).rejects.toThrow("anotherNamespace");
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

      await config.load();

      expect(fooOption2.value).toEqual("foo");
      expect(anotherOption.value).toEqual(false);
      expect(fooOption3.value).toEqual(5);
      expect(anotherOption3.value).toEqual({ fooProperty: true });
    });
  });
});
