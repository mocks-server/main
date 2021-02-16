const sinon = require("sinon");
const apiClient = require("@mocks-server/admin-api-client");

const CypressMock = require("./Cypress.mock");

const commands = require("../src/commands");

describe("commands", () => {
  let sandbox;
  let cypressMock;
  let setMock, setBehavior, setDelay, setSettings, useRouteVariant, restoreRoutesVariants, config;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(apiClient, "updateSettings");
    sandbox.stub(apiClient, "useRouteVariant");
    sandbox.stub(apiClient, "restoreRoutesVariants");
    sandbox.stub(apiClient, "config");
    cypressMock = new CypressMock();
    ({
      setMock,
      setBehavior,
      setDelay,
      setSettings,
      useRouteVariant,
      restoreRoutesVariants,
      config,
    } = commands(cypressMock.stubs));
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

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns("false");
      setMock("foo");
      expect(apiClient.updateSettings.callCount).toEqual(0);
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

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns("false");
      setDelay("foo");
      expect(apiClient.updateSettings.callCount).toEqual(0);
    });
  });

  describe("setSettings command", () => {
    it("should call to update delay", () => {
      setSettings("foo");
      expect(apiClient.updateSettings.calledWith("foo")).toBe(true);
    });

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns("0");
      setSettings("foo");
      expect(apiClient.updateSettings.callCount).toEqual(0);
    });
  });

  describe("useRouteVariant command", () => {
    it("should call to useRoute variant", () => {
      useRouteVariant("foo");
      expect(apiClient.useRouteVariant.calledWith("foo")).toBe(true);
    });

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns(0);
      useRouteVariant("foo");
      expect(apiClient.useRouteVariant.callCount).toEqual(0);
    });
  });

  describe("restoreRoutesVariants command", () => {
    it("should call to useRoute variant", () => {
      restoreRoutesVariants();
      expect(apiClient.restoreRoutesVariants.callCount).toEqual(1);
    });

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns(false);
      restoreRoutesVariants();
      expect(apiClient.restoreRoutesVariants.callCount).toEqual(0);
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

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns(false);
      setBehavior("foo-behavior");
      expect(apiClient.updateSettings.callCount).toEqual(0);
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
          adminApiPath: "foo",
        })
      ).toBe(true);
    });
  });
});
