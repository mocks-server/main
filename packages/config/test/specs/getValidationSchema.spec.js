import { createConfigBeforeElements } from "../support/helpers";

import { Config } from "../../src/Config";

describe("getValidationSchema method", () => {
  let sandbox, config, namespace;

  beforeEach(() => {
    ({ sandbox, config, namespace } = createConfigBeforeElements());
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when option is created in root", () => {
    it("should return a valid validation schema", async () => {
      config = new Config();
      config.addOption({
        name: "fooOption",
        type: "string",
        default: "default-str",
      });
      const validationSchema = config.getValidationSchema();
      expect(validationSchema).toEqual({
        type: "object",
        properties: {
          fooOption: { type: "string" },
          config: {
            type: "object",
            properties: {
              readFile: { type: "boolean" },
              readArguments: { type: "boolean" },
              readEnvironment: { type: "boolean" },
              fileSearchPlaces: { type: "array", items: { type: "string" } },
              fileSearchFrom: { type: "string" },
              fileSearchStop: { type: "string" },
              allowUnknownArguments: { type: "boolean" },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      });
    });
  });

  describe("when option is created in namespace", () => {
    it("should return a valid validation schema", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace.addOption({ name: "fooOption", type: "number" });
      const validationSchema = config.getValidationSchema();
      expect(validationSchema).toEqual({
        type: "object",
        properties: {
          config: {
            type: "object",
            properties: {
              readFile: { type: "boolean" },
              readArguments: { type: "boolean" },
              readEnvironment: { type: "boolean" },
              fileSearchPlaces: { type: "array", items: { type: "string" } },
              fileSearchFrom: { type: "string" },
              fileSearchStop: { type: "string" },
              allowUnknownArguments: { type: "boolean" },
            },
            additionalProperties: false,
          },
          foo: {
            type: "object",
            properties: { fooOption: { type: "number" } },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      });
    });

    it("should return a valid validation schema when additionalProperties are allowed", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace.addOption({ name: "fooOption", type: "number" });
      const validationSchema = config.getValidationSchema({ allowAdditionalProperties: true });
      expect(validationSchema).toEqual({
        type: "object",
        properties: {
          config: {
            type: "object",
            properties: {
              readFile: { type: "boolean" },
              readArguments: { type: "boolean" },
              readEnvironment: { type: "boolean" },
              fileSearchPlaces: { type: "array", items: { type: "string" } },
              fileSearchFrom: { type: "string" },
              fileSearchStop: { type: "string" },
              allowUnknownArguments: { type: "boolean" },
            },
            additionalProperties: true,
          },
          foo: {
            type: "object",
            properties: { fooOption: { type: "number" } },
            additionalProperties: true,
          },
        },
        additionalProperties: true,
      });
    });

    it("should return a valid validation schema when unknown type is used", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace.addOption({ name: "fooOption", type: "unknown" });
      namespace.addOption({ name: "fooOption2", type: "array", itemsType: "unknown" });
      namespace.addOption({ name: "fooOption3", type: "unknown", nullable: true });
      const validationSchema = config.getValidationSchema({ allowAdditionalProperties: true });
      expect(validationSchema).toEqual({
        type: "object",
        properties: {
          config: {
            type: "object",
            properties: {
              readFile: { type: "boolean" },
              readArguments: { type: "boolean" },
              readEnvironment: { type: "boolean" },
              fileSearchPlaces: { type: "array", items: { type: "string" } },
              fileSearchFrom: { type: "string" },
              fileSearchStop: { type: "string" },
              allowUnknownArguments: { type: "boolean" },
            },
            additionalProperties: true,
          },
          foo: {
            type: "object",
            properties: {
              fooOption: { type: ["boolean", "number", "string", "object", "array"] },
              fooOption2: {
                type: "array",
                items: { type: ["boolean", "number", "string", "object", "array"] },
              },
              fooOption3: { type: ["boolean", "number", "string", "object", "array", "null"] },
            },
            additionalProperties: true,
          },
        },
        additionalProperties: true,
      });
    });
  });
});
