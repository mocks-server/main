const apiClient = require("@mocks-server/admin-api-client");

const setBehavior = (behavior) => {
  return apiClient.updateSettings({
    behavior,
  });
};

const setMock = (id) => {
  return apiClient.updateSettings({
    mock: id,
  });
};

const setDelay = (delay) => {
  return apiClient.updateSettings({
    delay,
  });
};

const setSettings = (newSettings) => {
  return apiClient.updateSettings(newSettings);
};

const useRouteVariant = (id) => {
  return apiClient.addMockCustomRouteVariant(id);
};

const restoreRoutesVariants = () => {
  return apiClient.restoreMockRoutesVariants();
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
  return apiClient.config(configToSet);
};

module.exports = {
  setBehavior,
  setMock,
  setDelay,
  setSettings,
  config: mapConfig,
  useRouteVariant,
  restoreRoutesVariants,
};
