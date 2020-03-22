const sinon = require("sinon");
const adminApiClient = require("@mocks-server/admin-api-client");

const { setBehavior, setDelay, setSettings, config } = require("../src/commands");

describe("commands", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(adminApiClient.settings, "update");
    sandbox.stub(adminApiClient, "config");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("setBehavior command", () => {
    it("should call to update behavior", () => {
      setBehavior("foo-behavior");
      expect(
        adminApiClient.settings.update.calledWith({
          behavior: "foo-behavior",
        })
      ).toBe(true);
    });
  });

  describe("setDelay command", () => {
    it("should call to update delay", () => {
      setDelay(3000);
      expect(
        adminApiClient.settings.update.calledWith({
          delay: 3000,
        })
      ).toBe(true);
    });
  });

  describe("setSettings command", () => {
    it("should call to update delay", () => {
      setSettings("foo");
      expect(adminApiClient.settings.update.calledWith("foo")).toBe(true);
    });
  });

  describe("config method", () => {
    it("should call to config admin-api-client baseUrl", () => {
      config({
        baseUrl: "foo",
      });
      expect(
        adminApiClient.config.calledWith({
          baseUrl: "foo",
        })
      ).toBe(true);
    });

    it("should call to config admin-api-client apiPath with adminApiPath value", () => {
      config({
        adminApiPath: "foo",
      });
      expect(
        adminApiClient.config.calledWith({
          apiPath: "foo",
        })
      ).toBe(true);
    });
  });
});
