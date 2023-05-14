import { commands } from "./Commands";

export function register(Cyp: typeof Cypress, CypCy: typeof cy) {
  const {
    configClient,
    setCollection,
    setDelay,
    setConfig,
    useRouteVariant,
    restoreRouteVariants,
  } = commands(Cyp, CypCy);

  Cyp.Commands.add("mocksSetCollection", setCollection);
  Cyp.Commands.add("mocksSetDelay", setDelay);
  Cyp.Commands.add("mocksSetConfig", setConfig);
  Cyp.Commands.add("mocksUseRouteVariant", useRouteVariant);
  Cyp.Commands.add("mocksRestoreRouteVariants", restoreRouteVariants);
  Cyp.Commands.add("mocksConfigClient", configClient);
}
