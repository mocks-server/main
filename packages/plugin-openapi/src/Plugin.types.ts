import type { ScopedCoreInterface, PluginId } from "@mocks-server/core";

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
