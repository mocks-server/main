const commands = require("./commands");

const register = (Cypress) => {
  const {
    configClient,
    setCollection,
    setDelay,
    setConfig,
    useRouteVariant,
    restoreRouteVariants,
  } = commands(Cypress);

  Cypress.Commands.add("mocksSetCollection", setCollection);
  Cypress.Commands.add("mocksSetDelay", setDelay);
  Cypress.Commands.add("mocksSetConfig", setConfig);
  Cypress.Commands.add("mocksUseRouteVariant", useRouteVariant);
  Cypress.Commands.add("mocksRestoreRouteVariants", restoreRouteVariants);

  Cypress.Commands.add("mocksConfigAdminApiClient", configClient);
};

module.exports = register;
