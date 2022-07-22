import { configClient } from "../../index";

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
