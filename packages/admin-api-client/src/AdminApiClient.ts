import type { ConfigurationObject } from "@mocks-server/config";

import { AdminApiClientEntities } from "./AdminApiClientEntities";

import type { ApiClientConfig, ApiResponseBody } from "./types/AdminApiClientEntities";
import type { AdminApiClientInterface } from "./types/AdminApiClient";
import type { EntityId } from "./types/Common";

export class AdminApiClient implements AdminApiClientInterface {
  private _adminApiClient: AdminApiClientEntities;

  constructor() {
    this._adminApiClient = new AdminApiClientEntities();
  }

  public readAbout(): Promise<ApiResponseBody> {
    return this._adminApiClient.about.read();
  }

  public readConfig(): Promise<ConfigurationObject> {
    return this._adminApiClient.config.read() as Promise<ConfigurationObject>;
  }

  public updateConfig(newConfig: ConfigurationObject): Promise<undefined> {
    return this._adminApiClient.config.update(newConfig) as Promise<undefined>;
  }

  public readAlerts(): Promise<ApiResponseBody> {
    return this._adminApiClient.alerts.read();
  }

  public readAlert(id: EntityId): Promise<ApiResponseBody> {
    return this._adminApiClient.alert(id).read();
  }

  public readCollections(): Promise<ApiResponseBody> {
    return this._adminApiClient.collections.read();
  }

  public readCollection(id: EntityId): Promise<ApiResponseBody> {
    return this._adminApiClient.collection(id).read();
  }

  public readRoutes(): Promise<ApiResponseBody> {
    return this._adminApiClient.routes.read();
  }

  public readRoute(id: EntityId): Promise<ApiResponseBody> {
    return this._adminApiClient.route(id).read();
  }

  public readVariants(): Promise<ApiResponseBody> {
    return this._adminApiClient.variants.read();
  }

  public readVariant(id: EntityId): Promise<ApiResponseBody> {
    return this._adminApiClient.variant(id).read();
  }

  public readCustomRouteVariants(): Promise<ApiResponseBody> {
    return this._adminApiClient.customRouteVariants.read();
  }

  public useRouteVariant(id: EntityId): Promise<undefined> {
    return this._adminApiClient.customRouteVariants.create({
      id,
    }) as Promise<undefined>;
  }

  public restoreRouteVariants(): Promise<undefined> {
    return this._adminApiClient.customRouteVariants.delete() as Promise<undefined>;
  }

  public configClient(config: ApiClientConfig): void {
    return this._adminApiClient.configClient(config);
  }
}
