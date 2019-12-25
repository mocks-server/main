const path = require("path");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");

module.exports = config => {
  config.resolve.plugins = config.resolve.plugins.filter(
    plugin => !(plugin instanceof ModuleScopePlugin)
  );
  config.resolve.alias = {
    ...config.resolve.alias,
    "mocks-server-admin-api-client": path.resolve(__dirname, "..", "..", "..")
  };
  return config;
};
