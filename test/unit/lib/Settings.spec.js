const Settings = require("../../../lib/Settings");

describe("Settings", () => {
  describe("when instantiated", () => {
    describe("options", () => {
      it("should set the delay value", () => {
        const settings = new Settings({
          delay: 3000
        });
        expect(settings.delay).toEqual(3000);
      });
    });

    describe("delay setter", () => {
      it("should set the daly value", () => {
        const settings = new Settings({
          delay: 3000
        });
        settings.delay = 2000;
        expect(settings.delay).toEqual(2000);
      });
    });
  });
});
