/* global Cypress */

const { config } = require("./src/commands");
const register = require("./src/register");

register(Cypress);

module.exports = {
  config,
};
