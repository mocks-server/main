import Config from "../../src/Config";
import index from "../../src/index";

describe("index", () => {
  it("should export Config", () => {
    expect(index).toBe(Config);
  });
});
