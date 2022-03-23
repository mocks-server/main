const { Behavior } = require("@mocks-server/main");

const getStandard = {
  url: "/api/legacy-response",
  method: "GET",
  response: {
    status: 200,
    body: { display: "legacy-standard-response" },
  },
};

const getCustom = {
  url: "/api/legacy-response",
  method: "GET",
  response: {
    status: 200,
    body: { display: "legacy-custom-response" },
  },
};

const standard = new Behavior([getStandard]);

const custom = new Behavior([getCustom]);

module.exports = {
  standard,
  custom,
};
