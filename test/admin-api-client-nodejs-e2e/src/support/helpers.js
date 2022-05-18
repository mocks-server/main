const { config } = require("@mocks-server/admin-api-client");

config({
  baseUrl: "http://127.0.0.1:3200",
});

const wait = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

module.exports = {
  wait,
};
