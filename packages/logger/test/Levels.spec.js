import { createSandbox } from "sinon";
import Logger from "../src/Logger.ts";

import { formattedLog, cleanLogs } from "./support";

const LABEL = "foo-label";

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
};

describe("Levels", () => {
  let sandbox;
  let logger;

  beforeEach(() => {
    sandbox = createSandbox();
    sandbox.stub(console, "log");
  });

  afterEach(() => {
    sandbox.restore();
  });

  function shouldLog(level) {
    it(`should log ${level} with created namespace`, () => {
      console.log.reset();
      logger[level]("Hello world");
      expect(cleanLogs(console.log.getCall(0).args[0])).toEqual(
        formattedLog(LABEL, level, "Hello world")
      );
    });
  }

  function shouldNotLog(level) {
    it(`should not log ${level} with created namespace`, () => {
      console.log.reset();
      logger[level]("foo");
      expect(console.log.callCount).toEqual(0);
    });
  }

  function shouldStoreLog(level, message = "Hello") {
    it(`should add ${level} log to store`, () => {
      logger.cleanStore();
      logger[level](message);
      expect(cleanLogs(logger.store)).toEqual([formattedLog(LABEL, level, message)]);
    });
  }

  function shouldNotStoreLog(level, message = "Hello") {
    it(`should not add ${level} log to store`, () => {
      logger.cleanStore();
      logger[level](message);
      expect(logger.store.length).toEqual(0);
    });
  }

  describe("when created", () => {
    beforeEach(() => {
      logger = new Logger(LABEL);
    });

    describe("silly method", () => {
      shouldNotLog("silly");
      shouldNotStoreLog("silly");
    });

    describe("debug method", () => {
      shouldNotLog("debug");
      shouldNotStoreLog("debug");
    });

    describe("verbose method", () => {
      shouldNotLog("verbose");
      shouldNotStoreLog("verbose");
    });

    describe("info method", () => {
      shouldLog("info");
      shouldStoreLog("info");

      it("log should include time", () => {
        logger.info("Hello world");
        expect(console.log.getCall(0).args[0]).toMatch(/\d\d:\d\d:\d\d:\d\d\s.*/);
      });

      it("should store all logs", () => {
        logger.info("Hello");
        logger.info("Hi");
        logger.info("message 3");
        expect(cleanLogs(logger.store)).toEqual([
          formattedLog(LABEL, "info", "Hello"),
          formattedLog(LABEL, "info", "Hi"),
          formattedLog(LABEL, "info", "message 3"),
        ]);
      });
    });

    describe("warn method", () => {
      shouldLog("warn");
      shouldStoreLog("warn");
    });

    describe("error method", () => {
      shouldLog("error");
      shouldStoreLog("error");
    });
  });

  describe("when created with silly level", () => {
    beforeEach(() => {
      logger = new Logger(LABEL, { level: "silly" });
    });

    describe("silly method", () => {
      shouldLog("silly");
      shouldStoreLog("silly");
    });

    describe("debug method", () => {
      shouldLog("debug");
      shouldStoreLog("debug");
    });

    describe("verbose method", () => {
      shouldLog("verbose");
      shouldStoreLog("verbose");
    });
  });

  describe("when created with debug level", () => {
    beforeEach(() => {
      logger = new Logger(LABEL, { level: "debug" });
    });

    describe("silly method", () => {
      shouldNotLog("silly");
      shouldNotStoreLog("silly");
    });

    describe("debug method", () => {
      shouldLog("debug");
      shouldStoreLog("debug");
    });

    describe("verbose method", () => {
      shouldLog("verbose");
      shouldStoreLog("verbose");
    });
  });

  describe("when created with verbose level", () => {
    beforeEach(() => {
      logger = new Logger(LABEL, { level: "verbose" });
    });

    describe("silly method", () => {
      shouldNotLog("silly");
      shouldNotStoreLog("silly");
    });

    describe("debug method", () => {
      shouldNotLog("debug");
      shouldNotStoreLog("debug");
    });

    describe("verbose method", () => {
      shouldLog("verbose");
      shouldStoreLog("verbose");
    });
  });

  describe("when level is set to warn", () => {
    beforeEach(() => {
      logger = new Logger(LABEL);
      logger.setLevel("warn");
    });

    describe("info method", () => {
      shouldNotLog("info");
      shouldNotStoreLog("info");
    });

    describe("warn method", () => {
      shouldLog("warn");
      shouldStoreLog("warn");
    });
  });

  describe("when console level is set to warn", () => {
    beforeEach(() => {
      logger = new Logger(LABEL);
      logger.setLevel("warn", { transport: "console" });
    });

    describe("info method", () => {
      shouldNotLog("info");
      shouldStoreLog("info");
    });

    describe("warn method", () => {
      shouldLog("warn");
      shouldStoreLog("warn");
    });
  });

  describe("when console level is set to warn and pinned", () => {
    beforeAll(() => {
      logger = new Logger(LABEL);
      logger.setLevel("warn", { transport: "console", pinned: true });
    });

    describe("info method", () => {
      shouldNotLog("info");
      shouldStoreLog("info");
    });

    describe("info method after changing base level to error", () => {
      beforeAll(() => {
        logger.setLevel("error");
      });

      shouldNotLog("info");
      shouldNotStoreLog("info");

      it("should have level as error", () => {
        expect(logger.level).toEqual("error");
      });
    });

    describe("info method after changing base level to silly", () => {
      beforeAll(() => {
        logger.setLevel("silly");
      });

      shouldNotLog("info");
      shouldStoreLog("info");

      it("should have level as silly", () => {
        expect(logger.level).toEqual("silly");
      });
    });

    describe("info method after changing console level to silly without being pinned", () => {
      beforeAll(() => {
        logger.setLevel("silly", { transport: "console" });
      });

      shouldLog("info");
      shouldStoreLog("info");

      it("should have level as silly", () => {
        expect(logger.level).toEqual("silly");
      });
    });

    describe("info method after changing base level to warn", () => {
      beforeAll(() => {
        logger.setLevel("warn");
      });

      shouldNotLog("info");
      shouldNotStoreLog("info");
      shouldLog("warn");
      shouldStoreLog("warn");

      it("should have level as warn", () => {
        expect(logger.level).toEqual("warn");
      });
    });
  });

  describe("when transport level is pinned but base level is set using forcePropagation", () => {
    beforeAll(() => {
      logger = new Logger(LABEL);
      logger.setLevel("warn", { transport: "console", pinned: true });
    });

    describe("info method when changing base level without forcePropagation", () => {
      beforeAll(() => {
        logger.setLevel("info");
      });

      shouldNotLog("info");
      shouldStoreLog("info");
    });

    describe("info method after changing base level with forcePropagation", () => {
      beforeAll(() => {
        logger.setLevel("info", { forcePropagation: true });
      });

      shouldLog("info");
      shouldStoreLog("info");
    });
  });

  describe("when store level is set to warn", () => {
    beforeEach(() => {
      logger = new Logger(LABEL);
      logger.setLevel("warn", { transport: "store" });
    });

    describe("info method", () => {
      shouldLog("info");
      shouldNotStoreLog("info");
    });

    describe("warn method", () => {
      shouldLog("warn");
      shouldStoreLog("warn");
    });
  });

  describe("when level is set to silent", () => {
    beforeEach(() => {
      logger = new Logger(LABEL);
      logger.setLevel("silent");
    });

    describe("silly method", () => {
      shouldNotLog("silly");
      shouldNotStoreLog("silly");
    });

    describe("debug method", () => {
      shouldNotLog("debug");
      shouldNotStoreLog("debug");
    });

    describe("verbose method", () => {
      shouldNotLog("verbose");
      shouldNotStoreLog("verbose");
    });

    describe("info method", () => {
      shouldNotLog("info");
      shouldNotStoreLog("info");
    });

    describe("warn method", () => {
      shouldNotLog("warn");
      shouldNotStoreLog("warn");
    });

    describe("error method", () => {
      shouldNotLog("error");
      shouldNotStoreLog("error");
    });
  });
});
