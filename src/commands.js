const adminApiClient = require("@mocks-server/admin-api-client");

const setBehavior = (behavior) => {
  return adminApiClient.settings.update({
    behavior,
  });
};

const setDelay = (delay) => {
  return adminApiClient.settings.update({
    delay,
  });
};

const setSettings = (newSettings) => {
  return adminApiClient.settings.update(newSettings);
};

// TODO, remove when admin-api-client supports adminApiPath option
const mapConfig = (customConfig) => {
  const configToSet = {};
  if (customConfig.adminApiPath) {
    configToSet.apiPath = customConfig.adminApiPath;
  }
  if (customConfig.baseUrl) {
    configToSet.baseUrl = customConfig.baseUrl;
  }
  return adminApiClient.config(configToSet);
};

module.exports = {
  setBehavior,
  setDelay,
  setSettings,
  config: mapConfig,
};
