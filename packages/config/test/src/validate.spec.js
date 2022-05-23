const { createConfigBeforeElements } = require("../support/helpers");

const Config = require("../../src/Config");

describe("validate method", () => {
  let sandbox, config, namespace;

  beforeEach(() => {
    ({ sandbox, config, namespace } = createConfigBeforeElements());
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when option is created in root", () => {
    it("should not pass validation when type is string and value does not match type", async () => {
      config = new Config();
      config.addOption({
        name: "fooOption",
        type: "string",
        default: "default-str",
      });
      const validation = config.validate({
        fooOption: 2,
      });
      expect(validation.valid).toEqual(false);
      expect(validation.errors.length).toEqual(1);
    });

    it("should pass validation when type is string and value does not match type", async () => {
      config = new Config();
      config.addOption({
        name: "fooOption",
        type: "string",
        default: "default-str",
      });
      const validation = config.validate({
        fooOption: "2",
      });
      expect(validation.valid).toEqual(true);
      expect(validation.errors).toEqual(null);
    });
  });

  describe("when option is created in namespace", () => {
    it("should not pass validation when type is number and value does not match type", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace.addOption({ name: "fooOption", type: "number" });
      const validation = config.validate({
        foo: {
          fooOption: "foo",
        },
      });
      expect(validation.valid).toEqual(false);
      expect(validation.errors.length).toEqual(1);
    });

    it("should pass validation when type is number and value match type", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace.addOption({ name: "fooOption", type: "number" });
      const validation = config.validate({
        foo: {
          fooOption: 2,
        },
      });
      expect(validation.valid).toEqual(true);
      expect(validation.errors).toEqual(null);
    });
  });

  describe("additional properties", () => {
    it("should not pass validation when additional properties are provided", async () => {
      config = new Config();
      config.addOption({
        name: "fooOption",
        type: "string",
      });
      const validation = config.validate({
        fooOption: "2",
        foo2: "x",
      });
      expect(validation.valid).toEqual(false);
      expect(validation.errors.length).toEqual(1);
    });

    it("should pass validation when when additional properties are provided and additionalProperties option is true", async () => {
      config = new Config();
      config.addOption({
        name: "fooOption",
        type: "string",
        default: "default-str",
      });
      const validation = config.validate(
        {
          fooOption: "2",
          foo2: "x",
        },
        { allowAdditionalProperties: true }
      );
      expect(validation.valid).toEqual(true);
      expect(validation.errors).toEqual(null);
    });
  });
});
