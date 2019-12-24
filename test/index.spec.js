const index = require("../index");

describe("Exported methods", () => {
  it("should include config", () => {
    expect(index.config).toBeDefined();
  });
});
