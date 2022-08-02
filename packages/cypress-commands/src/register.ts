
import { commands } from "./commands";

export function register(Cyp: typeof Cypress) {
  const {
    configClient,
    setCollection,
    setDelay,
    setConfig,
    useRouteVariant,
    restoreRouteVariants,
  } = commands(Cyp);

  Cyp.Commands.add("mocksSetCollection", setCollection);
  Cyp.Commands.add("mocksSetDelay", setDelay);
  Cyp.Commands.add("mocksSetConfig", setConfig);
  Cyp.Commands.add("mocksUseRouteVariant", useRouteVariant);
  Cyp.Commands.add("mocksRestoreRouteVariants", restoreRouteVariants);

  Cyp.Commands.add("mocksConfigAdminApiClient", configClient);
  Cyp.Commands.add("mocksConfigClient", configClient);
}
