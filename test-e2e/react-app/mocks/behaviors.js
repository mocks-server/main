const { Behavior } = require("@mocks-server/main");

const { getUser } = require("./fixtures");

const base = new Behavior([getUser]);

module.exports = {
  base
};
