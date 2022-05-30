import Collection from "../src/Collection.ts";
import index from "../src/index.ts";

describe("index", () => {
  it("should export Collection class", () => {
    expect(index).toBe(Collection);
  });
});
