const sinon = require("sinon");

const { createConfigBeforeElements } = require("../support/helpers");

const Config = require("../../src/Config");

describe("files nested", () => {
  let sandbox, cosmiconfigStub, createConfig, config, namespace, parentNamespace, option;

  beforeEach(() => {
    ({ sandbox, cosmiconfigStub, createConfig, parentNamespace, config, namespace, option } =
      createConfigBeforeElements({ createNamespace: true }));
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
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init();
      expect(option.value).toEqual("value-from-file");
    });

    it("should throw when config does not pass validation", async () => {
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: 5 } } },
      });
      await expect(config.init()).rejects.toThrow("fooOption");
    });

    it("should overwrite value from init options", async () => {
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({
        parentNamespace: { fooNamespace: { fooOption: "value-from-init" } },
      });
      expect(option.value).toEqual("value-from-file");
    });

    it("should not overwrite value from init options if readFile is disabled", async () => {
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({
        config: { readFile: false },
        parentNamespace: { fooNamespace: { fooOption: "value-from-init" } },
      });
      expect(option.value).toEqual("value-from-init");
    });

    it("should ignore undefined values", async () => {
      cosmiconfigStub.search.resolves({
        config: { parentNamespace: { fooNamespace: { fooOption: undefined } } },
      });
      await config.init();
      expect(option.value).toEqual("default-str");
    });

    it("should return object when option is of type object", async () => {
      cosmiconfigStub.search.resolves({
        config: {
          parentNamespace: {
            fooNamespace: {
              fooOption: { foo: 1, foo2: { var: false, var2: "x", var4: "y" }, foo3: "z" },
            },
          },
        },
      });
      config = new Config({ moduleName: "testObjectFile" });
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
      const func = sinon
        .stub()
        .returns({ parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } });
      cosmiconfigStub.search.resolves({
        config: func,
      });
      await config.init({
        parentNamespace: {
          fooNamespace: {
            fooOption: "foo-from-init",
          },
        },
      });
      expect(func.getCall(0).args[0]).toEqual({
        parentNamespace: {
          fooNamespace: {
            fooOption: "foo-from-init",
          },
        },
      });
    });

    it("should return value from result of sync function", async () => {
      cosmiconfigStub.search.resolves({
        config: () => ({ parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } }),
      });
      await config.init();
      expect(option.value).toEqual("value-from-file");
    });

    it("should return value from result of async function", async () => {
      cosmiconfigStub.search.resolves({
        config: () => {
          return Promise.resolve({
            parentNamespace: { fooNamespace: { fooOption: "value-from-file" } },
          });
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
        config: { parentNamespace: { fooNamespace: { fooOption: "value-from-file" } } },
      });
      await config.init({
        config: { readFile: false },
      });
      expect(option.value).toEqual("default-str");
    });
  });
});
