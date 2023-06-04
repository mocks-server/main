import { Command } from "commander";

import { createConfigBeforeElements } from "../support/helpers";

import { Config } from "../../src/Config";

describe("arguments nested", () => {
  let sandbox, cosmiconfigStub, createConfig, config, namespace, parentNamespace, option;

  beforeEach(() => {
    ({ sandbox, cosmiconfigStub, createConfig, parentNamespace, config, namespace, option } =
      createConfigBeforeElements({ createNamespace: true }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when option is defined in argument", () => {
    it("should return value from it", async () => {
      Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testD" }));
      await config.init();

      expect(option.value).toEqual("foo-from-arg");
    });

    it("should return object if option is of type object", async () => {
      Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": {
          foo: 1,
          foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
        },
      });
      config = new Config({ moduleName: "testArgobject" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
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

    it("should return object if option is of type object and namespaces have several levels", async () => {
      let secondNamespace, option2;
      Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": {
          foo: 1,
          foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
        },
        "parentNamespace.fooNamespace.secondNamespace.fooOption2": {
          foo3: { var3: "y-from-arg" },
        },
      });
      config = new Config({ moduleName: "testArgobject" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      secondNamespace = namespace.addNamespace("secondNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: {},
        type: "object",
      });
      option2 = secondNamespace.addOption({
        name: "fooOption2",
        default: {},
        type: "object",
      });
      await config.init();

      expect(option.value).toEqual({
        foo: 1,
        foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
      });
      expect(option2.value).toEqual({
        foo3: { var3: "y-from-arg" },
      });
    });

    it("should not return value from it if it is undefined", async () => {
      Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": undefined,
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testE" }));
      await config.init();

      expect(option.value).toEqual("default-str");
    });

    it("should overwrite value from init", async () => {
      Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testF" }));
      await config.init({ parentNamespace: { fooNamespace: { fooOption: "value-from-init" } } });

      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from env var", async () => {
      Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "namespaceTestG" }));
      process.env["NAMESPACE_TEST_G_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init();

      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from file", async () => {
      Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "testH" }));
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init();

      expect(option.value).toEqual("foo-from-arg");
    });

    it("should overwrite value from init, env var and file", async () => {
      Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": "foo-from-arg",
      });
      ({ config, namespace, option } = createConfig({ moduleName: "namespaceTestI" }));
      process.env["NAMESPACE_TEST_I_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({ parentNamespace: { fooNamespace: { fooOption: "value-from-init" } } });

      expect(option.value).toEqual("foo-from-arg");
    });

    it("should not overwrite value from init, env var and file if option is boolean, value is true and default value is true", async () => {
      config = new Config({ moduleName: "namespaceTestJ" });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: true,
        type: "boolean",
      });
      Command.prototype.opts.returns({ "parentNamespace.fooNamespace.fooOption": true });
      process.env["NAMESPACE_TEST_J_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] = false;
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: false } } },
      });
      await config.init({ parentNamespace: { fooNamespace: { fooOption: false } } });

      expect(option.value).toEqual(false);
    });

    it("should merge value from default, init, file and env var if option is of type object", async () => {
      config = new Config({ moduleName: "namespaceTestObjectEnvExtend3" });
      cosmiconfigStub.search.resolves({
        config: {
          parentNamespace: {
            fooNamespace: { fooOption: { foo2: { var: true, var5: 5 }, foo4: "zy" } },
          },
        },
      });
      Command.prototype.opts.returns({
        "parentNamespace.fooNamespace.fooOption": {
          foo: 1,
          foo2: { var: true, var2: "x-from-arg", var6: "xyz" },
        },
      });
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
      process.env["NAMESPACE_TEST_OBJECT_ENV_EXTEND_3_PARENT_NAMESPACE_FOO_NAMESPACE_FOO_OPTION"] =
        '{"foo": 1, "foo2":{"var": false, "var2": "x"}}';
      option = namespace.addOption({
        name: "fooOption",
        default: { foo5: "testing", foo2: { var7: 7 } },
        type: "object",
      });
      await config.init({
        parentNamespace: {
          fooNamespace: { fooOption: { foo: 2, foo2: { var: true, var4: "y" }, foo3: "z" } },
        },
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
