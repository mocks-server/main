import { AdminApiClient as BaseAdminApiClient } from "@mocks-server/admin-api-client";

import type {
  MocksServerConfig,
  RouteVariantId
} from "@mocks-server/admin-api-client";

import type { MocksServerCypressApiClientConfig } from "./types";
import { isUndefined, isFalsy } from "./helpers";

function doNothing() {
  return Promise.resolve();
}

export class AdminApiClient {
  private _enabled: MocksServerCypressApiClientConfig["enabled"] = true;
  private _apiClient: BaseAdminApiClient;

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
    this._apiClient.configClient({
      host: customConfig.host,
      port: customConfig.port,
    });
  }
}
