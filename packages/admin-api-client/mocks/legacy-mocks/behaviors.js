const { Behavior } = require("@mocks-server/main");

const { getUser, getUser2 } = require("./fixtures");

const base = new Behavior([getUser]);
const user2 = new Behavior([getUser2]);

module.exports = {
  base,
  user2,
};
