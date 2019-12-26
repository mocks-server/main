const register = Cypress => {
  Cypress.Commands.add("mocksServerChangeBehavior");
  Cypress.Commands.add("mocksServerChangeDelay");
  Cypress.Commands.add("mocksServerChangeSettings");
};

module.exports = register;
