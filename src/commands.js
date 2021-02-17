const apiClient = require("@mocks-server/admin-api-client");

const {
  isFalsy,
  ENABLED_ENVIRONMENT_VAR,
  BASE_URL_ENVIRONMENT_VAR,
  ADMIN_API_PATH_ENVIRONMENT_VAR,
} = require("./helpers");

function commands(Cypress) {
  const isDisabled = () => {
    return isFalsy(Cypress.env(ENABLED_ENVIRONMENT_VAR));
  };

  const doNothing = () => {
    return Promise.resolve();
  };

  const setBehavior = (behavior) => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.updateSettings({
      behavior,
    });
  };

  const setMock = (id) => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.updateSettings({
      mock: id,
    });
  };

  const setDelay = (delay) => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.updateSettings({
      delay,
    });
  };

  const setSettings = (newSettings) => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.updateSettings(newSettings);
  };

  const useRouteVariant = (id) => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.useRouteVariant(id);
  };

  const restoreRoutesVariants = () => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.restoreRoutesVariants();
  };

  const config = (customConfig) => {
    return apiClient.config(customConfig);
  };

  if (Cypress.env(ADMIN_API_PATH_ENVIRONMENT_VAR)) {
    config({ adminApiPath: Cypress.env(ADMIN_API_PATH_ENVIRONMENT_VAR) });
  }
  if (Cypress.env(BASE_URL_ENVIRONMENT_VAR)) {
    config({ baseUrl: Cypress.env(BASE_URL_ENVIRONMENT_VAR) });
  }

  return {
    setBehavior,
    setMock,
    setDelay,
    setSettings,
    config,
    useRouteVariant,
    restoreRoutesVariants,
  };
}

module.exports = commands;
