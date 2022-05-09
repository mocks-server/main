const commander = require("commander");
const cosmiconfig = require("cosmiconfig");
const sinon = require("sinon");

const { createConfigBeforeElements } = require("../support/helpers");

const Config = require("../../src/Config");

describe("files", () => {
  let sandbox, cosmiconfigStub, createConfig, config, namespace, option;

  beforeEach(() => {
    ({ sandbox, cosmiconfigStub, createConfig, config, namespace, option } =
      createConfigBeforeElements());
  });

  afterEach(() => {
    sandbox.restore();
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

    it("should pass option to cosmiconfig when config.fileSearchPlaces is defined", async () => {
      cosmiconfigStub.search.resolves({
        config: { fooNamespace: { fooOption: "value-from-file" } },
      });
      await config.init({
        config: {
          fileSearchPlaces: ["foo", "foo2"],
        },
      });
      expect(cosmiconfig.cosmiconfig.getCall(0).args[1].searchPlaces).toEqual(["foo", "foo2"]);
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
});
