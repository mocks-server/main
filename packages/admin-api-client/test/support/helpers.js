const waitOn = require("wait-on");

import { configClient } from "../../index";

configClient({
  port: 3110,
  host: "127.0.0.1",
});

const wait = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const waitForServer = (port) => {
  return waitOn({ resources: [`tcp:127.0.0.1:${port}`] });
};

module.exports = {
  wait,
  waitForServer,
};
