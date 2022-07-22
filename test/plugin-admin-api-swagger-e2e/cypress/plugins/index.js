module.exports = (on, config) => {
  require("cypress-fail-fast/plugin")(on, config);
  return config;
};
