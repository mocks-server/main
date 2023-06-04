import type { ScopedCoreInterface, PluginInterface, PluginConstructor } from "@mocks-server/core";

import { ProxyVariantHandler } from "./ProxyVariantHandler";

export const Plugin: PluginConstructor = class Plugin implements PluginInterface {
  constructor({ variantHandlers }: ScopedCoreInterface) {
    variantHandlers.register([ProxyVariantHandler]);
  }

  public static get id() {
    return "proxyVariantsHandler";
  }
};
