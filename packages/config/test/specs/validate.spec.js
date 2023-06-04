import { createConfigBeforeElements } from "../support/helpers";

import { Config } from "../../src/Config";

describe("validate method", () => {
  let sandbox, config, namespace;

  beforeEach(() => {
    ({ sandbox, config, namespace } = createConfigBeforeElements());
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when option is created in root", () => {
    function testTypeValidation({
      type,
      itemsType,
      validValue,
      invalidValue,
      default: defaultValue,
      checkInvalid = true,
      extraDescription = "",
    }) {
      const name = "fooOption";

      describe(`${type} type${extraDescription ? ` ${extraDescription}` : ""}`, () => {
        if (!itemsType && checkInvalid) {
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
        }

        if (itemsType && checkInvalid) {
          it("should not pass validation when option is array and value does not match itemsType", async () => {
            config = new Config();
            config.addOption({
              name,
              type,
              itemsType,
              default: defaultValue,
            });
            const validation = config.validate({
              [name]: invalidValue,
            });

            expect(validation.valid).toEqual(false);
            expect(validation.errors.length).toEqual(1);
          });
        }

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

        it("should pass validation when is nullable and default value is null", async () => {
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

        if (!itemsType) {
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
        }

        if (itemsType) {
          it("should pass validation when option is array and value matches itemsType", async () => {
            config = new Config();
            config.addOption({
              name,
              type,
              itemsType,
              default: defaultValue,
            });
            const validation = config.validate({
              [name]: validValue,
            });

            expect(validation.valid).toEqual(true);
            expect(validation.errors).toEqual(null);
          });
        }
      });
    }

    testTypeValidation({
      type: "string",
      invalidValue: 2,
      validValue: "2",
      default: "default-str",
    });

    testTypeValidation({
      type: "object",
      invalidValue: 2,
      validValue: { foo: "bar" },
      default: { foo: "baz" },
    });

    testTypeValidation({
      type: "array",
      itemsType: "string",
      invalidValue: [2],
      validValue: ["2"],
      default: ["default-str"],
      extraDescription: "with itemsType string",
    });

    testTypeValidation({
      type: "number",
      invalidValue: "2",
      validValue: 2,
      default: 3,
    });

    testTypeValidation({
      type: "array",
      itemsType: "number",
      invalidValue: ["2"],
      validValue: [2],
      default: [3],
      extraDescription: "with itemsType number",
    });

    testTypeValidation({
      type: "boolean",
      invalidValue: "2",
      validValue: true,
      default: false,
    });

    testTypeValidation({
      type: "unknown",
      validValue: true,
      default: false,
      checkInvalid: false,
      extraDescription: "with boolean value",
    });

    testTypeValidation({
      type: "array",
      itemsType: "unknown",
      validValue: [true],
      default: [false],
      checkInvalid: false,
      extraDescription: "with itemsType unknown and boolean value",
    });

    testTypeValidation({
      type: "unknown",
      validValue: "foo",
      default: 5,
      checkInvalid: false,
      extraDescription: "with string value and number default",
    });

    testTypeValidation({
      type: "unknown",
      validValue: "foo",
      default: "var",
      checkInvalid: false,
      extraDescription: "with string value",
    });

    testTypeValidation({
      type: "unknown",
      validValue: 4,
      default: 2,
      checkInvalid: false,
      extraDescription: "with number value",
    });

    testTypeValidation({
      type: "unknown",
      validValue: () => {
        // do nothing
      },
      default: 2,
      checkInvalid: false,
      extraDescription: "with function value",
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
