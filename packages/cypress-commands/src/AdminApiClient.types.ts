import type { ApiClientConfig, EntityId, BaseUrl } from "@mocks-server/admin-api-client";
import type { ConfigurationObject } from "@mocks-server/config";

export interface AdminApiClientConfig extends ApiClientConfig {
  enabled?: boolean;
}

/** Admin API client constructor */
export interface AdminApiClientConstructor {
  /**
   * Creates Admin API client
   * @returns Admin API client interface {@link AdminApiClientInterface}.
   * @param clientConfig - Configuration {@link AdminApiClientConfig}
   * @example const adminApiClient = new AdminApiClient();
   */
  new (clientConfig: AdminApiClientConfig): AdminApiClientInterface;
}

/** Admin API client */
export interface AdminApiClientInterface {
  /**
   * Updates Mocks Server configuration
   * @param mocksServerConfig - Partial Mocks Server configuration object to be updated {@link ConfigurationObject}
   * @returns Promise. Resolved with undefined when data is valid
   * @example await adminApiClient.updateConfig({ mock: { delay: 1000 }});
   */
  updateConfig(mocksServerConfig: ConfigurationObject): Promise<void>;
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
   * @param configuration - API client configuration {@link AdminApiClientConfig}
   * @example adminApiClient.configClient({ host: "192.168.1.1", enabled: true, port: 3200, https: true, agent: new https.Agent({ rejectUnauthorized: false })});
   */
  configClient(configuration: AdminApiClientConfig): void;
  /** Mocks Server admin API base url */
  baseUrl: BaseUrl;
}
