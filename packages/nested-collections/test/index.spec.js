import Collection from "../src/Collection.ts";
import index from "../src/index.ts";

describe("index", () => {
  it("should export Collection", () => {
    expect(index).toBe(Collection);
  });
});
