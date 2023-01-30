import { AdminApiClient as BaseAdminApiClient } from "@mocks-server/admin-api-client";
import type {
  AdminApiClientInterface as OriginalAdminApiClientInterface,
  Protocol,
  EntityId,
  BaseUrl,
} from "@mocks-server/admin-api-client";
import {
  HTTPS_PROTOCOL,
  DEFAULT_PROTOCOL,
  DEFAULT_PORT,
  DEFAULT_CLIENT_HOST,
} from "@mocks-server/admin-api-paths";
import type { ConfigurationObject } from "@mocks-server/config";

import type {
  AdminApiClientConfig,
  AdminApiClientInterface,
  AdminApiClientConstructor,
} from "./AdminApiClientTypes";

import { isUndefined, isFalsy } from "./helpers";

function doNothing(): Promise<void> {
  return Promise.resolve();
}

export const AdminApiClient: AdminApiClientConstructor = class AdminApiClient
  implements AdminApiClientInterface
{
  private _enabled: AdminApiClientConfig["enabled"] = true;
  private _apiClient: OriginalAdminApiClientInterface;
  private _port: AdminApiClientConfig["port"] = DEFAULT_PORT;
  private _host: AdminApiClientConfig["host"] = DEFAULT_CLIENT_HOST;
  private _protocol: Protocol = DEFAULT_PROTOCOL;

  constructor(clientConfig: AdminApiClientConfig) {
    this._apiClient = new BaseAdminApiClient();
    this.configClient(clientConfig);
  }

  private _isDisabled(): boolean {
    return isFalsy(this._enabled);
  }

  public updateConfig(mocksServerConfig: ConfigurationObject): Promise<void> {
    if (this._isDisabled()) {
      return doNothing();
    }
    return this._apiClient.updateConfig(mocksServerConfig);
  }

  public useRouteVariant(id: EntityId): Promise<void> {
    if (this._isDisabled()) {
      return doNothing();
    }
    return this._apiClient.useRouteVariant(id);
  }

  public restoreRouteVariants(): Promise<void> {
    if (this._isDisabled()) {
      return doNothing();
    }
    return this._apiClient.restoreRouteVariants();
  }

  public configClient(customConfig: AdminApiClientConfig = {}): void {
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

  public get baseUrl(): BaseUrl {
    return `${this._protocol}://${this._host}:${this._port}`;
  }
};
