import { AdminApiClient as BaseAdminApiClient } from "@mocks-server/admin-api-client";
import { HTTPS_PROTOCOL, DEFAULT_PROTOCOL, DEFAULT_PORT, DEFAULT_CLIENT_HOST } from "@mocks-server/admin-api-paths";

import type {
  MocksServerConfig,
  RouteVariantId,
  Protocol,
} from "@mocks-server/admin-api-client";

import type { MocksServerCypressApiClientConfig } from "./types";
import { isUndefined, isFalsy } from "./helpers";

function doNothing() {
  return Promise.resolve();
}

export class AdminApiClient {
  private _enabled: MocksServerCypressApiClientConfig["enabled"] = true;
  private _apiClient: BaseAdminApiClient;
  private _port: MocksServerCypressApiClientConfig["port"] = DEFAULT_PORT;
  private _host: MocksServerCypressApiClientConfig["host"] = DEFAULT_CLIENT_HOST;
  private _protocol: Protocol = DEFAULT_PROTOCOL;

  constructor(clientConfig: MocksServerCypressApiClientConfig) {
    this._apiClient = new BaseAdminApiClient();
    this.configClient(clientConfig);
  }

  private _isDisabled() {
    return isFalsy(this._enabled);
  }

  public updateConfig(mocksServerConfig: MocksServerConfig) {
    if (this._isDisabled()) {
      return doNothing();
    }
    return this._apiClient.updateConfig(mocksServerConfig);
  }

  public useRouteVariant(id: RouteVariantId) {
    if (this._isDisabled()) {
      return doNothing();
    }
    return this._apiClient.useRouteVariant(id);
  }

  public restoreRouteVariants() {
    if (this._isDisabled()) {
      return doNothing();
    }
    return this._apiClient.restoreRouteVariants();
  }

  public configClient(customConfig: MocksServerCypressApiClientConfig = {}) {
    if (!isUndefined(customConfig.enabled)) {
      this._enabled = customConfig.enabled;
    }
    if (!isUndefined(customConfig.host)) {
      this._host = customConfig.host;
    }
    if (!isUndefined(customConfig.port)) {
      this._port = customConfig.port;
    }
    if (!isUndefined(customConfig.https)) {
      this._protocol = customConfig.https ? HTTPS_PROTOCOL : DEFAULT_PROTOCOL;
    }
    this._apiClient.configClient({
      host: customConfig.host,
      port: customConfig.port,
      https: customConfig.https,
      agent: customConfig.agent,
    });
  }

  public get url() {
    return `${this._protocol}://${this._host}:${this._port}`;
  }
}
