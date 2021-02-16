const commands = require("./commands");

const register = (Cypress) => {
  const {
    config,
    setMock,
    setDelay,
    setSettings,
    useRouteVariant,
    restoreRoutesVariants,
    setBehavior,
  } = commands(Cypress);

  Cypress.Commands.add("mocksConfig", config);
  Cypress.Commands.add("mocksSetMock", setMock);
  Cypress.Commands.add("mocksSetDelay", setDelay);
  Cypress.Commands.add("mocksSetSettings", setSettings);
  Cypress.Commands.add("mocksUseRouteVariant", useRouteVariant);
  Cypress.Commands.add("mocksRestoreRoutesVariants", restoreRoutesVariants);

  //legacy
  Cypress.Commands.add("mocksSetBehavior", setBehavior);
};

module.exports = register;
