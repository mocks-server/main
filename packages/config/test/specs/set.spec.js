import { createConfigBeforeElements } from "../support/helpers";

import { Config } from "../../src/Config";

describe("set method", () => {
  let sandbox, config, namespace, option;

  beforeEach(() => {
    ({ sandbox, config, namespace, option } = createConfigBeforeElements());
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("in root config", () => {
    it("should change namespaces and options values", async () => {
      config = new Config();
      config.addOptions([
        {
          name: "fooOption",
          type: "string",
          default: "default-str",
        },
        {
          name: "fooOption2",
          type: "number",
          default: 2,
        },
      ]);
      namespace = config.addNamespace("fooNamespace");
      namespace.addOption({
        name: "foo",
        type: "boolean",
        default: false,
      });
      namespace.addNamespace("foo2").addOption({
        name: "foo3",
        type: "array",
        default: [1, 2, 3],
      });
      await config.init();
      config.set({
        config: {
          allowUnknownArguments: false,
          fileSearchPlaces: undefined,
          readArguments: true,
          readEnvironment: true,
          readFile: true,
        },
        fooOption: "foo",
        fooOption2: 5,
        fooNamespace: {
          foo: true,
          foo2: {
            foo3: [3, 2, 1],
          },
        },
      });

      expect(config.value).toEqual({
        config: {
          allowUnknownArguments: false,
          fileSearchPlaces: undefined,
          readArguments: true,
          readEnvironment: true,
          readFile: true,
        },
        fooOption: "foo",
        fooOption2: 5,
        fooNamespace: {
          foo: true,
          foo2: {
            foo3: [3, 2, 1],
          },
        },
      });

      expect(config.option("fooOption").value).toEqual("foo");
      expect(config.option("fooOption2").value).toEqual(5);
      expect(config.namespace("fooNamespace").option("foo").value).toEqual(true);
      expect(config.namespace("fooNamespace").namespace("foo2").option("foo3").value).toEqual([
        3, 2, 1,
      ]);
    });

    it("should set only defined options", async () => {
      config = new Config();
      config.addOptions([
        {
          name: "fooOption",
          type: "string",
          default: "default-str",
        },
        {
          name: "fooOption2",
          type: "number",
          default: 2,
        },
      ]);
      namespace = config.addNamespace("fooNamespace");
      namespace.addOption({
        name: "foo",
        type: "boolean",
        default: false,
      });
      namespace.addOption({
        name: "foo2",
        type: "boolean",
        default: true,
      });
      await config.init();
      config.set({
        config: {
          allowUnknownArguments: false,
        },
        fooOption: "foo",
        fooNamespace: {
          foo: true,
        },
      });

      expect(config.value).toEqual({
        config: {
          allowUnknownArguments: false,
          fileSearchPlaces: undefined,
          readArguments: true,
          readEnvironment: true,
          readFile: true,
        },
        fooOption: "foo",
        fooOption2: 2,
        fooNamespace: {
          foo: true,
          foo2: true,
        },
      });

      expect(config.option("fooOption").value).toEqual("foo");
      expect(config.option("fooOption").hasBeenSet).toEqual(true);
      expect(config.option("fooOption2").value).toEqual(2);
      expect(config.option("fooOption2").hasBeenSet).toEqual(false);
      expect(config.namespace("fooNamespace").option("foo").value).toEqual(true);
      expect(config.namespace("fooNamespace").option("foo").hasBeenSet).toEqual(true);
      expect(config.namespace("fooNamespace").option("foo2").value).toEqual(true);
      expect(config.namespace("fooNamespace").option("foo2").hasBeenSet).toEqual(false);
    });

    it("should change namespaces and options values when using value setter", async () => {
      config = new Config();
      config.addOptions([
        {
          name: "fooOption",
          type: "string",
          default: "default-str",
        },
        {
          name: "fooOption2",
          type: "number",
          default: 2,
        },
      ]);
      namespace = config.addNamespace("fooNamespace");
      namespace.addOption({
        name: "foo",
        type: "boolean",
        default: false,
      });
      namespace.addNamespace("foo2").addOption({
        name: "foo3",
        type: "array",
        default: [1, 2, 3],
      });
      await config.init();
      config.value = {
        config: {
          allowUnknownArguments: false,
          fileSearchPlaces: undefined,
          readArguments: true,
          readEnvironment: true,
          readFile: true,
        },
        fooOption: "foo",
        fooOption2: 5,
        fooNamespace: {
          foo: true,
          foo2: {
            foo3: [3, 2, 1],
          },
        },
      };

      expect(config.value).toEqual({
        config: {
          allowUnknownArguments: false,
          fileSearchPlaces: undefined,
          readArguments: true,
          readEnvironment: true,
          readFile: true,
        },
        fooOption: "foo",
        fooOption2: 5,
        fooNamespace: {
          foo: true,
          foo2: {
            foo3: [3, 2, 1],
          },
        },
      });

      expect(config.option("fooOption").value).toEqual("foo");
      expect(config.option("fooOption2").value).toEqual(5);
      expect(config.namespace("fooNamespace").option("foo").value).toEqual(true);
      expect(config.namespace("fooNamespace").namespace("foo2").option("foo3").value).toEqual([
        3, 2, 1,
      ]);
    });

    it("should merge options values when options are objects and merge option is true", async () => {
      config = new Config();
      config.addOptions([
        {
          name: "fooOption",
          type: "object",
          default: { foo1: "foo1" },
        },
      ]);
      namespace = config.addNamespace("fooNamespace");
      namespace.addOption({
        name: "foo",
        type: "object",
        default: { foo3: "foo3" },
      });
      await config.init();
      config.set(
        {
          fooOption: { foo2: "foo2" },
          fooNamespace: {
            foo: { foo4: "foo4" },
          },
        },
        { merge: true }
      );

      expect(config.value).toEqual({
        config: {
          allowUnknownArguments: false,
          fileSearchPlaces: undefined,
          readArguments: true,
          readEnvironment: true,
          readFile: true,
        },
        fooOption: { foo1: "foo1", foo2: "foo2" },
        fooNamespace: {
          foo: { foo3: "foo3", foo4: "foo4" },
        },
      });

      expect(config.option("fooOption").value).toEqual({ foo1: "foo1", foo2: "foo2" });
      expect(config.namespace("fooNamespace").option("foo").value).toEqual({
        foo3: "foo3",
        foo4: "foo4",
      });
    });

    it("should do nothing if called with undefined", async () => {
      config = new Config();
      config.addOptions([
        {
          name: "fooOption",
          type: "string",
          default: "default-str",
        },
        {
          name: "fooOption2",
          type: "number",
          default: 2,
        },
      ]);
      await config.init();
      config.set();

      expect(config.value).toEqual({
        config: {
          allowUnknownArguments: false,
          fileSearchPlaces: undefined,
          readArguments: true,
          readEnvironment: true,
          readFile: true,
        },
        fooOption: "default-str",
        fooOption2: 2,
      });
    });
  });

  describe("in namespace", () => {
    it("should change namespaces and options values", async () => {
      config = new Config();
      namespace = config.addNamespace("fooNamespace");
      namespace.addOption({
        name: "foo",
        type: "boolean",
        default: false,
      });
      namespace.addNamespace("foo2").addOption({
        name: "foo3",
        type: "array",
        default: [1, 2, 3],
      });
      await config.init();
      namespace.set({
        foo: true,
        foo2: {
          foo3: [3, 2, 1],
        },
      });

      expect(namespace.value).toEqual({
        foo: true,
        foo2: {
          foo3: [3, 2, 1],
        },
      });

      expect(namespace.option("foo").value).toEqual(true);
      expect(namespace.namespace("foo2").option("foo3").value).toEqual([3, 2, 1]);
    });

    it("should change namespaces and options values when using value setter", async () => {
      config = new Config();
      namespace = config.addNamespace("fooNamespace");
      namespace.addOption({
        name: "foo",
        type: "boolean",
        default: false,
      });
      namespace.addNamespace("foo2").addOption({
        name: "foo3",
        type: "array",
        default: [1, 2, 3],
      });
      await config.init();
      namespace.value = {
        foo: true,
        foo2: {
          foo3: [3, 2, 1],
        },
      };

      expect(namespace.value).toEqual({
        foo: true,
        foo2: {
          foo3: [3, 2, 1],
        },
      });

      expect(namespace.option("foo").value).toEqual(true);
      expect(namespace.namespace("foo2").option("foo3").value).toEqual([3, 2, 1]);
    });

    it("should do nothing if called with undefined", async () => {
      config = new Config();
      namespace = config.addNamespace("fooNamespace");
      namespace.addOption({
        name: "foo",
        type: "boolean",
        default: false,
      });
      namespace.addNamespace("foo2").addOption({
        name: "foo3",
        type: "array",
        default: [1, 2, 3],
      });
      await config.init();
      namespace.set();

      expect(namespace.value).toEqual({
        foo: false,
        foo2: {
          foo3: [1, 2, 3],
        },
      });

      expect(namespace.option("foo").value).toEqual(false);
      expect(namespace.namespace("foo2").option("foo3").value).toEqual([1, 2, 3]);
    });

    it("should merge options values when option is object and merge option is true", async () => {
      config = new Config();
      namespace = config.addNamespace("fooNamespace");
      namespace.addNamespace("foo2").addOption({
        name: "foo3",
        type: "object",
        default: { foo: "foo" },
      });
      await config.init();
      namespace.set(
        {
          foo2: {
            foo3: { foo2: "foo2" },
          },
        },
        { merge: true }
      );

      expect(namespace.value).toEqual({
        foo2: {
          foo3: { foo: "foo", foo2: "foo2" },
        },
      });

      expect(namespace.namespace("foo2").option("foo3").value).toEqual({
        foo: "foo",
        foo2: "foo2",
      });
    });
  });

  describe("in option", () => {
    it("should merge value when option is object and merge option is true", async () => {
      config = new Config();
      option = config.addNamespace("foo2").addOption({
        name: "foo3",
        type: "object",
        default: { foo: "foo", child: { fooA: "foo-a" } },
      });
      await config.init();
      option.set({ foo2: "foo2", child: { fooB: "foo-b" } }, { merge: true });

      expect(option.value).toEqual({
        foo: "foo",
        foo2: "foo2",
        child: { fooA: "foo-a", fooB: "foo-b" },
      });
    });

    it("should not merge arrays values when option is object and merge option is true", async () => {
      config = new Config();
      option = config.addNamespace("foo2").addOption({
        name: "foo3",
        type: "object",
        default: { foo: "foo", array: [1, 2, 3] },
      });
      await config.init();
      option.set({ foo2: "foo2", array: [4, 5, 6] }, { merge: true });

      expect(option.value).toEqual({
        foo: "foo",
        foo2: "foo2",
        array: [4, 5, 6],
      });
    });

    it("should not merge value when option is object", async () => {
      config = new Config();
      option = config.addNamespace("foo2").addOption({
        name: "foo3",
        type: "object",
        default: { foo: "foo" },
      });
      await config.init();
      option.set({ foo2: "foo2" });

      expect(option.value).toEqual({ foo2: "foo2" });
    });
  });
});
