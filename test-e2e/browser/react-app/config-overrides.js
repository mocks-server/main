const path = require("path");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const EslintPlugin = require("eslint-webpack-plugin");

function removeEslintPlugin(config) {
  let eslintPluginIndex;
  config.plugins.forEach((plugin, pluginIndex) => {
    if (plugin instanceof EslintPlugin) {
      eslintPluginIndex = pluginIndex;
    }
  });
  if (eslintPluginIndex) {
    config.plugins.splice(eslintPluginIndex, 1);
  }
  return config;
}

module.exports = (config) => {
  removeEslintPlugin(config);
  config.resolve.plugins = config.resolve.plugins.filter(
    (plugin) => !(plugin instanceof ModuleScopePlugin)
  );
  config.resolve.alias = {
    ...config.resolve.alias,
    "@mocks-server/admin-api-client-data-provider": path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "dist",
      "index.cjs"
    ),
    "@data-provider/core": path.resolve(
      __dirname,
      "node_modules",
      "@data-provider",
      "core",
      "dist",
      "index.cjs"
    ),
  };
  return config;
};
