import { createSandbox } from "sinon";
import Logger from "../src/Logger.ts";

import { formattedLog, cleanLogs } from "./support";

const LABEL = "foo-label";

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
};

describe("Logger", () => {
  let sandbox;
  let logger;

  beforeEach(() => {
    sandbox = createSandbox();
    sandbox.stub(console, "log");
    logger = new Logger(LABEL);
  });

  afterEach(() => {
    sandbox.restore();
  });

  function shouldLog(level) {
    it(`should log ${level} with created namespace`, () => {
      logger[level]("Hello world");
      expect(cleanLogs(console.log.getCall(0).args[0])).toEqual(
        formattedLog(LABEL, level, "Hello world")
      );
    });
  }

  function shouldNotLog(level) {
    it(`should not log ${level} with created namespace`, () => {
      logger[level]("foo");
      expect(console.log.callCount).toEqual(0);
    });
  }

  function shouldStoreLog(level) {
    it(`should add ${level} log to store`, () => {
      logger[level]("Hello");
      expect(cleanLogs(logger.logs)).toEqual([formattedLog(LABEL, level, "Hello")]);
    });
  }

  function shouldNotStoreLog(level) {
    it(`should not add ${level} log to store`, () => {
      logger[level]("foo");
      expect(logger.logs.length).toEqual(0);
    });
  }

  describe("when created", () => {
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
        expect(cleanLogs(logger.logs)).toEqual([
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
      logger.set("warn");
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
      logger.set("warn", "console");
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

  describe("when store level is set to warn", () => {
    beforeEach(() => {
      logger = new Logger(LABEL);
      logger.set("warn", "store");
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
      logger.set("silent");
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
