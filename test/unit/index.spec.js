const index = require("../../index");

describe("index", () => {
  it("should export a Cli constructor", () => {
    expect(index.Cli).toBeDefined();
  });

  it("should export a Server constructor", () => {
    expect(typeof index.Server).toEqual("function");
  });

  it("should export a Feature constructor", () => {
    expect(typeof index.Feature).toEqual("function");
  });
});
