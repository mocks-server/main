import sinon from "sinon";

function doNothing() {
  // do nothing
}

const apiClient = {
  updateConfig: doNothing,
  useRouteVariant: doNothing,
  restoreRouteVariants: doNothing,
  configClient: doNothing,
};

jest.mock("@mocks-server/admin-api-client", () => {
  return apiClient;
});

import CypressMock from "./Cypress.mock";

import { commands } from "../src/commands";

describe("commands", () => {
  let sandbox;
  let cypressMock;
  let setCollection, setDelay, setConfig, useRouteVariant, restoreRouteVariants, configClient;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(apiClient, "updateConfig");
    sandbox.stub(apiClient, "useRouteVariant");
    sandbox.stub(apiClient, "restoreRouteVariants");
    sandbox.stub(apiClient, "configClient");
    cypressMock = new CypressMock();
    ({ setCollection, setDelay, setConfig, useRouteVariant, restoreRouteVariants, configClient } =
      commands(cypressMock.stubs));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when initializing", () => {
    it("should call to set port config if env var is defined", () => {
      cypressMock.stubs.env.withArgs("MOCKS_SERVER_ADMIN_API_PORT").returns("foo");
      commands(cypressMock.stubs);
      expect(
        apiClient.configClient.calledWith({
          port: "foo",
        })
      ).toBe(true);
    });

    it("should call to set baseUrl config if env var is defined", () => {
      cypressMock.stubs.env.withArgs("MOCKS_SERVER_ADMIN_API_HOST").returns("foo");
      commands(cypressMock.stubs);
      expect(
        apiClient.configClient.calledWith({
          host: "foo",
        })
      ).toBe(true);
    });
  });

  describe("setCollection command", () => {
    it("should call to set current collection", () => {
      setCollection("foo");
      expect(
        apiClient.updateConfig.calledWith({
          mock: {
            collections: {
              selected: "foo",
            },
          },
        })
      ).toBe(true);
    });

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns("false");
      setCollection("foo");
      expect(apiClient.updateConfig.callCount).toEqual(0);
    });
  });

  describe("setDelay command", () => {
    it("should call to update delay", () => {
      setDelay(3000);
      expect(
        apiClient.updateConfig.calledWith({
          mock: {
            routes: {
              delay: 3000,
            },
          },
        })
      ).toBe(true);
    });

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns("false");
      setDelay("foo");
      expect(apiClient.updateConfig.callCount).toEqual(0);
    });
  });

  describe("setConfig command", () => {
    it("should call to update config", () => {
      setConfig("foo");
      expect(apiClient.updateConfig.calledWith("foo")).toBe(true);
    });

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns("0");
      setConfig("foo");
      expect(apiClient.updateConfig.callCount).toEqual(0);
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

  describe("restoreRouteVariants command", () => {
    it("should call to useRoute variant", () => {
      restoreRouteVariants();
      expect(apiClient.restoreRouteVariants.callCount).toEqual(1);
    });

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns(false);
      restoreRouteVariants();
      expect(apiClient.restoreRouteVariants.callCount).toEqual(0);
    });
  });

  describe("configClient method", () => {
    it("should call to config admin-api-client host", () => {
      configClient({
        host: "foo",
      });
      expect(
        apiClient.configClient.calledWith({
          host: "foo",
        })
      ).toBe(true);
    });

    it("should call to config admin-api-client apiPath port and host", () => {
      configClient({
        host: "foo",
        port: "foo-2",
      });
      expect(
        apiClient.configClient.calledWith({
          host: "foo",
          port: "foo-2",
        })
      ).toBe(true);
    });
  });
});
