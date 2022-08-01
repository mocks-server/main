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

class FakeAdminApiClient {
  updateConfig(config) {
    apiClient.updateConfig(config);
  }

  useRouteVariant(id) {
    apiClient.useRouteVariant(id);
  }

  restoreRouteVariants() {
    apiClient.restoreRouteVariants();
  }

  configClient(config) {
    apiClient.configClient(config);
  }
}

apiClient.AdminApiClient = FakeAdminApiClient;

jest.mock("@mocks-server/admin-api-client", () => {
  return apiClient;
});

import CypressMock from "./Cypress.mock";

import { commands } from "../src/commands";

describe("commands", () => {
  let sandbox;
  let cypressMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(apiClient, "updateConfig");
    sandbox.stub(apiClient, "useRouteVariant");
    sandbox.stub(apiClient, "restoreRouteVariants");
    sandbox.stub(apiClient, "configClient");
    cypressMock = new CypressMock();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when initializing", () => {
    it("should call to set client config", () => {
      cypressMock.stubs.env.withArgs("MOCKS_SERVER_ADMIN_API_PORT").returns("foo-port");
      cypressMock.stubs.env.withArgs("MOCKS_SERVER_ADMIN_API_HOST").returns("foo-host");
      commands(cypressMock.stubs);
      expect(
        apiClient.configClient.calledWith({
          port: "foo-port",
          host: "foo-host",
        })
      ).toBe(true);
    });
  });

  describe("setCollection command", () => {
    it("should call to set current collection", () => {
      const { setCollection } = commands(cypressMock.stubs);
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
      const { setCollection } = commands(cypressMock.stubs);
      setCollection("foo");
      expect(apiClient.updateConfig.callCount).toEqual(0);
    });
  });

  describe("setDelay command", () => {
    it("should call to update delay", () => {
      const { setDelay } = commands(cypressMock.stubs);
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
      const { setDelay } = commands(cypressMock.stubs);
      setDelay("foo");
      expect(apiClient.updateConfig.callCount).toEqual(0);
    });
  });

  describe("setConfig command", () => {
    it("should call to update config", () => {
      const { setConfig } = commands(cypressMock.stubs);
      setConfig("foo");
      expect(apiClient.updateConfig.calledWith("foo")).toBe(true);
    });

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns("0");
      const { setConfig } = commands(cypressMock.stubs);
      setConfig("foo");
      expect(apiClient.updateConfig.callCount).toEqual(0);
    });
  });

  describe("useRouteVariant command", () => {
    it("should call to useRoute variant", () => {
      const { useRouteVariant } = commands(cypressMock.stubs);
      useRouteVariant("foo");
      expect(apiClient.useRouteVariant.calledWith("foo")).toBe(true);
    });

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns(0);
      const { useRouteVariant } = commands(cypressMock.stubs);
      useRouteVariant("foo");
      expect(apiClient.useRouteVariant.callCount).toEqual(0);
    });
  });

  describe("restoreRouteVariants command", () => {
    it("should call to useRoute variant", () => {
      const { restoreRouteVariants } = commands(cypressMock.stubs);
      restoreRouteVariants();
      expect(apiClient.restoreRouteVariants.callCount).toEqual(1);
    });

    it("should do nothing if plugin is disabled", () => {
      cypressMock.stubs.env.returns(false);
      const { restoreRouteVariants } = commands(cypressMock.stubs);
      restoreRouteVariants();
      expect(apiClient.restoreRouteVariants.callCount).toEqual(0);
    });
  });

  describe("configClient method", () => {
    it("should call to config admin-api-client host", () => {
      const { configClient } = commands(cypressMock.stubs);
      configClient({
        host: "foo",
      });
      expect(
        apiClient.configClient.calledWith({
          host: "foo",
          port: undefined,
        })
      ).toBe(true);
    });

    it("should call to config admin-api-client apiPath port and host", () => {
      const { configClient } = commands(cypressMock.stubs);
      configClient({
        host: "foo-host",
        port: "foo-port",
      });

      expect(
        apiClient.configClient.calledWith({
          host: "foo-host",
          port: "foo-port",
        })
      ).toBe(true);
    });
  });
});
