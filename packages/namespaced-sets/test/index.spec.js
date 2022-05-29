import Namespace from "../src/Namespace.ts";
import index from "../src/index.ts";

describe("index", () => {
  it("should export Namespace", () => {
    expect(index).toBe(Namespace);
  });
});
