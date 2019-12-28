const { Behavior } = require("@mocks-server/main");

const getStandard = {
  url: "/api/response",
  method: "GET",
  response: {
    status: 200,
    body: { display: "standard-response" }
  }
};

const getCustom = {
  url: "/api/response",
  method: "GET",
  response: {
    status: 200,
    body: { display: "custom-response" }
  }
};

const standard = new Behavior([getStandard]);

const custom = new Behavior([getCustom]);

module.exports = {
  standard,
  custom
};
