import type { OptionDefinition, GetOptionValueTypeFromDefinition } from "@mocks-server/config";
import type { ScopedCoreInterface, PluginId } from "@mocks-server/core";

export type CollectionIdOptionDefinition = OptionDefinition<
  string,
  { hasDefault: true; nullable: true }
>;
export type CollectionFromOptionDefinition = OptionDefinition<string>;

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface PluginsConfig {
      openapi?: {
        collection?: {
          id?: GetOptionValueTypeFromDefinition<CollectionIdOptionDefinition>;
          from?: GetOptionValueTypeFromDefinition<CollectionFromOptionDefinition>;
        };
      };
    }
  }
}

/** Plugin constructor */
export interface PluginConstructor {
  /**
   * Creates a plugin instance
   * @param core - Mocks Server core {@link Core}
   * @returns Root collection
   * @example const collection = new Collection("id")
   */
  new (core: ScopedCoreInterface): PluginInterface;
  get id(): PluginId;
}

/** Plugin interface */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginInterface {}
