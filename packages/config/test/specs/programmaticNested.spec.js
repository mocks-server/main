import { createConfigBeforeElements } from "../support/helpers";

import { Config } from "../../src/Config";

describe("programmatic nested", () => {
  let sandbox, createConfig, config, namespace, parentNamespace, option;

  beforeEach(() => {
    ({ sandbox, createConfig, parentNamespace, config, namespace, option } =
      createConfigBeforeElements({ createNamespace: true }));
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

    it("should throw when config does not pass validation and namespaces have several levels when calling to start", async () => {
      namespace.addNamespace("secondNamespace").addOption({
        name: "fooOption2",
        type: "string",
      });

      await expect(
        config.load({
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
});
