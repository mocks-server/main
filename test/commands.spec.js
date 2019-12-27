const sinon = require("sinon");
const { settings } = require("@mocks-server/admin-api-client");

const { setBehavior, setDelay, setSettings } = require("../src/commands");

describe("register", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(settings, "update");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("commands", () => {
    describe("setBehavior command", () => {
      it("should call to update behavior", () => {
        setBehavior("foo-behavior");
        expect(
          settings.update.calledWith({
            behavior: "foo-behavior"
          })
        ).toBe(true);
      });
    });

    describe("setDelay command", () => {
      it("should call to update delay", () => {
        setDelay(3000);
        expect(
          settings.update.calledWith({
            delay: 3000
          })
        ).toBe(true);
      });
    });

    describe("setSettings command", () => {
      it("should call to update delay", () => {
        setSettings("foo");
        expect(settings.update.calledWith("foo")).toBe(true);
      });
    });
  });
});
