import Config from "../../src/Config";
import index from "../../src/index.ts";

describe("index", () => {
  it("should export Config", () => {
    expect(index).toBe(Config);
  });
});
