import Logger from "../src/Logger.ts";
const index = require("../src/index.ts");

describe("index", () => {
  it("should export Logger class", () => {
    expect(index).toBe(Logger);
  });
});
