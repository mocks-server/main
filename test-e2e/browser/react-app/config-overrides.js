const path = require("path");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");

module.exports = config => {
  config.resolve.plugins = config.resolve.plugins.filter(
    plugin => !(plugin instanceof ModuleScopePlugin)
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
      "core.cjs"
    )
  };
  return config;
};
