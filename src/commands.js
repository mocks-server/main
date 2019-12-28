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

// TODO, remove when admin-api-client supports adminApiPath option
const mapConfig = customConfig => {
  const configToSet = customConfig;
  if (customConfig.adminApiPath) {
    configToSet.apiPath = customConfig.adminApiPath;
  }
  return config(configToSet);
};

module.exports = {
  setBehavior,
  setDelay,
  setSettings,
  config: mapConfig
};
