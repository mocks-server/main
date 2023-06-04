import { createSandbox } from "sinon";
import { Logger } from "../src/Logger.ts";
import { formattedLog, cleanLogs } from "./support";

const LABEL = "foo-label";
const INFO = "info";

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
};

describe("Store limits", () => {
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

  describe("when storeLimit is set", () => {
    beforeEach(() => {
      logger = new Logger(LABEL, { storeLimit: 3 });
    });

    it("should remove logs from the beggining when it reaches the limit", () => {
      logger.info("1");
      logger.info("2");
      logger.info("3");

      expect(cleanLogs(logger.store)).toEqual([
        formattedLog(LABEL, INFO, "1"),
        formattedLog(LABEL, INFO, "2"),
        formattedLog(LABEL, INFO, "3"),
      ]);

      logger.info("4");

      expect(cleanLogs(logger.store)).toEqual([
        formattedLog(LABEL, INFO, "2"),
        formattedLog(LABEL, INFO, "3"),
        formattedLog(LABEL, INFO, "4"),
      ]);
    });
  });

  describe("when globalStoreLimit is set", () => {
    beforeEach(() => {
      logger = new Logger(LABEL, { globalStoreLimit: 3 });
      namespace = logger.namespace("foo-label-2");
    });

    it("should remove logs from the beggining when it reaches the limit", () => {
      logger.info("1");
      logger.info("2");
      logger.info("3");

      expect(cleanLogs(logger.globalStore)).toEqual([
        formattedLog(LABEL, INFO, "1"),
        formattedLog(LABEL, INFO, "2"),
        formattedLog(LABEL, INFO, "3"),
      ]);

      logger.info("4");

      expect(cleanLogs(logger.globalStore)).toEqual([
        formattedLog(LABEL, INFO, "2"),
        formattedLog(LABEL, INFO, "3"),
        formattedLog(LABEL, INFO, "4"),
      ]);
    });

    it("should remove logs from the beggining also when log is created by a namespace", () => {
      const NAMESPACE_LABEL = "foo-label:foo-label-2";
      logger.info("1");
      namespace.info("2");
      logger.info("3");
      namespace.info("4");

      expect(cleanLogs(logger.globalStore)).toEqual([
        formattedLog(NAMESPACE_LABEL, INFO, "2"),
        formattedLog(LABEL, INFO, "3"),
        formattedLog(NAMESPACE_LABEL, INFO, "4"),
      ]);

      logger.info("5");
      namespace.info("6");

      expect(cleanLogs(logger.globalStore)).toEqual([
        formattedLog(NAMESPACE_LABEL, INFO, "4"),
        formattedLog(LABEL, INFO, "5"),
        formattedLog(NAMESPACE_LABEL, INFO, "6"),
      ]);
    });
  });
});
