import { createConfigBeforeElements } from "../support/helpers";

import Config from "../../src/Config";

describe("environment nested", () => {
  let sandbox, cosmiconfigStub, createConfig, config, namespace, parentNamespace, option;

  beforeEach(() => {
    ({ sandbox, cosmiconfigStub, createConfig, parentNamespace, config, namespace, option } =
      createConfigBeforeElements({ createNamespace: true }));
  });

  afterEach(() => {
    sandbox.restore();
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
});
