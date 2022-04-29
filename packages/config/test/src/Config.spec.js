const cosmiconfig = require("cosmiconfig");
const sinon = require("sinon");

const Config = require("../../src/Config");

describe("Config", () => {
  let sandbox, cosmiconfigStub, createConfig, config, namespace, option;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    cosmiconfigStub = {
      search: sandbox.stub(),
    };
    sandbox.stub(cosmiconfig, "cosmiconfig").returns(cosmiconfigStub);
    createConfig = function (options) {
      config = new Config(options);
      namespace = config.addNamespace("fooNamespace");
      option = namespace.addOption({
        name: "fooOption",
        default: false,
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
      expect(option.value).toEqual(false);
    });

    it("option should return new value after setting it", async () => {
      await config.init();
      expect(option.value).toEqual(false);
      option.value = "new-foo";
      expect(option.value).toEqual("new-foo");
    });
  });

  describe("when programmatic config is provided", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return value from programmatic options", async () => {
      await config.init({
        fooNamespace: { fooOption: "foo-value" },
      });
      expect(option.value).toEqual("foo-value");
    });
  });

  describe("when programmatic config is provided in init method", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should get value from it", async () => {
      await config.init({
        fooNamespace: { fooOption: "foo-value-2" },
      });
      expect(option.value).toEqual("foo-value-2");
    });

    it("option should have cloned value", async () => {
      const fooNamespace = { fooOption: { foo: "foo" } };
      await config.init({
        fooNamespace,
      });
      fooNamespace.fooOption.foo = "foo2";
      expect(option.value).not.toBe(fooNamespace.fooOption);
      expect(option.value).toEqual({ foo: "foo" });
    });
  });

  describe("when programmatic config is provided but namespace is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({
        foo: {},
      });
      expect(option.value).toEqual(false);
    });
  });

  describe("when programmatic config and namespace are provided but option is undefined", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
    });

    it("option should return default value", async () => {
      await config.init({
        fooNamespace: { fooOtherOption: "foo-value" },
      });
      expect(option.value).toEqual(false);
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

    it("should overwrite value from init options", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.init({
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
      expect(option.value).toEqual(false);
    });
  });

  describe("when file returns a function", () => {
    beforeEach(() => {
      ({ config, namespace, option } = createConfig());
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
      expect(option.value).toEqual(false);
    });
  });

  describe("when option is defined in environment var", () => {
    it("should return value from it", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "testA" }));
      process.env["TEST_A_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init();
      expect(option.value).toEqual("foo-from-env");
    });

    it("should overwrite value from init", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "testA" }));
      process.env["TEST_A_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init({ fooNamespace: { fooOption: "value-from-init" } });
      expect(option.value).toEqual("foo-from-env");
    });

    it("should overwrite value from init and file", async () => {
      ({ config, namespace, option } = createConfig({ moduleName: "testA" }));
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      process.env["TEST_A_FOO_NAMESPACE_FOO_OPTION"] = "foo-from-env";
      await config.init({ fooNamespace: { fooOption: "value-from-init" } });
      expect(option.value).toEqual("foo-from-env");
    });
  });
});
