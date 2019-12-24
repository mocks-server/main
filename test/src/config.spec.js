const config = require("../../src/config");

describe("config methods", () => {
  describe("setBaseUrl", () => {
    it("should do nothing", () => {
      expect(config.setBaseUrl()).not.toBeDefined();
    });
  });
});
