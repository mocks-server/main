import type {
  MocksServerConfig,
  CollectionId,
  DelayTime,
  RouteVariantId
} from "@mocks-server/admin-api-client";

import type { MocksServerCypressApiClientConfig } from "./types";

import { MocksServerApiClient } from "./MocksServerApiClient";

import {
  ENABLED_ENVIRONMENT_VAR,
  ADMIN_API_PORT_ENVIRONMENT_VAR,
  ADMIN_API_HOST_ENVIRONMENT_VAR,
} from "./helpers";

export function commands(Cyp: typeof Cypress) {
  const defaultApiClient = new MocksServerApiClient({
    enabled: Cyp.env(ENABLED_ENVIRONMENT_VAR),
    port: Cyp.env(ADMIN_API_PORT_ENVIRONMENT_VAR),
    host: Cyp.env(ADMIN_API_HOST_ENVIRONMENT_VAR),
  });

  function getClient(apiClient?: MocksServerApiClient) {
    return apiClient || defaultApiClient;
  }

  function setCollection(id: CollectionId, apiClient?: MocksServerApiClient) {
    return getClient(apiClient).updateConfig({
      mock: {
        collections: { selected: id },
      },
    });
  }

  function setDelay (delay: DelayTime, apiClient?: MocksServerApiClient) {
    return getClient(apiClient).updateConfig({
      mock: {
        routes: { delay },
      },
    });
  }

  function setConfig (mocksServerConfig: MocksServerConfig, apiClient?: MocksServerApiClient) {
    return getClient(apiClient).updateConfig(mocksServerConfig);
  }

  function useRouteVariant (id: RouteVariantId, apiClient?: MocksServerApiClient) {
    return getClient(apiClient).useRouteVariant(id);
  }

  function restoreRouteVariants(apiClient?: MocksServerApiClient) {
    return getClient(apiClient).restoreRouteVariants();
  }

  function configClient (customConfig: MocksServerCypressApiClientConfig, apiClient?: MocksServerApiClient) {
    return getClient(apiClient).configClient(customConfig);
  }

  return {
    setCollection,
    setDelay,
    setConfig,
    useRouteVariant,
    restoreRouteVariants,
    configClient,
  };
}
