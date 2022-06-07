import Collection from "../src/Collection.ts";
import { NestedCollections } from "../src/index.ts";

describe("index", () => {
  it("should export Collection class", () => {
    expect(NestedCollections).toBe(Collection);
  });
});
