import { createSandbox } from "sinon";
import Logger from "../src/Logger.ts";

describe("Logger", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("constructor", () => {
    it("should not throw", () => {
      const logger = new Logger();
      expect(logger instanceof Logger).toEqual(true);
    });
  });
});
