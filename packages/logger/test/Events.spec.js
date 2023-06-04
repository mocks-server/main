import { createSandbox } from "sinon";
import { Logger } from "../src/Logger.ts";

const LABEL = "foo-label";

function wait(time = 200) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
};

describe("Events", () => {
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

  describe("onChangeStore method", () => {
    beforeEach(() => {
      logger = new Logger(LABEL);
      namespace = logger.namespace("foo-label-1");
    });

    it("should emit an event when a log is added to the store", (done) => {
      logger.onChangeStore(() => {
        expect(logger.store.length).toEqual(1);

        done();
      });
      logger.info("Hello from root");
    });

    it("should emit an event when a log is added to the store and it has reached limit", (done) => {
      logger = new Logger(LABEL, { storeLimit: 2 });
      logger.info("Hello from root 1");
      logger.info("Hello from root 2");
      logger.info("Hello from root 3");
      logger.info("Hello from root 4");
      logger.onChangeStore(() => {
        expect(logger.store.length).toEqual(2);

        done();
      });
      logger.info("Hello from root 5");
    });

    it("should emit an event when store is cleaned", (done) => {
      logger.info("Hello from root");

      expect(logger.store.length).toEqual(1);

      logger.onChangeStore(() => {
        expect(logger.store.length).toEqual(0);

        done();
      });
      logger.cleanStore();
    });

    it("should emit an event when a log is added to the store of a namespace", (done) => {
      namespace.onChangeStore(() => {
        expect(namespace.store.length).toEqual(1);

        done();
      });
      namespace.info("Hello from namespace");
    });

    it("should not execute callback if returned function is executed", async () => {
      const spy = sandbox.spy();
      const removeListener = logger.onChangeStore(spy);
      removeListener();
      logger.info("Hello from root");
      await wait(200);

      expect(spy.callCount).toEqual(0);
      expect(logger.store.length).toEqual(1);
    });

    it("children namespaces should not emit an event when a log is added to the parent namespace", async () => {
      const spy = sandbox.spy();
      namespace.onChangeStore(spy);
      logger.info("Hello from root");
      await wait(200);

      expect(spy.callCount).toEqual(0);
      expect(logger.store.length).toEqual(1);
      expect(namespace.store.length).toEqual(0);
    });
  });

  describe("onChangeGlobalStore method", () => {
    beforeEach(() => {
      logger = new Logger(LABEL);
      namespace = logger.namespace("foo-label-1");
    });

    it("should emit an event when a log is added to the global store", (done) => {
      logger.onChangeGlobalStore(() => {
        expect(logger.globalStore.length).toEqual(1);

        done();
      });
      logger.info("Hello from root");
    });

    it("should emit an event when a log is added to the global store and it has reached limit", (done) => {
      logger = new Logger(LABEL, { globalStoreLimit: 2 });
      logger.info("Hello from root 1");
      logger.info("Hello from root 2");
      logger.info("Hello from root 3");
      logger.info("Hello from root 4");
      logger.onChangeGlobalStore(() => {
        expect(logger.globalStore.length).toEqual(2);

        done();
      });
      logger.info("Hello from root 5");
    });

    it("should emit an event when a log is added to the global store through a namespace", (done) => {
      logger.info("Hello from root");
      logger.onChangeGlobalStore(() => {
        expect(namespace.globalStore.length).toEqual(2);

        done();
      });
      namespace.info("Hello from namespace");
    });

    it("should not execute callback if returned function is executed", async () => {
      const spy = sandbox.spy();
      const removeListener = logger.onChangeGlobalStore(spy);
      removeListener();
      logger.info("Hello from root");
      await wait(200);

      expect(spy.callCount).toEqual(0);
      expect(logger.globalStore.length).toEqual(1);
    });

    it("children namespaces should emit an event when a log is added to the parent namespace", async () => {
      const spy = sandbox.spy();
      namespace.onChangeGlobalStore(spy);
      logger.info("Hello from root");
      await wait(200);

      expect(spy.callCount).toEqual(0);
      expect(logger.globalStore.length).toEqual(1);
      expect(namespace.globalStore.length).toEqual(1);
    });
  });
});
