const uglifier = require("rollup-plugin-uglify");
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const babel = require("rollup-plugin-babel");

const BASE_CONFIG = {
  input: "index.js",
  external: ["@data-provider/core", "@data-provider/axios", "@mocks-server/admin-api-paths"]
};

const GLOBALS = {
  "@data-provider/core": "dataProvider",
  "@data-provider/axios": "dataProviderAxios",
  "@mocks-server/admin-api-paths": "pluginAdminApiPaths"
};

const BASE_PLUGINS = [
  resolve({
    mainFields: ["module", "main", "jsnext"],
    browser: true,
    preferBuiltins: true
  }),
  commonjs({
    include: "node_modules/**"
  }),
  babel({
    babelrc: false,
    presets: ["@babel/env"]
  })
];

module.exports = [
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.cjs.js",
      format: "cjs"
    },
    plugins: BASE_PLUGINS
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.umd.js",
      format: "umd",
      name: "mocksServerAdminApiClientDataProvider",
      globals: GLOBALS
    },
    plugins: [...BASE_PLUGINS, uglifier.uglify()]
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.esm.js",
      format: "esm",
      globals: GLOBALS
    },
    plugins: BASE_PLUGINS
  }
];
