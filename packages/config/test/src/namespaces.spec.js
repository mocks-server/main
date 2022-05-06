const sinon = require("sinon");

const { createConfigBeforeElements, wait } = require("../support/helpers");

const Config = require("../../src/Config");

describe("namespaces", () => {
  let sandbox, config, namespace, option;

  beforeEach(() => {
    ({ sandbox, config, namespace, option } = createConfigBeforeElements());
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

    it("should return same namespace if name already exists", async () => {
      let namespace2;
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace2 = config.addNamespace("foo");
      option = namespace.addOption({ name: "foo", default: "foo-value", type: "string" });
      expect(option.value).toEqual("foo-value");
      expect(namespace2.options.size).toEqual(1);
      expect(namespace.options.size).toEqual(1);
      expect(namespace).toBe(namespace2);
    });

    it("should return same nested namespace if name already exists", async () => {
      let namespace2, namespace3;
      config = new Config();
      namespace = config.addNamespace("foo");
      namespace2 = namespace.addNamespace("foo");
      namespace3 = namespace.addNamespace("foo");
      option = namespace3.addOption({ name: "foo", default: "foo-value", type: "string" });
      expect(option.value).toEqual("foo-value");
      expect(namespace3.options.size).toEqual(1);
      expect(namespace2.options.size).toEqual(1);
      expect(namespace2).toBe(namespace3);
    });

    it("should throw if option with same name already exists", async () => {
      config = new Config();
      namespace = config.addNamespace("foo");
      option = namespace.addOption({ name: "fooOption", default: "foo-value", type: "string" });
      expect(() => namespace.addNamespace("fooOption")).toThrow("already exists");
    });

    it("should throw if option with same name already exists in root level", async () => {
      config = new Config();
      option = config.addOption({ name: "fooOption", default: "foo-value", type: "string" });
      expect(() => config.addNamespace("fooOption")).toThrow("already exists");
    });
  });

  describe("when using namespace set method", () => {
    let option2, option3;

    beforeEach(async () => {
      config = new Config({ moduleName: "testNamespaceSet" });
      namespace = config.addNamespace("fooNamespace");
      [option, option2, option3] = namespace.addOptions([
        {
          name: "fooOption",
          default: true,
          type: "boolean",
        },
        {
          name: "fooOption2",
          default: "foo",
          type: "string",
        },
        {
          name: "fooOption3",
          default: { foo: "foo" },
          type: "object",
        },
      ]);
      await config.init();
    });

    it("options should return new values after setting it", async () => {
      expect(option.value).toEqual(true);
      expect(option2.value).toEqual("foo");
      namespace.set({
        fooOption: false,
        fooOption2: "foo-new",
      });
      expect(option.value).toEqual(false);
      expect(option2.value).toEqual("foo-new");
    });

    it("should emit option with new value after setting it", async () => {
      await config.start();
      expect.assertions(4);
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      namespace.onChange((options) => {
        expect(option.value).toEqual(false);
        expect(options[0]).toBe(option);
        resolver();
      });
      expect(option.value).toEqual(true);
      expect(option2.value).toEqual("foo");
      namespace.set({
        fooOption: false,
      });
      return promise;
    });

    it("should emit option with new value after merging it when it is of type object", async () => {
      await config.start();
      expect.assertions(3);
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      namespace.onChange((options) => {
        expect(option3.value).toEqual({ foo: "foo", foo2: "foo2" });
        expect(options[0]).toBe(option3);
        resolver();
      });
      expect(option3.value).toEqual({ foo: "foo" });
      namespace.set({
        fooOption3: { foo2: "foo2" },
      });
      return promise;
    });

    it("should not emit option with same value after merging it when it is of type object", async () => {
      await config.start();
      const spy = sinon.spy();
      namespace.onChange(spy);
      namespace.set({
        fooOption3: { foo: "foo" },
      });
      await wait();
      expect(spy.callCount).toEqual(0);
    });

    it("should not emit before calling to start", async () => {
      const spy = sinon.spy();
      namespace.onChange(spy);
      namespace.set({
        fooOption2: "new-value",
      });
      await wait();
      expect(spy.callCount).toEqual(0);
    });

    it("should emit options with new value after setting it", async () => {
      await config.start();
      expect.assertions(7);
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      namespace.onChange((options) => {
        expect(option.value).toEqual(false);
        expect(option2.value).toEqual("foo-new");
        expect(options[0]).toBe(option);
        expect(options[1]).toBe(option2);
        expect(options.length).toEqual(2);
        resolver();
      });
      expect(option.value).toEqual(true);
      expect(option2.value).toEqual("foo");
      namespace.set({
        fooOption: false,
        fooOption2: "foo-new",
      });
      return promise;
    });

    it("should not emit options with same value after setting it", async () => {
      await config.start();
      expect.assertions(5);
      let resolver;
      const promise = new Promise((resolve) => {
        resolver = resolve;
      });
      namespace.onChange((options) => {
        expect(option.value).toEqual(false);
        expect(options[0]).toBe(option);
        expect(options.length).toEqual(1);
        resolver();
      });
      expect(option.value).toEqual(true);
      expect(option2.value).toEqual("foo");
      namespace.set({
        fooOption: false,
        fooOption2: "foo",
      });
      return promise;
    });

    it("should not emit if all options have same value after setting it", async () => {
      await config.start();
      const spy = sinon.spy();
      namespace.onChange(spy);
      namespace.set({
        fooOption: true,
        fooOption2: "foo",
      });
      await wait();
      expect(spy.callCount).toEqual(0);
    });

    it("should not emit if onChange returned function is executed", async () => {
      await config.start();
      const spy = sinon.spy();
      const removeEvent = namespace.onChange(spy);
      removeEvent();
      namespace.set({
        fooOption: false,
      });
      await wait();
      expect(spy.callCount).toEqual(0);
    });
  });
});
