import type {
  MocksServerConfig,
  CollectionId,
  DelayTime,
  RouteVariantId
} from "@mocks-server/admin-api-client";

import type { MocksServerCypressApiClientConfig, Log, RequestLogs, RequestError } from "./types";

import { AdminApiClient } from "./AdminApiClient";

import {
  ENABLED_ENVIRONMENT_VAR,
  ADMIN_API_PORT_ENVIRONMENT_VAR,
  ADMIN_API_HOST_ENVIRONMENT_VAR,
  ADMIN_API_HTTPS_ENVIRONMENT_VAR,
  LOG_ENVIRONMENT_VAR,
  isFalsy,
  isTruthy,
} from "./helpers";

import type Bluebird from "cypress/types/bluebird";

export function commands(Cyp: typeof Cypress, CypCy: typeof cy) {
  const logIsEnabled = !isFalsy(Cyp.env(LOG_ENVIRONMENT_VAR))

  const defaultApiClient = new AdminApiClient({
    enabled: Cyp.env(ENABLED_ENVIRONMENT_VAR),
    port: Cyp.env(ADMIN_API_PORT_ENVIRONMENT_VAR),
    host: Cyp.env(ADMIN_API_HOST_ENVIRONMENT_VAR),
    https: isTruthy(Cyp.env(ADMIN_API_HTTPS_ENVIRONMENT_VAR)),
  });

  function getClient(apiClient?: AdminApiClient) {
    return apiClient || defaultApiClient;
  }

  function handlePromise(promise: Promise<void>):Bluebird<void | Error> {
    return new Cyp.Promise((resolve) => {
      promise.then(() => {
        resolve();
      }).catch((error) => {
        resolve(error);
      });
    });
  }

  function log( message:Log, rest: Log[]) {
    if (logIsEnabled) {
      CypCy.log(message, ...rest);
    }
  }

  function ensureLogsArray(logs?: RequestLogs): Log[] {
    if (!logs) {
      return [];
    }
    return Array.isArray(logs) ? logs : [logs];
  }

  function logMessages(messages: RequestLogs, extraMessages?: RequestLogs) {
    const messagesArray = ensureLogsArray(messages);
    log(`[Mocks Server] ${messagesArray[0]}`, [...messagesArray.slice(1), ...ensureLogsArray(extraMessages)]);
  }

  function doRequestAndLog(client: AdminApiClient, clientCommand: Promise<void>, successMessages: RequestLogs, errorMessages: RequestLogs) {
    CypCy.wrap(handlePromise(clientCommand), { log: false }).then((error?: RequestError) => {
      if (error) {
        logMessages(errorMessages, `Error: ${error.message}`);
        if (error.message.includes("Network")) {
          logMessages(`You should check if the Admin API is listening on ${client.url}`)
        }
      } else {
        logMessages(successMessages);
      }
    })
  }

  function setCollection(id: CollectionId, apiClient?: AdminApiClient) {
    const client = getClient(apiClient);
    doRequestAndLog(
      client,
      client.updateConfig({
        mock: {
          collections: { selected: id },
        },
      }),
      `Collection changed to '${id}'`,
      `Error trying to change collection to '${id}'`
    );
  }

  function setDelay (delay: DelayTime, apiClient?: AdminApiClient) {
    const client = getClient(apiClient);
    doRequestAndLog(
      client,
      client.updateConfig({
        mock: {
          routes: { delay },
        },
      }),
      `Delay changed to '${delay}'`,
      `Error trying to change delay to '${delay}'`
    );
  }

  function setConfig (mocksServerConfig: MocksServerConfig, apiClient?: AdminApiClient) {
    const client = getClient(apiClient);
    const configMessage = JSON.stringify(mocksServerConfig);
    doRequestAndLog(
      client,
      client.updateConfig(mocksServerConfig),
      [`Configuration changed`, configMessage],
      [`Error trying to change configuration`, configMessage]
    );
  }

  function useRouteVariant (id: RouteVariantId, apiClient?: AdminApiClient) {
    const client = getClient(apiClient);
    doRequestAndLog(
      client,
      client.useRouteVariant(id),
      `Collection now is using custom route variant '${id}'`,
      `Error trying to set route variant '${id}'`
    )
  }

  function restoreRouteVariants(apiClient?: AdminApiClient) {
    const client = getClient(apiClient);
    doRequestAndLog(
      client,
      client.restoreRouteVariants(),
      `Collection route variants restored`,
      `Error trying to restore collection route variants`
    )
  }

  function configClient (customConfig: MocksServerCypressApiClientConfig, apiClient?: AdminApiClient) {
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
