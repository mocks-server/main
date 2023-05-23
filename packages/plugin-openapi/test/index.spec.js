import index from "../src/index";

import { Plugin } from "../src/Plugin";

describe("index file", () => {
  it("should export plugin as default", () => {
    expect(index).toBe(Plugin);
  });
});
