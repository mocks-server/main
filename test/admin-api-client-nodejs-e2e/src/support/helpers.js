const { configClient } = require("@mocks-server/admin-api-client");

configClient({
  port: 3110,
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
