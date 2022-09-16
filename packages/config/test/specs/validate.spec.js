import { createConfigBeforeElements } from "../support/helpers";

import Config from "../../src/Config";

describe("validate method", () => {
  let sandbox, config, namespace;

  beforeEach(() => {
    ({ sandbox, config, namespace } = createConfigBeforeElements());
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when option is created in root", () => {
    function testTypeValidation({ type, validValue, invalidValue, default: defaultValue }) {
      const name = "fooOption";

      describe(`${type} type`, () => {
        it("should not pass validation when value does not match type", async () => {
          config = new Config();
          config.addOption({
            name,
            type,
            default: defaultValue,
          });
          const validation = config.validate({
            [name]: invalidValue,
          });
          expect(validation.valid).toEqual(false);
          expect(validation.errors.length).toEqual(1);
        });

        it("should pass validation when is nullable and value is null", async () => {
          config = new Config();
          config.addOption({
            name,
            type,
            nullable: true,
            default: defaultValue,
          });
          const validation = config.validate({
            [name]: null,
          });
          expect(validation.valid).toEqual(true);
          expect(validation.errors).toEqual(null);
        });

        it("should not throw when is nullable and value is set to null", async () => {
          config = new Config();
          config.addOption({
            name,
            type,
            nullable: true,
            default: defaultValue,
          });
          config.option(name).value = null;
          expect(config.option(name).value).toEqual(null);
        });

        it("should pass validation when is nullable string and default value is null", async () => {
          config = new Config();
          config.addOption({
            name,
            type,
            default: null,
            nullable: true,
          });
          const validation = config.validate({
            [name]: validValue,
          });
          expect(validation.valid).toEqual(true);
          expect(validation.errors).toEqual(null);
        });

        it("should pass validation when value matches type", async () => {
          config = new Config();
          config.addOption({
            name,
            type,
            default: defaultValue,
          });
          const validation = config.validate({
            [name]: validValue,
          });
          expect(validation.valid).toEqual(true);
          expect(validation.errors).toEqual(null);
        });
      });
    }

    testTypeValidation({
      type: "string",
      invalidValue: 2,
      validValue: "2",
      default: "default-str",
    });

    testTypeValidation({
      type: "number",
      invalidValue: "2",
      validValue: 2,
      default: 3,
    });

    testTypeValidation({
      type: "boolean",
      invalidValue: "2",
      validValue: true,
      default: false,
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
