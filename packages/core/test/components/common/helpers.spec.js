const { deprecatedMessage } = require("../../../src/common/helpers");

describe("common helpers", () => {
  describe("deprecatedMessage", () => {
    it("should retun message based on method name and include a link to web docs", () => {
      expect(deprecatedMessage("method", "foo", "fooNew", "foo-url")).toEqual(
        "Usage of 'foo' method is deprecated. Use 'fooNew' instead: https://www.mocks-server.org/docs/foo-url"
      );
    });
  });
});
