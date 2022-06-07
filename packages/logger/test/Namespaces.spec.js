import { createSandbox } from "sinon";
import Logger from "../src/Logger.ts";

import { formattedLog, cleanLogs } from "./support";

const LABEL = "foo-label";

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
};

describe("Namespaces", () => {
  let sandbox;
  let logger;
  let namespace;

  beforeEach(() => {
    sandbox = createSandbox();
    sandbox.stub(console, "log");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when a namespace is created", () => {
    beforeEach(() => {
      logger = new Logger(LABEL);
      namespace = logger.namespace("foo-label-2");
    });

    describe("label", () => {
      it("should have label composed by its parent label", () => {
        expect(namespace.label).toEqual("foo-label:foo-label-2");
      });

      it("should log with namespace label", () => {
        namespace.info("Hello world");
        expect(cleanLogs(console.log.getCall(0).args[0])).toEqual(
          formattedLog("foo-label:foo-label-2", "info", "Hello world")
        );
      });

      it("should have label composed by all its ancestor labels", () => {
        expect(namespace.namespace("foo-label-3").label).toEqual(
          "foo-label:foo-label-2:foo-label-3"
        );
      });

      it("should log with nested namespace label", () => {
        const childNamespace = namespace.namespace("foo-label-4");
        childNamespace.info("Foo");
        expect(cleanLogs(console.log.getCall(0).args[0])).toEqual(
          formattedLog("foo-label:foo-label-2:foo-label-4", "info", "Foo")
        );
      });
    });

    describe("instance", () => {
      it("should return same instance if label already exists", () => {
        namespace.namespace("foo-label-2");
        namespace.namespace("foo-label-2");
        namespace.namespace("foo-label-2");
        expect(logger._namespaces.length).toEqual(1);
      });
    });
  });

  describe("when root logger has no label", () => {
    beforeEach(() => {
      logger = new Logger();
      namespace = logger.namespace("foo-label-2");
    });

    describe("root logger label", () => {
      it("should be empty", () => {
        expect(logger.label).toEqual("");
      });

      it("should log label", () => {
        logger.info("Hello world");
        expect(cleanLogs(console.log.getCall(0).args[0])).toEqual(
          formattedLog("", "info", "Hello world")
        );
      });
    });

    describe("namespace label", () => {
      it("should have label without root label", () => {
        expect(namespace.label).toEqual("foo-label-2");
      });

      it("should log without parent label", () => {
        namespace.info("Hello world");
        expect(cleanLogs(console.log.getCall(0).args[0])).toEqual(
          formattedLog("foo-label-2", "info", "Hello world")
        );
      });
    });
  });

  describe("global store", () => {
    let firstNamespace;
    let secondNamespace;

    beforeEach(() => {
      logger = new Logger(LABEL);
      firstNamespace = logger.namespace("foo-label-2");
      secondNamespace = firstNamespace.namespace("foo-label-3");
    });

    it("should store logs from all namespaces", () => {
      logger.info("Hello from root");
      firstNamespace.warn("Hello from first");
      secondNamespace.error("Hello from second");
      expect(logger.globalStore).toEqual(firstNamespace.globalStore);
      expect(firstNamespace.globalStore).toEqual(secondNamespace.globalStore);

      expect(cleanLogs(logger.store)).toEqual([formattedLog(LABEL, "info", "Hello from root")]);

      expect(cleanLogs(firstNamespace.store)).toEqual([
        formattedLog("foo-label:foo-label-2", "warn", "Hello from first"),
      ]);

      expect(cleanLogs(secondNamespace.store)).toEqual([
        formattedLog("foo-label:foo-label-2:foo-label-3", "error", "Hello from second"),
      ]);

      expect(cleanLogs(logger.globalStore)).toEqual([
        formattedLog(LABEL, "info", "Hello from root"),
        formattedLog("foo-label:foo-label-2", "warn", "Hello from first"),
        formattedLog("foo-label:foo-label-2:foo-label-3", "error", "Hello from second"),
      ]);
    });

    it("should store logs from all namespaces when a child namespace change store level", () => {
      logger.info("Hello from root");
      firstNamespace.warn("Hello from first");
      secondNamespace.error("Hello from second");

      expect(cleanLogs(logger.globalStore)).toEqual([
        formattedLog(LABEL, "info", "Hello from root"),
        formattedLog("foo-label:foo-label-2", "warn", "Hello from first"),
        formattedLog("foo-label:foo-label-2:foo-label-3", "error", "Hello from second"),
      ]);

      firstNamespace.setLevel("silent", { transport: "store" });
      logger.info("Hello 2 from root");
      firstNamespace.warn("Hello 2 from first");
      expect(cleanLogs(logger.globalStore)).toEqual([
        formattedLog(LABEL, "info", "Hello from root"),
        formattedLog("foo-label:foo-label-2", "warn", "Hello from first"),
        formattedLog("foo-label:foo-label-2:foo-label-3", "error", "Hello from second"),
        formattedLog(LABEL, "info", "Hello 2 from root"),
        formattedLog("foo-label:foo-label-2", "warn", "Hello 2 from first"),
      ]);
      expect(cleanLogs(firstNamespace.store)).toEqual([
        formattedLog("foo-label:foo-label-2", "warn", "Hello from first"),
      ]);
    });
  });

  describe("when base namespace level is changed", () => {
    beforeEach(() => {
      logger = new Logger(LABEL);
      namespace = logger.namespace("foo-label-2");
    });

    describe("namespace level", () => {
      it("should also change", () => {
        logger.setLevel("warn");
        namespace.info("foo");
        expect(console.log.callCount).toEqual(0);
        expect(namespace.level).toEqual("warn");
      });

      it("should not change if propagate option is false", () => {
        namespace.setLevel("warn");
        logger.setLevel("silly", { propagate: false });
        namespace.info("foo");
        expect(namespace.level).toEqual("warn");
        expect(console.log.callCount).toEqual(0);
      });

      it("should not change if namespace level is pinned", () => {
        namespace.setLevel("warn", { pinned: true });
        logger.setLevel("silly");
        namespace.info("foo");
        expect(namespace.level).toEqual("warn");
        expect(console.log.callCount).toEqual(0);
      });

      it("should change if namespace level is pinned but forcePropagation option is true", () => {
        namespace.setLevel("warn", { pinned: true });
        logger.setLevel("silly", { forcePropagation: true });
        namespace.info("foo");
        expect(namespace.level).toEqual("silly");
        expect(console.log.callCount).toEqual(1);
      });

      it("should change but not log if namespace console level is pinned", () => {
        namespace.setLevel("warn", { transport: "console", pinned: true });
        logger.setLevel("silly");
        namespace.info("foo");
        expect(namespace.level).toEqual("silly");
        expect(console.log.callCount).toEqual(0);
      });

      it("should change and log if namespace console level is pinned but forcePropagation option is true", () => {
        namespace.setLevel("warn", { transport: "console", pinned: true });
        logger.setLevel("silly", { forcePropagation: true });
        namespace.info("foo");
        expect(namespace.level).toEqual("silly");
        expect(console.log.callCount).toEqual(1);
      });
    });
  });

  describe("when base namespace level is changed and there are two namespace levels", () => {
    let firstNamespace;
    let secondNamespace;

    beforeEach(() => {
      logger = new Logger(LABEL);
      firstNamespace = logger.namespace("foo-label-2");
      secondNamespace = firstNamespace.namespace("foo-label-3");
    });

    describe("namespaces levels", () => {
      it("should also change", () => {
        logger.setLevel("warn");
        firstNamespace.info("foo");
        secondNamespace.info("foo");
        expect(console.log.callCount).toEqual(0);
        expect(firstNamespace.level).toEqual("warn");
        expect(secondNamespace.level).toEqual("warn");
      });

      it("should not change if propagate option is false", () => {
        firstNamespace.setLevel("warn");
        secondNamespace.setLevel("error");
        logger.setLevel("silly", { propagate: false });
        firstNamespace.info("foo");
        secondNamespace.info("foo");
        expect(firstNamespace.level).toEqual("warn");
        expect(secondNamespace.level).toEqual("error");
        expect(console.log.callCount).toEqual(0);
      });

      it("should not change if namespace level is pinned", () => {
        secondNamespace.setLevel("warn", { pinned: true });
        logger.setLevel("silly");
        firstNamespace.info("foo");
        secondNamespace.info("foo");
        expect(secondNamespace.level).toEqual("warn");
        expect(console.log.callCount).toEqual(1);
      });

      it("should not change child level if parent namespace level is pinned", () => {
        firstNamespace.setLevel("warn", { pinned: true });
        logger.setLevel("silly");
        firstNamespace.info("foo");
        secondNamespace.info("foo");
        expect(firstNamespace.level).toEqual("warn");
        expect(secondNamespace.level).toEqual("warn");
        expect(console.log.callCount).toEqual(0);
      });

      it("should change but not log if namespace console level is pinned", () => {
        secondNamespace.setLevel("warn", { transport: "console", pinned: true });
        logger.setLevel("silly");
        secondNamespace.info("foo");
        expect(secondNamespace.level).toEqual("silly");
        expect(console.log.callCount).toEqual(0);
      });
    });
  });
});
