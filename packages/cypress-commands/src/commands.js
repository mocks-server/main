const apiClient = require("@mocks-server/admin-api-client");

const {
  isFalsy,
  ENABLED_ENVIRONMENT_VAR,
  ADMIN_API_PORT_ENVIRONMENT_VAR,
  ADMIN_API_HOST_ENVIRONMENT_VAR,
} = require("./helpers");

function commands(Cypress) {
  const isDisabled = () => {
    return isFalsy(Cypress.env(ENABLED_ENVIRONMENT_VAR));
  };

  const doNothing = () => {
    return Promise.resolve();
  };

  const setCollection = (id) => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.updateConfig({
      mock: {
        collections: { selected: id },
      },
    });
  };

  const setDelay = (delay) => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.updateConfig({
      mock: {
        routes: { delay },
      },
    });
  };

  const setConfig = (newConfig) => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.updateConfig(newConfig);
  };

  const useRouteVariant = (id) => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.useRouteVariant(id);
  };

  const restoreRouteVariants = () => {
    if (isDisabled()) {
      return doNothing();
    }
    return apiClient.restoreRouteVariants();
  };

  const configClient = (customConfig) => {
    return apiClient.configClient(customConfig);
  };

  if (Cypress.env(ADMIN_API_PORT_ENVIRONMENT_VAR)) {
    configClient({ port: Cypress.env(ADMIN_API_PORT_ENVIRONMENT_VAR) });
  }
  if (Cypress.env(ADMIN_API_HOST_ENVIRONMENT_VAR)) {
    configClient({ host: Cypress.env(ADMIN_API_HOST_ENVIRONMENT_VAR) });
  }

  return {
    setCollection,
    setDelay,
    setConfig,
    useRouteVariant,
    restoreRouteVariants,
    configClient,
  };
}

module.exports = commands;
