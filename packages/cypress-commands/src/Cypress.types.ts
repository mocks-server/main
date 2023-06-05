/// <reference types="cypress" />

import type { EntityId } from "@mocks-server/admin-api-client";
import type { Configuration } from "@mocks-server/core";

import type { AdminApiClientInterface, AdminApiClientConfig } from "./AdminApiClient.types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Change routes collection
       * @param collectionId - Collection id to be used
       * @param adminApiClient - custom admin api client to use instead of the default one
       * @example cy.mocksSetCollection("collection-id")
       */
      mocksSetCollection(collectionId: EntityId, adminApiClient?: AdminApiClientInterface): void;

      /**
       * Change routes global delay
       * @param delayTime - Delay time in milliseconds
       * @param adminApiClient - custom admin api client to use instead of the default one
       * @example cy.mocksSetDelay(1000)
       */
      mocksSetDelay(delayTime: number, adminApiClient?: AdminApiClientInterface): Promise<void>;

      /**
       * Change configuration
       * @param mocksServerConfig - Mocks Server configuration
       * @param adminApiClient - custom admin api client to use instead of the default one
       * @example cy.mocksSetConfig({ mock: { routes: { delay: 1000 }} })
       */
      mocksSetConfig(
        mocksServerConfig: Configuration,
        adminApiClient?: AdminApiClientInterface
      ): Promise<void>;

      /**
       * Define a route variant to be used instead of the one defined in the current collection.
       * @param routeVariantId - Route variant id to be used
       * @param adminApiClient - custom admin api client to use instead of the default one
       * @example cy.mocksUseRouteVariant("variant-id")
       */
      mocksUseRouteVariant(
        routeVariantId: EntityId,
        adminApiClient?: AdminApiClientInterface
      ): Promise<void>;

      /**
       * Restore current collection route variants. It removes all variants defined with the mocksUseRouteVariant command.
       * @param adminApiClient - custom admin api client to use instead of the default one
       * @example cy.mocksRestoreRouteVariants()
       */
      mocksRestoreRouteVariants(adminApiClient?: AdminApiClientInterface): Promise<void>;

      /**
       * Changes the configuration of the Mocks Server administration API client, used by the plugin commands to communicate with Mocks Server
       * @param apiClientConfig - Admin API client configuration
       * @param adminApiClient - custom admin api client to use instead of the default one
       * @example cy.mocksConfigClient({ port: 3210 })
       */
      mocksConfigClient(
        apiClientConfig: AdminApiClientConfig,
        adminApiClient?: AdminApiClientInterface
      ): Promise<void>;
    }
  }
}
