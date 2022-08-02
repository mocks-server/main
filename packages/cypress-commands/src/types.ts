/// <reference types="cypress" />

import type { AdminApiClient } from "./AdminApiClient";
import type { CollectionId, DelayTime, MocksServerConfig, RouteVariantId, ApiClientConfig } from "@mocks-server/admin-api-client";

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
      mocksSetCollection(
        collectionId: CollectionId,
        adminApiClient?: AdminApiClient,
      ): Promise<void>

      /**
       * Change routes global delay
       * @param delayTime - Delay time in milliseconds
       * @param adminApiClient - custom admin api client to use instead of the default one
       * @example cy.mocksSetDelay(1000)
       */
      mocksSetDelay(
        delayTime: DelayTime,
        adminApiClient?: AdminApiClient,
      ): Promise<void>

      /**
       * Change configuration
       * @param mocksServerConfig - Mocks Server configuration
       * @param adminApiClient - custom admin api client to use instead of the default one
       * @example cy.mocksSetConfig({ mock: { routes: { delay: 1000 }} })
       */
      mocksSetConfig(
        mocksServerConfig: MocksServerConfig,
        adminApiClient?: AdminApiClient,
      ): Promise<void>

      /**
       * Define a route variant to be used instead of the one defined in the current collection.
       * @param routeVariantId - Route variant id to be used
       * @param adminApiClient - custom admin api client to use instead of the default one
       * @example cy.mocksUseRouteVariant("variant-id")
       */
      mocksUseRouteVariant(
        routeVariantId: RouteVariantId,
        adminApiClient?: AdminApiClient,
      ): Promise<void>

      /**
       * Restore current collection route variants. It removes all variants defined with the mocksUseRouteVariant command.
       * @param adminApiClient - custom admin api client to use instead of the default one
       * @example cy.mocksRestoreRouteVariants()
       */
      mocksRestoreRouteVariants(adminApiClient?: AdminApiClient): Promise<void>

      /**
      * Alias of cy.mocksConfigClient. This alias will be deprecated in next major versions. Use cy.mocksConfigClient instead
      * @param apiClientConfig - Admin API client configuration
      * @param adminApiClient - custom admin api client to use instead of the default one
      * @example cy.mocksConfigAdminApiClient({ port: 3210 })
      */
      mocksConfigAdminApiClient(
        apiClientConfig: MocksServerCypressApiClientConfig,
        adminApiClient?: AdminApiClient,
      ): Promise<void>

      /**
      * Changes the configuration of the Mocks Server administration API client, used by the plugin commands to communicate with Mocks Server
      * @param apiClientConfig - Admin API client configuration
      * @param adminApiClient - custom admin api client to use instead of the default one
      * @example cy.mocksConfigAdminApiClient({ port: 3210 })
      */
      mocksConfigClient(
        apiClientConfig: MocksServerCypressApiClientConfig,
        adminApiClient?: AdminApiClient,
      ): Promise<void>
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CypressEnvVarValue = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ArrayOfValues = (string | number | boolean)[];

export interface MocksServerCypressApiClientConfig extends ApiClientConfig {
  enabled?: boolean;
}
