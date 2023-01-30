import type { EntityId } from "@mocks-server/admin-api-client";
import type { ConfigurationObject } from "@mocks-server/config";
import type Bluebird from "cypress/types/bluebird";

import type { AdminApiClientConfig, AdminApiClientInterface } from "./AdminApiClientTypes";
import type { CypressCommandsMethods, Log } from "./CommandsTypes";

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

/**
 * Creates methods to be used by Cypress commands
 * @param Cyp - Global Cypress  {@link Cypress}
 * @param CypCy - Global cy  {@link CypCy}
 * @returns Commands methods {@link CypressCommandsMethods}
 * @example const methods = commands(Cypress, cy);
 */
export function commands(Cyp: typeof Cypress, CypCy: typeof cy): CypressCommandsMethods {
  const logIsEnabled = !isFalsy(Cyp.env(LOG_ENVIRONMENT_VAR));

  const defaultApiClient = new AdminApiClient({
    enabled: Cyp.env(ENABLED_ENVIRONMENT_VAR),
    port: Cyp.env(ADMIN_API_PORT_ENVIRONMENT_VAR),
    host: Cyp.env(ADMIN_API_HOST_ENVIRONMENT_VAR),
    https: isTruthy(Cyp.env(ADMIN_API_HTTPS_ENVIRONMENT_VAR)),
  });

  function getClient(apiClient?: AdminApiClientInterface): AdminApiClientInterface {
    return apiClient || defaultApiClient;
  }

  function handlePromise(promise: Promise<void>): Bluebird<void | Error> {
    return new Cyp.Promise((resolve) => {
      promise
        .then(() => {
          resolve();
        })
        .catch((error) => {
          resolve(error);
        });
    });
  }

  function log(message: Log, rest: Log[]): void {
    if (logIsEnabled) {
      CypCy.log(message, ...rest);
    }
  }

  function ensureLogsArray(logs?: Log | Log[]): Log[] {
    if (!logs) {
      return [];
    }
    return Array.isArray(logs) ? logs : [logs];
  }

  function logMessages(messages: Log | Log[], extraMessages?: Log | Log[]): void {
    const messagesArray = ensureLogsArray(messages);
    log(`[Mocks Server] ${messagesArray[0]}`, [
      ...messagesArray.slice(1),
      ...ensureLogsArray(extraMessages),
    ]);
  }

  function doRequestAndLog(
    client: AdminApiClientInterface,
    clientCommand: Promise<void>,
    successMessages: Log | Log[],
    errorMessages: Log | Log[]
  ): void {
    CypCy.wrap(handlePromise(clientCommand), { log: false }).then((error?: unknown) => {
      if (error) {
        const receivedError = error as Error;
        logMessages(errorMessages, `Error: ${receivedError.message}`);
        if (receivedError.message.includes("Network")) {
          logMessages(`You should check if the Admin API is listening on ${client.baseUrl}`);
        }
      } else {
        logMessages(successMessages);
      }
    });
  }

  function setCollection(id: EntityId, apiClient?: AdminApiClientInterface): void {
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

  function setDelay(delay: number, apiClient?: AdminApiClientInterface): void {
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

  function setConfig(
    mocksServerConfig: ConfigurationObject,
    apiClient?: AdminApiClientInterface
  ): void {
    const client = getClient(apiClient);
    const configMessage = JSON.stringify(mocksServerConfig);
    doRequestAndLog(
      client,
      client.updateConfig(mocksServerConfig),
      [`Configuration changed`, configMessage],
      [`Error trying to change configuration`, configMessage]
    );
  }

  function useRouteVariant(id: EntityId, apiClient?: AdminApiClientInterface): void {
    const client = getClient(apiClient);
    doRequestAndLog(
      client,
      client.useRouteVariant(id),
      `Collection now is using custom route variant '${id}'`,
      `Error trying to set route variant '${id}'`
    );
  }

  function restoreRouteVariants(apiClient?: AdminApiClientInterface): void {
    const client = getClient(apiClient);
    doRequestAndLog(
      client,
      client.restoreRouteVariants(),
      `Collection route variants restored`,
      `Error trying to restore collection route variants`
    );
  }

  function configClient(
    customConfig: AdminApiClientConfig,
    apiClient?: AdminApiClientInterface
  ): void {
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
