import {
  updateConfig as apiClientUpdateConfig,
  useRouteVariant as apiClientUseRouteVariant,
  restoreRouteVariants as apiClientRestoreRouteVariants, 
  configClient as apiClientConfigClient
} from "@mocks-server/admin-api-client";

import type {
  MocksServerConfig,
  ApiClientConfig,
  CollectionId,
  DelayTime,
  RouteVariantId
} from "@mocks-server/admin-api-client";

import {
  isFalsy,
  ENABLED_ENVIRONMENT_VAR,
  ADMIN_API_PORT_ENVIRONMENT_VAR,
  ADMIN_API_HOST_ENVIRONMENT_VAR,
} from "./helpers";

export function commands(Cyp: typeof Cypress) {
  function isDisabled() {
    return isFalsy(Cyp.env(ENABLED_ENVIRONMENT_VAR));
  }

  function doNothing() {
    return Promise.resolve();
  }

  function setCollection(id: CollectionId) {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClientUpdateConfig({
      mock: {
        collections: { selected: id },
      },
    });
  }

  function setDelay (delay: DelayTime) {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClientUpdateConfig({
      mock: {
        routes: { delay },
      },
    });
  }

  function setConfig (mocksServerConfig: MocksServerConfig) {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClientUpdateConfig(mocksServerConfig);
  }

  function useRouteVariant (id: RouteVariantId) {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClientUseRouteVariant(id);
  }

  function restoreRouteVariants() {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClientRestoreRouteVariants();
  }

  function configClient (customConfig: ApiClientConfig) {
    return apiClientConfigClient(customConfig);
  }

  if (Cyp.env(ADMIN_API_PORT_ENVIRONMENT_VAR)) {
    configClient({ port: Cyp.env(ADMIN_API_PORT_ENVIRONMENT_VAR) });
  }
  if (Cyp.env(ADMIN_API_HOST_ENVIRONMENT_VAR)) {
    configClient({ host: Cyp.env(ADMIN_API_HOST_ENVIRONMENT_VAR) });
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
