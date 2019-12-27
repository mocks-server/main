const { settings, config } = require("@mocks-server/admin-api-client");

const setBehavior = behavior => {
  return settings.update({
    behavior
  });
};

const setDelay = delay => {
  return settings.update({
    delay
  });
};

const setSettings = newSettings => {
  return settings.update(newSettings);
};

module.exports = {
  setBehavior,
  setDelay,
  setSettings,
  config
};
