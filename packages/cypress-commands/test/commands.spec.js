import sinon from "sinon";

function wait(time = 200) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

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
    return apiClient.updateConfig(config);
  }

  useRouteVariant(id) {
    return apiClient.useRouteVariant(id);
  }

  restoreRouteVariants() {
    return apiClient.restoreRouteVariants();
  }

  configClient(config) {
    return apiClient.configClient(config);
  }
}

apiClient.AdminApiClient = FakeAdminApiClient;

jest.mock("@mocks-server/admin-api-client", () => {
  return apiClient;
});

import CypressMock from "./Cypress.mock";

import { commands } from "../src/Commands";
import { AdminApiClient } from "../src/AdminApiClient";

const FOO_ERROR_MESSAGE = "foo error message";

describe("commands", () => {
  let sandbox;
  let cypressMock;
  let CypressStub;
  let cyStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(apiClient, "updateConfig").resolves();
    sandbox.stub(apiClient, "useRouteVariant").resolves();
    sandbox.stub(apiClient, "restoreRouteVariants").resolves();
    sandbox.stub(apiClient, "configClient");
    cypressMock = new CypressMock();
    CypressStub = cypressMock.stubs.Cypress;
    cyStub = cypressMock.stubs.cy;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when initializing", () => {
    it("should call to set client config", () => {
      CypressStub.env.withArgs("MOCKS_SERVER_ADMIN_API_PORT").returns("foo-port");
      CypressStub.env.withArgs("MOCKS_SERVER_ADMIN_API_HOST").returns("foo-host");
      CypressStub.env.withArgs("MOCKS_SERVER_ADMIN_API_HTTPS").returns("true");
      commands(CypressStub, cyStub);

      expect(
        apiClient.configClient.calledWith({
          port: "foo-port",
          host: "foo-host",
          https: true,
          agent: undefined,
        })
      ).toBe(true);
    });
  });

  describe("setCollection command", () => {
    it("should call to set current collection", () => {
      const { setCollection } = commands(CypressStub, cyStub);
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
      CypressStub.env.returns("false");
      const { setCollection } = commands(CypressStub, cyStub);
      setCollection("foo");

      expect(apiClient.updateConfig.callCount).toEqual(0);
    });

    it("should log error when happens", async () => {
      apiClient.updateConfig.rejects(new Error(FOO_ERROR_MESSAGE));
      const { setCollection } = commands(CypressStub, cyStub);
      setCollection("foo");
      await wait();

      expect(cyStub.log.getCall(0).args[1]).toEqual(expect.stringContaining(FOO_ERROR_MESSAGE));
    });

    it("should not log error when happens and logs are disabled", async () => {
      CypressStub.env.withArgs("MOCKS_SERVER_LOGS").returns("false");
      apiClient.updateConfig.rejects(new Error(FOO_ERROR_MESSAGE));
      const { setCollection } = commands(CypressStub, cyStub);
      setCollection("foo");
      await wait();

      expect(cyStub.log.callCount).toEqual(0);
    });

    it("should log server url when error message includes Network", async () => {
      apiClient.updateConfig.rejects(new Error("Network"));
      const { setCollection } = commands(CypressStub, cyStub);
      setCollection("foo");
      await wait();

      expect(cyStub.log.getCall(1).args[0]).toEqual(
        expect.stringContaining("http://127.0.0.1:3110")
      );
    });

    it("should log https protocol when https is enabled", async () => {
      apiClient.updateConfig.rejects(new Error("Network"));
      const { setCollection, configClient } = commands(CypressStub, cyStub);
      configClient({
        https: true,
      });
      setCollection("foo");
      await wait();

      expect(cyStub.log.getCall(1).args[0]).toEqual(
        expect.stringContaining("https://127.0.0.1:3110")
      );
    });

    it("should log server url when host and port changed", async () => {
      apiClient.updateConfig.rejects(new Error("Network"));
      const { setCollection, configClient } = commands(CypressStub, cyStub);
      configClient({
        host: "foo-host",
        port: 4000,
      });
      setCollection("foo");
      await wait();

      expect(cyStub.log.getCall(1).args[0]).toEqual(
        expect.stringContaining("http://foo-host:4000")
      );
    });
  });

  describe("setDelay command", () => {
    it("should call to update delay", () => {
      const { setDelay } = commands(CypressStub, cyStub);
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
      CypressStub.env.returns("false");
      const { setDelay } = commands(CypressStub, cyStub);
      setDelay("foo");

      expect(apiClient.updateConfig.callCount).toEqual(0);
    });

    it("should log error when happens", async () => {
      apiClient.updateConfig.rejects(new Error(FOO_ERROR_MESSAGE));
      const { setDelay } = commands(CypressStub, cyStub);
      setDelay("foo");
      await wait();

      expect(cyStub.log.getCall(0).args[1]).toEqual(expect.stringContaining(FOO_ERROR_MESSAGE));
    });
  });

  describe("setConfig command", () => {
    it("should call to update config", () => {
      const { setConfig } = commands(CypressStub, cyStub);
      setConfig("foo");

      expect(apiClient.updateConfig.calledWith("foo")).toBe(true);
    });

    it("should do nothing if plugin is disabled", () => {
      CypressStub.env.returns("0");
      const { setConfig } = commands(CypressStub, cyStub);
      setConfig("foo");

      expect(apiClient.updateConfig.callCount).toEqual(0);
    });

    it("should log data sent when happens", async () => {
      apiClient.updateConfig.rejects(new Error(FOO_ERROR_MESSAGE));
      const { setConfig } = commands(CypressStub, cyStub);
      setConfig("foo-config");
      await wait();

      expect(cyStub.log.getCall(0).args[1]).toEqual(expect.stringContaining("foo-config"));
    });

    it("should log error when happens", async () => {
      apiClient.updateConfig.rejects(new Error(FOO_ERROR_MESSAGE));
      const { setConfig } = commands(CypressStub, cyStub);
      setConfig("foo");
      await wait();

      expect(cyStub.log.getCall(0).args[2]).toEqual(expect.stringContaining(FOO_ERROR_MESSAGE));
    });
  });

  describe("useRouteVariant command", () => {
    it("should call to useRoute variant", () => {
      const { useRouteVariant } = commands(CypressStub, cyStub);
      useRouteVariant("foo");

      expect(apiClient.useRouteVariant.calledWith("foo")).toBe(true);
    });

    it("should do nothing if plugin is disabled", () => {
      CypressStub.env.returns(0);
      const { useRouteVariant } = commands(CypressStub, cyStub);
      useRouteVariant("foo");

      expect(apiClient.useRouteVariant.callCount).toEqual(0);
    });

    it("should log error when happens", async () => {
      apiClient.useRouteVariant.rejects(new Error(FOO_ERROR_MESSAGE));
      const { useRouteVariant } = commands(CypressStub, cyStub);
      useRouteVariant("foo");
      await wait();

      expect(cyStub.log.getCall(0).args[1]).toEqual(expect.stringContaining(FOO_ERROR_MESSAGE));
    });
  });

  describe("restoreRouteVariants command", () => {
    it("should call to useRoute variant", () => {
      const { restoreRouteVariants } = commands(CypressStub, cyStub);
      restoreRouteVariants();

      expect(apiClient.restoreRouteVariants.callCount).toEqual(1);
    });

    it("should do nothing if plugin is disabled", () => {
      CypressStub.env.returns(false);
      const { restoreRouteVariants } = commands(CypressStub, cyStub);
      restoreRouteVariants();

      expect(apiClient.restoreRouteVariants.callCount).toEqual(0);
    });

    it("should log error when happens", async () => {
      apiClient.restoreRouteVariants.rejects(new Error(FOO_ERROR_MESSAGE));
      const { restoreRouteVariants } = commands(CypressStub, cyStub);
      restoreRouteVariants();
      await wait();

      expect(cyStub.log.getCall(0).args[1]).toEqual(expect.stringContaining(FOO_ERROR_MESSAGE));
    });
  });

  describe("configClient method", () => {
    it("should call to config admin-api-client host", () => {
      const { configClient } = commands(CypressStub, cyStub);
      configClient({
        host: "foo",
      });

      expect(
        apiClient.configClient.calledWith({
          host: "foo",
          port: undefined,
          https: undefined,
          agent: undefined,
        })
      ).toBe(true);
    });

    it("should call to config admin-api-client apiPath port and host", () => {
      const { configClient } = commands(CypressStub, cyStub);
      configClient({
        host: "foo-host",
        port: "foo-port",
      });

      expect(
        apiClient.configClient.calledWith({
          host: "foo-host",
          port: "foo-port",
          https: undefined,
          agent: undefined,
        })
      ).toBe(true);
    });
  });

  describe("when custom clients are used", () => {
    describe("when setting client config", () => {
      it("should call to set client config of custom client", () => {
        const customApiClient = new AdminApiClient();
        sandbox.stub(customApiClient, "configClient").resolves();
        const { configClient } = commands(CypressStub, cyStub);
        sandbox.reset();

        configClient(
          {
            host: "foo-host",
          },
          customApiClient
        );

        expect(
          customApiClient.configClient.calledWith({
            host: "foo-host",
          })
        ).toBe(true);

        expect(apiClient.configClient.callCount).toEqual(0);
      });

      it("should call to set client config of default client", () => {
        const customApiClient = new AdminApiClient();
        sandbox.stub(customApiClient, "configClient").resolves();
        const { configClient } = commands(CypressStub, cyStub);
        sandbox.reset();

        configClient({
          host: "foo-host",
        });

        expect(
          apiClient.configClient.calledWith({
            host: "foo-host",
            port: undefined,
            https: undefined,
            agent: undefined,
          })
        ).toBe(true);

        expect(customApiClient.configClient.callCount).toEqual(0);
      });
    });

    describe("setCollection command", () => {
      it("should call to set current collection of custom client", () => {
        const customApiClient = new AdminApiClient();
        sandbox.stub(customApiClient, "updateConfig").resolves();
        const { setCollection } = commands(CypressStub, cyStub);
        setCollection("foo", customApiClient);

        expect(
          customApiClient.updateConfig.calledWith({
            mock: {
              collections: {
                selected: "foo",
              },
            },
          })
        ).toBe(true);
      });

      it("should log server url when host and port changed and request failed", async () => {
        apiClient.updateConfig.rejects(new Error("Network"));
        const customApiClient = new AdminApiClient();
        const { setCollection, configClient } = commands(CypressStub, cyStub);
        configClient(
          {
            host: "foo-host",
            port: 4000,
          },
          customApiClient
        );
        setCollection("foo", customApiClient);
        await wait();

        expect(cyStub.log.getCall(1).args[0]).toEqual(
          expect.stringContaining("http://foo-host:4000")
        );
      });
    });

    describe("setDelay command", () => {
      it("should call to update delay of custom client", () => {
        const customApiClient = new AdminApiClient();
        sandbox.stub(customApiClient, "updateConfig").resolves();
        const { setDelay } = commands(CypressStub, cyStub);
        setDelay(3000, customApiClient);

        expect(
          customApiClient.updateConfig.calledWith({
            mock: {
              routes: {
                delay: 3000,
              },
            },
          })
        ).toBe(true);
      });
    });

    describe("setConfig command", () => {
      it("should call to update config of custom client", () => {
        const customApiClient = new AdminApiClient();
        sandbox.stub(customApiClient, "updateConfig").resolves();
        const { setConfig } = commands(CypressStub, cyStub);
        setConfig("foo", customApiClient);

        expect(customApiClient.updateConfig.calledWith("foo")).toBe(true);
      });
    });

    describe("useRouteVariant command", () => {
      it("should call to useRoute variant of custom client", () => {
        const customApiClient = new AdminApiClient();
        sandbox.stub(customApiClient, "useRouteVariant").resolves();
        const { useRouteVariant } = commands(CypressStub, cyStub);
        useRouteVariant("foo", customApiClient);

        expect(customApiClient.useRouteVariant.calledWith("foo")).toBe(true);
      });
    });

    describe("restoreRouteVariants command", () => {
      it("should call to useRoute variant of custom client", () => {
        const customApiClient = new AdminApiClient();
        sandbox.stub(customApiClient, "restoreRouteVariants").resolves();
        const { restoreRouteVariants } = commands(CypressStub, cyStub);
        restoreRouteVariants(customApiClient);

        expect(customApiClient.restoreRouteVariants.callCount).toEqual(1);
      });
    });
  });
});
