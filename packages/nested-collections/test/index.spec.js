import Collection from "../src/Collection.ts";
const index = require("../src/index.ts");

describe("index", () => {
  it("should export Collection class", () => {
    expect(index).toBe(Collection);
  });
});
