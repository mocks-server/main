const index = require("../index");

describe("Exported methods", () => {
  it("should include setBaseUrl", () => {
    expect(index.setBaseUrl).toBeDefined();
  });
});
