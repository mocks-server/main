/// <reference types="cypress" />

import type { CollectionId, DelayTime, MocksServerConfig, RouteVariantId, ApiClientConfig } from "@mocks-server/admin-api-client";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Change routes collection
       * @param collectionId - Collection id to be used
       * @example cy.mocksSetCollection("collection-id")
       */
      mocksSetCollection(
        collectionId: CollectionId,
      ): Promise<void>

      /**
       * Change routes global delay
       * @param delayTime - Delay time in milliseconds
       * @example cy.mocksSetDelay(1000)
       */
      mocksSetDelay(
        delayTime: DelayTime,
      ): Promise<void>

      /**
       * Change configuration
       * @param mocksServerConfig - Mocks Server configuration
       * @example cy.mocksSetConfig({ mock: { routes: { delay: 1000 }} })
       */
      mocksSetConfig(
        mocksServerConfig: MocksServerConfig,
      ): Promise<void>

      /**
       * Define a route variant to be used instead of the one defined in the current collection.
       * @param routeVariantId - Route variant id to be used
       * @example cy.mocksUseRouteVariant("variant-id")
       */
      mocksUseRouteVariant(
        routeVariantId: RouteVariantId,
      ): Promise<void>

      /**
       * Restore current collection route variants. It removes all variants defined with the mocksUseRouteVariant command.
       * @example cy.mocksRestoreRouteVariants()
       */
      mocksRestoreRouteVariants(): Promise<void>

      /**
      * Changes the configuration of the Mocks Server administration API client, used by the plugin commands to communicate with Mocks Server
      * @param apiClientConfig - Admin API client configuration
      * @example cy.mocksConfigAdminApiClient({ port: 3210 })
      */
      mocksConfigAdminApiClient(apiClientConfig: MocksServerCypressApiClientConfig): Promise<void>
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
