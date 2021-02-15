const sinon = require("sinon");
const apiClient = require("@mocks-server/admin-api-client");

const {
  setMock,
  setBehavior,
  setDelay,
  setSettings,
  useRouteVariant,
  restoreRoutesVariants,
  config,
} = require("../src/commands");

describe("commands", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(apiClient, "updateSettings");
    sandbox.stub(apiClient, "addMockCustomRouteVariant"); // useRouteVariant
    sandbox.stub(apiClient, "restoreMockRoutesVariants"); // restoreRoutesVariants
    sandbox.stub(apiClient, "config");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("setMock command", () => {
    it("should call to update delay", () => {
      setMock("foo");
      expect(
        apiClient.updateSettings.calledWith({
          mock: "foo",
        })
      ).toBe(true);
    });
  });

  describe("setDelay command", () => {
    it("should call to update delay", () => {
      setDelay(3000);
      expect(
        apiClient.updateSettings.calledWith({
          delay: 3000,
        })
      ).toBe(true);
    });
  });

  describe("setSettings command", () => {
    it("should call to update delay", () => {
      setSettings("foo");
      expect(apiClient.updateSettings.calledWith("foo")).toBe(true);
    });
  });

  describe("useRouteVariant command", () => {
    it("should call to useRoute variant", () => {
      useRouteVariant("foo");
      expect(apiClient.addMockCustomRouteVariant.calledWith("foo")).toBe(true);
    });
  });

  describe("restoreRoutesVariants command", () => {
    it("should call to useRoute variant", () => {
      restoreRoutesVariants();
      expect(apiClient.restoreMockRoutesVariants.callCount).toEqual(1);
    });
  });

  describe("setBehavior command", () => {
    it("should call to update behavior", () => {
      setBehavior("foo-behavior");
      expect(
        apiClient.updateSettings.calledWith({
          behavior: "foo-behavior",
        })
      ).toBe(true);
    });
  });

  describe("config method", () => {
    it("should call to config admin-api-client baseUrl", () => {
      config({
        baseUrl: "foo",
      });
      expect(
        apiClient.config.calledWith({
          baseUrl: "foo",
        })
      ).toBe(true);
    });

    it("should call to config admin-api-client apiPath with adminApiPath value", () => {
      config({
        adminApiPath: "foo",
      });
      expect(
        apiClient.config.calledWith({
          apiPath: "foo",
        })
      ).toBe(true);
    });
  });
});
