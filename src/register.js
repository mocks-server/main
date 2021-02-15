const {
  setBehavior,
  setDelay,
  setMock,
  setSettings,
  useRouteVariant,
  restoreRoutesVariants,
} = require("./commands");

const register = (Cypress) => {
  Cypress.Commands.add("mocksSetMock", setMock);
  Cypress.Commands.add("mocksSetDelay", setDelay);
  Cypress.Commands.add("mocksSetSettings", setSettings);
  Cypress.Commands.add("mocksUseRouteVariant", useRouteVariant);
  Cypress.Commands.add("mocksRestoreRoutesVariants", restoreRoutesVariants);

  //legacy
  Cypress.Commands.add("mocksSetBehavior", setBehavior);
};

module.exports = register;
