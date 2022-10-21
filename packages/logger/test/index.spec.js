import { Logger } from "../src/Logger.ts";
import { Logger as IndexLogger } from "../src/index.ts";

describe("index", () => {
  it("should export Logger class", () => {
    expect(IndexLogger).toBe(Logger);
  });
});
