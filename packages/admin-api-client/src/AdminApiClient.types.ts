import type { ConfigurationObject } from "@mocks-server/config";

import type { ApiResponseBody, ApiClientConfig } from "./AdminApiClientEntities.types";
import type { EntityId } from "./Common.types";

/** Admin API client constructor */
export interface AdminApiClientConstructor {
  /**
   * Creates Admin API client
   * @returns Admin API client interface {@link AdminApiClientInterface}.
   * @example const adminApiClient = new AdminApiClient();
   */
  new (): AdminApiClientInterface;
}

/** Admin API entities client */
export interface AdminApiClientInterface {
  /**
   * Returns about data
   * @returns Promise. Resolved with about data {@link ApiResponseBody}
   * @example const about = await adminApiClient.readAbout();
   */
  readAbout(): Promise<ApiResponseBody>;
  /**
   * Returns config data
   * @returns Promise. Resolved with config data {@link ConfigurationObject}
   * @example const config = await adminApiClient.readConfig();
   */
  readConfig(): Promise<ConfigurationObject>;
  /**
   * Updates config data
   * @param newConfig - Partial Mocks Server configuration object to be updated {@link ConfigurationObject}
   * @returns Promise. Resolved with undefined when data is valid
   * @example await adminApiClient.updateConfig({ mock: { delay: 1000 }});
   */
  updateConfig(newConfig: ConfigurationObject): Promise<void>;
  /**
   * Returns alerts data
   * @returns Promise. Resolved with alerts data {@link ApiResponseBody}
   * @example const alerts = await adminApiClient.readAlerts();
   */
  readAlerts(): Promise<ApiResponseBody>;
  /**
   * Returns data from one alert
   * @param id - Alert id
   * @returns Promise. Resolved with alert data {@link ApiResponseBody}
   * @example const alert = await adminApiClient.readAlert("files:error");
   */
  readAlert(id: EntityId): Promise<ApiResponseBody>;
  /**
   * Returns collections data
   * @returns Promise. Resolved with collections data {@link ApiResponseBody}
   * @example const collections = await adminApiClient.readCollections();
   */
  readCollections(): Promise<ApiResponseBody>;
  /**
   * Returns data from one collection
   * @param id - Collection id
   * @returns Promise. Resolved with collection data {@link ApiResponseBody}
   * @example const collection = await adminApiClient.readCollection("base");
   */
  readCollection(id: EntityId): Promise<ApiResponseBody>;
  /**
   * Returns routes data
   * @returns Promise. Resolved with routes data {@link ApiResponseBody}
   * @example const routes = await adminApiClient.readRoutes();
   */
  readRoutes(): Promise<ApiResponseBody>;
  /**
   * Returns data from one route
   * @param id - Route id
   * @returns Promise. Resolved with route data {@link ApiResponseBody}
   * @example const route = await adminApiClient.readRoute("get-books");
   */
  readRoute(id: EntityId): Promise<ApiResponseBody>;
  /**
   * Returns variants data
   * @returns Promise. Resolved with variants data {@link ApiResponseBody}
   * @example const variants = await adminApiClient.readVariants();
   */
  readVariants(): Promise<ApiResponseBody>;
  /**
   * Returns data from one variant
   * @param id - Variant id
   * @returns Promise. Resolved with variant data {@link ApiResponseBody}
   * @example const variant = await adminApiClient.readVariant("get-books:success");
   */
  readVariant(id: EntityId): Promise<ApiResponseBody>;
  /**
   * Returns custom route variants data
   * @returns Promise. Resolved with custom route variants data {@link ApiResponseBody}
   * @example const variants = await adminApiClient.readVariants();
   */
  readCustomRouteVariants(): Promise<ApiResponseBody>;
  /**
   * Sets a custom route variant to be used by current collection
   * @param id - Route variant id
   * @returns Promise. Resolved with undefined
   * @example await adminApiClient.useRouteVariant("get-books:success");
   */
  useRouteVariant(id: EntityId): Promise<void>;
  /**
   * Restore route variants to those defined in current collection
   * @returns Promise. Resolved with undefined
   * @example await adminApiClient.restoreRouteVariants();
   */
  restoreRouteVariants(): Promise<void>;
  /**
   * Configurates the API client host, port, protocol and agent
   * @param configuration - API client configuration {@link ApiClientConfig}
   * @example adminApiClient.config({ host: "192.168.1.1", port: 3200, https: true, agent: new https.Agent({ rejectUnauthorized: false })});
   */
  configClient(configuration: ApiClientConfig): void;
}
