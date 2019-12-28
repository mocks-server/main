const { setBehavior, setDelay, setSettings } = require("./commands");

const register = Cypress => {
  Cypress.Commands.add("mocksServerSetBehavior", setBehavior);
  Cypress.Commands.add("mocksServerSetDelay", setDelay);
  Cypress.Commands.add("mocksServerSetSettings", setSettings);
};

module.exports = register;
