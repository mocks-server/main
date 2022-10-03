import type { ConfigurationObject } from "@mocks-server/config";
import type { ApiClient } from "@mocks-server/admin-api-client";

import type { AdminApiClientConfig, AdminApiClientInterface } from "./AdminApiClient";

/* Cypress log */
export type Log = string;

/** Admin API client Cypress commands methods */
export interface CypressCommandsMethods {
  /**
  * Set current collection
  * @param id - Collection id {@link ApiClient.EntityId}
  * @param apiClient - Custom API client to be used instead of the default one. Useful to control several Mocks Servers instances {@link AdminApiClientInterface}
  * @example setCollection("base");
  */
  setCollection(id: ApiClient.EntityId, apiClient?: AdminApiClientInterface): void
  /**
  * Set Mocks Server routes global delay
  * @param delay - Mocks Server routes global delay
  * @param apiClient - Custom API client to be used instead of the default one. Useful to control several Mocks Servers instances {@link AdminApiClientInterface}
  * @example setDelay(1000);
  */
  setDelay(delay: number, apiClient?: AdminApiClientInterface): void
  /**
  * Set Mocks Server configuration
  * @param mocksServerConfig - Partial Mocks Server configuration object to be updated {@link ConfigurationObject}
  * @param apiClient - Custom API client to be used instead of the default one. Useful to control several Mocks Servers instances {@link AdminApiClientInterface}
  * @example setConfig({ mock: { delay: 1000 }});
  */
  setConfig(mocksServerConfig: ConfigurationObject, apiClient?: AdminApiClientInterface): void
  /**
  * Set a specific route variant to be used by the current collection.
  * @param id - Route variant id {@link ApiClient.EntityId}
  * @param apiClient - Custom API client to be used instead of the default one. Useful to control several Mocks Servers instances {@link AdminApiClientInterface}
  * @example useRouteVariant("get-users:success");
  */
  useRouteVariant(id: ApiClient.EntityId, apiClient?: AdminApiClientInterface): void
  /**
  * Restore route variants to those defined in the current collection.
  * @param apiClient - Custom API client to be used instead of the default one. Useful to control several Mocks Servers instances {@link AdminApiClientInterface}
  * @example restoreRouteVariants();
  */
  restoreRouteVariants(apiClient?: AdminApiClientInterface): void
  /**
  * Configurates the API client host, port, protocol and agent
  * @param configuration - API client configuration {@link AdminApiClientConfig}
  * @param apiClient - Custom API client to be used instead of the default one. Useful to control several Mocks Servers instances {@link AdminApiClientInterface}
  * @example configClient({ host: "192.168.1.1", enabled: true, port: 3200, https: true, agent: new https.Agent({ rejectUnauthorized: false })});
  */
  configClient(configuration: AdminApiClientConfig, apiClient?: AdminApiClientInterface): void
}
