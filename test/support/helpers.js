import { config } from "../../index";

config({
  baseUrl: "http://localhost:3200",
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
