const helpers = require("../../../lib/common/helpers");

describe("helpers", () => {
  describe("stringToBoolean method", () => {
    it("should return true if value is 'true'", async () => {
      expect(helpers.stringToBoolean("true")).toEqual(true);
    });

    it("should return false if value is 'false'", async () => {
      expect(helpers.stringToBoolean("false")).toEqual(false);
    });

    it("should throw an error if values does not match any of previous", async () => {
      expect.assertions(1);
      try {
        helpers.stringToBoolean("foo");
      } catch (err) {
        expect(err.message).toEqual("Invalid boolean value");
      }
    });
  });
});
