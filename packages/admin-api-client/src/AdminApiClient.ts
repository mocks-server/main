import type { ConfigurationObject } from "@mocks-server/config";

import type { AdminApiClientInterface, AdminApiClientConstructor } from "./AdminApiClient.types";
import { AdminApiClientEntities } from "./AdminApiClientEntities";
import type {
  ApiClientConfig,
  ApiResponseBody,
  AdminApiClientEntitiesInterface,
} from "./AdminApiClientEntities.types";
import type { EntityId } from "./Common.types";

export const AdminApiClient: AdminApiClientConstructor = class AdminApiClient
  implements AdminApiClientInterface
{
  private _adminApiClient: AdminApiClientEntitiesInterface;

  constructor() {
    this._adminApiClient = new AdminApiClientEntities();
  }

  public readAbout(): Promise<ApiResponseBody> {
    return this._adminApiClient.about.read();
  }

  public readConfig(): Promise<ConfigurationObject> {
    return this._adminApiClient.config.read() as Promise<ConfigurationObject>;
  }

  public updateConfig(newConfig: ConfigurationObject): Promise<void> {
    return this._adminApiClient.config.update(newConfig) as Promise<void>;
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

  public useRouteVariant(id: EntityId): Promise<void> {
    return this._adminApiClient.customRouteVariants.create({
      id,
    }) as Promise<void>;
  }

  public restoreRouteVariants(): Promise<void> {
    return this._adminApiClient.customRouteVariants.delete() as Promise<void>;
  }

  public configClient(config: ApiClientConfig): void {
    return this._adminApiClient.configClient(config);
  }
};
